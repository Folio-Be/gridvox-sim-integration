"""
POC Experiment 1: Baseline Metrics
==================================
Compute similarity metrics between existing liveries to establish benchmarks.

This tells us:
- How similar are different liveries? (sets floor for our predictions)
- How consistent are multi-view showroom photos? (sets target for rendering)
- What SSIM/LPIPS scores represent "good" quality?
"""

import torch
import numpy as np
from pathlib import Path
from PIL import Image
import matplotlib.pyplot as plt
from skimage.metrics import structural_similarity as ssim
import cv2

# Try to import LPIPS (perceptual metric)
try:
    import lpips
    LPIPS_AVAILABLE = True
except ImportError:
    LPIPS_AVAILABLE = False
    print("LPIPS not available - install with: pip install lpips")


def load_image(path, size=(512, 512)):
    """Load and resize image"""
    img = Image.open(path).convert('RGB')
    img = img.resize(size, Image.Resampling.LANCZOS)
    return np.array(img)


def compute_ssim(img1, img2):
    """Compute SSIM between two images"""
    # SSIM expects grayscale or same channel count
    if len(img1.shape) == 3:
        # Compute per-channel and average
        ssim_r = ssim(img1[:,:,0], img2[:,:,0], data_range=255)
        ssim_g = ssim(img1[:,:,1], img2[:,:,1], data_range=255)
        ssim_b = ssim(img1[:,:,2], img2[:,:,2], data_range=255)
        return (ssim_r + ssim_g + ssim_b) / 3
    return ssim(img1, img2, data_range=255)


def compute_lpips(img1, img2, lpips_fn):
    """Compute LPIPS perceptual distance"""
    # Convert to tensors [-1, 1]
    img1_t = torch.from_numpy(img1).permute(2, 0, 1).float() / 127.5 - 1
    img2_t = torch.from_numpy(img2).permute(2, 0, 1).float() / 127.5 - 1
    
    # Add batch dimension
    img1_t = img1_t.unsqueeze(0)
    img2_t = img2_t.unsqueeze(0)
    
    # Compute distance
    with torch.no_grad():
        dist = lpips_fn(img1_t, img2_t)
    
    return dist.item()


def analyze_uv_similarity():
    """Compare UV textures to each other"""
    print("\n" + "="*60)
    print("EXPERIMENT 1: UV Texture Similarity")
    print("="*60)
    print("Comparing body1.png through body5.png for Ginetta G55 GT4")
    print("This shows how different real liveries are from each other.\n")
    
    base_path = Path("../examples/gt4_skins/Automobilista 2/Vehicles/Textures/CustomLiveries/Overrides/ginetta_g55_gt4_2/GIN")
    
    # Load all body textures
    bodies = []
    for i in range(1, 6):
        body_file = base_path / f"body{i}.png"
        if body_file.exists():
            bodies.append((f"body{i}", load_image(body_file, size=(1024, 1024))))
    
    print(f"Loaded {len(bodies)} UV textures")
    
    # Initialize LPIPS if available
    lpips_fn = None
    if LPIPS_AVAILABLE:
        lpips_fn = lpips.LPIPS(net='alex')
        print("LPIPS metric available (using AlexNet)")
    
    # Compare each pair
    results = []
    for i in range(len(bodies)):
        for j in range(i+1, len(bodies)):
            name1, img1 = bodies[i]
            name2, img2 = bodies[j]
            
            ssim_score = compute_ssim(img1, img2)
            
            lpips_score = None
            if lpips_fn:
                lpips_score = compute_lpips(img1, img2, lpips_fn)
            
            results.append({
                'pair': f"{name1} vs {name2}",
                'ssim': ssim_score,
                'lpips': lpips_score
            })
            
            print(f"{name1:6s} vs {name2:6s}  |  SSIM: {ssim_score:.4f}", end="")
            if lpips_score is not None:
                print(f"  |  LPIPS: {lpips_score:.4f}")
            else:
                print()
    
    # Summary statistics
    ssim_values = [r['ssim'] for r in results]
    print(f"\n{'='*60}")
    print(f"UV Texture Similarity Statistics:")
    print(f"  Average SSIM: {np.mean(ssim_values):.4f} ± {np.std(ssim_values):.4f}")
    print(f"  Min SSIM:     {np.min(ssim_values):.4f}")
    print(f"  Max SSIM:     {np.max(ssim_values):.4f}")
    
    if LPIPS_AVAILABLE:
        lpips_values = [r['lpips'] for r in results if r['lpips'] is not None]
        print(f"\n  Average LPIPS: {np.mean(lpips_values):.4f} ± {np.std(lpips_values):.4f}")
        print(f"  Min LPIPS:     {np.min(lpips_values):.4f}")
        print(f"  Max LPIPS:     {np.max(lpips_values):.4f}")
    
    print(f"\n{'='*60}\n")
    
    return results


def analyze_showroom_consistency():
    """Compare showroom photos from different angles"""
    print("\n" + "="*60)
    print("EXPERIMENT 2: Multi-View Showroom Consistency")
    print("="*60)
    print("Comparing showroom_2a.JPG and showroom_2b.JPG")
    print("This shows rendering consistency across viewpoints.\n")
    
    base_path = Path("../examples/gt4_skins/Automobilista 2/Vehicles/Textures/CustomLiveries/Overrides/ginetta_g55_gt4_2/GIN")
    
    showroom_a = base_path / "showroom 2a.JPG"
    showroom_b = base_path / "showroom 2b.JPG"
    
    if not (showroom_a.exists() and showroom_b.exists()):
        print("ERROR: Showroom photos not found!")
        return None
    
    img_a = load_image(showroom_a)
    img_b = load_image(showroom_b)
    
    print(f"Loaded showroom photos: {img_a.shape}")
    
    # Compute metrics
    ssim_score = compute_ssim(img_a, img_b)
    print(f"\nSSIM between views: {ssim_score:.4f}")
    
    if LPIPS_AVAILABLE:
        lpips_fn = lpips.LPIPS(net='alex')
        lpips_score = compute_lpips(img_a, img_b, lpips_fn)
        print(f"LPIPS between views: {lpips_score:.4f}")
    
    print(f"\n{'='*60}")
    print("NOTE: Low SSIM is expected (different camera angles)")
    print("But features should be perceptually similar")
    print(f"{'='*60}\n")
    
    return {'ssim': ssim_score, 'lpips': lpips_score if LPIPS_AVAILABLE else None}


def analyze_preview_consistency():
    """Compare preview images (side-view renders)"""
    print("\n" + "="*60)
    print("EXPERIMENT 3: Preview Image Consistency")
    print("="*60)
    print("Comparing preview1-5.png (same angle, different liveries)\n")
    
    base_path = Path("../examples/gt4_skins/Automobilista 2/Vehicles/Textures/CustomLiveries/Overrides/ginetta_g55_gt4_2/GIN")
    
    # Load all previews
    previews = []
    for i in range(1, 6):
        preview_file = base_path / f"preview{i}.png"
        if preview_file.exists():
            previews.append((f"preview{i}", load_image(preview_file)))
    
    print(f"Loaded {len(previews)} preview images")
    
    # Compare pairs
    lpips_fn = None
    if LPIPS_AVAILABLE:
        lpips_fn = lpips.LPIPS(net='alex')
    
    for i in range(len(previews)):
        for j in range(i+1, len(previews)):
            name1, img1 = previews[i]
            name2, img2 = previews[j]
            
            ssim_score = compute_ssim(img1, img2)
            
            print(f"{name1} vs {name2}  |  SSIM: {ssim_score:.4f}", end="")
            
            if lpips_fn:
                lpips_score = compute_lpips(img1, img2, lpips_fn)
                print(f"  |  LPIPS: {lpips_score:.4f}")
            else:
                print()
    
    print(f"\n{'='*60}\n")


def visualize_comparison():
    """Create visual comparison of body textures"""
    print("\n" + "="*60)
    print("EXPERIMENT 4: Visual Comparison")
    print("="*60)
    
    base_path = Path("../examples/gt4_skins/Automobilista 2/Vehicles/Textures/CustomLiveries/Overrides/ginetta_g55_gt4_2/GIN")
    
    # Load body2 and showroom photos
    body2 = load_image(base_path / "body2.png", size=(512, 512))
    showroom_a = load_image(base_path / "showroom 2a.JPG", size=(512, 512))
    showroom_b = load_image(base_path / "showroom 2b.JPG", size=(512, 512))
    
    # Create figure
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    
    axes[0].imshow(body2)
    axes[0].set_title("UV Texture (body2.png)")
    axes[0].axis('off')
    
    axes[1].imshow(showroom_a)
    axes[1].set_title("Showroom View A")
    axes[1].axis('off')
    
    axes[2].imshow(showroom_b)
    axes[2].set_title("Showroom View B")
    axes[2].axis('off')
    
    plt.tight_layout()
    
    # Save
    output_file = Path("poc_results/baseline_comparison.png")
    output_file.parent.mkdir(exist_ok=True)
    plt.savefig(output_file, dpi=150)
    print(f"\nSaved visualization to: {output_file}")
    
    plt.show()
    
    print(f"{'='*60}\n")


def main():
    """Run all baseline experiments"""
    print("\n" + "="*60)
    print("BASELINE METRICS - POC EXPERIMENT 1")
    print("="*60)
    print("\nGoal: Establish quality benchmarks for self-supervised learning")
    print("\nWe will measure:")
    print("  1. How similar are different liveries (UV textures)?")
    print("  2. How consistent are multi-view showroom photos?")
    print("  3. What SSIM/LPIPS scores represent 'good' quality?")
    print("\n" + "="*60)
    
    # Run experiments
    uv_results = analyze_uv_similarity()
    showroom_results = analyze_showroom_consistency()
    analyze_preview_consistency()
    visualize_comparison()
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY & INTERPRETATION")
    print("="*60)
    
    print("\n1. UV Texture Similarity (body*.png)")
    print("   - If SSIM > 0.5: Liveries share common structure")
    print("   - If SSIM < 0.3: Very different designs")
    print("   → Our network should achieve SSIM > 0.6 vs ground truth")
    
    print("\n2. Showroom Photo Consistency")
    print("   - Low SSIM is expected (different angles)")
    print("   - LPIPS should be moderate (<0.5)")
    print("   → Renderer doesn't need perfect photorealism")
    
    print("\n3. Training Target")
    if uv_results:
        avg_uv_ssim = np.mean([r['ssim'] for r in uv_results])
        print(f"   - Minimum acceptable SSIM: {avg_uv_ssim:.4f}")
        print(f"   - Target SSIM for POC: {avg_uv_ssim + 0.1:.4f}")
        print(f"   - Production target: 0.85+")
    
    print("\n" + "="*60)
    print("NEXT STEP: If these metrics look reasonable,")
    print("proceed to POC #2 (Cycle Consistency Test)")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
