"""
POC Experiment 2: Cycle Consistency Learning
============================================
Test if we can learn UV mapping through cycle consistency:

Forward:  3D_view → [UV Predictor] → UV_texture → [Renderer] → 3D_view_reconstructed
Backward: UV_texture → [Renderer] → 3D_view → [UV Predictor] → UV_texture_reconstructed

This is the CRITICAL test - if this works, the full approach is viable!
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from pathlib import Path
from PIL import Image
import numpy as np
from tqdm import tqdm
import matplotlib.pyplot as plt

print("\n" + "="*60)
print("POC EXPERIMENT 2: Cycle Consistency Learning")
print("="*60)
print("\nThis is the MAKE-OR-BREAK experiment!")
print("If cycle consistency loss decreases, the approach works.\n")
print("="*60 + "\n")


# ============================================================
# Part 1: Simple Dataset
# ============================================================

class LiveryDataset(Dataset):
    """Dataset of UV textures and showroom photos"""
    
    def __init__(self, base_path, transform_size=256):
        self.base_path = Path(base_path)
        self.transform_size = transform_size
        
        # Find all body*.png and showroom*.jpg pairs
        self.pairs = []
        
        # For now, use body2 with showroom 2a and 2b
        body2 = self.base_path / "body2.png"
        showroom_a = self.base_path / "showroom 2a.JPG"
        showroom_b = self.base_path / "showroom 2b.JPG"
        
        if body2.exists() and showroom_a.exists():
            self.pairs.append({'uv': body2, 'view': showroom_a})
        if body2.exists() and showroom_b.exists():
            self.pairs.append({'uv': body2, 'view': showroom_b})
        
        # Add other bodies with their previews (side view)
        for i in range(1, 6):
            body = self.base_path / f"body{i}.png"
            preview = self.base_path / f"preview{i}.png"
            if body.exists() and preview.exists():
                self.pairs.append({'uv': body, 'view': preview})
        
        print(f"Dataset: Found {len(self.pairs)} UV-view pairs")
    
    def __len__(self):
        return len(self.pairs)
    
    def __getitem__(self, idx):
        pair = self.pairs[idx]
        
        # Load images
        uv = Image.open(pair['uv']).convert('RGB')
        view = Image.open(pair['view']).convert('RGB')
        
        # Resize
        uv = uv.resize((self.transform_size, self.transform_size), Image.Resampling.LANCZOS)
        view = view.resize((self.transform_size, self.transform_size), Image.Resampling.LANCZOS)
        
        # Convert to tensors [-1, 1]
        uv = torch.from_numpy(np.array(uv)).permute(2, 0, 1).float() / 127.5 - 1
        view = torch.from_numpy(np.array(view)).permute(2, 0, 1).float() / 127.5 - 1
        
        return {'uv': uv, 'view': view}


# ============================================================
# Part 2: Simple Networks
# ============================================================

class UVPredictor(nn.Module):
    """Predicts UV texture from 3D view"""
    
    def __init__(self, size=256):
        super().__init__()
        
        # Simple encoder-decoder (U-Net style)
        # Encoder
        self.enc1 = nn.Sequential(
            nn.Conv2d(3, 64, 4, 2, 1),  # -> 128
            nn.ReLU()
        )
        self.enc2 = nn.Sequential(
            nn.Conv2d(64, 128, 4, 2, 1),  # -> 64
            nn.BatchNorm2d(128),
            nn.ReLU()
        )
        self.enc3 = nn.Sequential(
            nn.Conv2d(128, 256, 4, 2, 1),  # -> 32
            nn.BatchNorm2d(256),
            nn.ReLU()
        )
        self.enc4 = nn.Sequential(
            nn.Conv2d(256, 512, 4, 2, 1),  # -> 16
            nn.BatchNorm2d(512),
            nn.ReLU()
        )
        
        # Decoder
        self.dec1 = nn.Sequential(
            nn.ConvTranspose2d(512, 256, 4, 2, 1),  # -> 32
            nn.BatchNorm2d(256),
            nn.ReLU()
        )
        self.dec2 = nn.Sequential(
            nn.ConvTranspose2d(256*2, 128, 4, 2, 1),  # -> 64 (skip connection)
            nn.BatchNorm2d(128),
            nn.ReLU()
        )
        self.dec3 = nn.Sequential(
            nn.ConvTranspose2d(128*2, 64, 4, 2, 1),  # -> 128 (skip connection)
            nn.BatchNorm2d(64),
            nn.ReLU()
        )
        self.dec4 = nn.Sequential(
            nn.ConvTranspose2d(64*2, 3, 4, 2, 1),  # -> 256 (skip connection)
            nn.Tanh()  # Output in [-1, 1]
        )
    
    def forward(self, x):
        # Encoder with skip connections
        e1 = self.enc1(x)
        e2 = self.enc2(e1)
        e3 = self.enc3(e2)
        e4 = self.enc4(e3)
        
        # Decoder with skip connections
        d1 = self.dec1(e4)
        d1 = torch.cat([d1, e3], dim=1)
        
        d2 = self.dec2(d1)
        d2 = torch.cat([d2, e2], dim=1)
        
        d3 = self.dec3(d2)
        d3 = torch.cat([d3, e1], dim=1)
        
        d4 = self.dec4(d3)
        
        return d4


class SimpleRenderer(nn.Module):
    """Approximates rendering UV texture to 3D view"""
    
    def __init__(self, size=256):
        super().__init__()
        
        # This is a LEARNED renderer - it learns how AMS2 renders cars
        # In reality, this would be more sophisticated (spatial transformers, etc.)
        # For POC, simple CNN that transforms UV → view
        
        self.transform = nn.Sequential(
            nn.Conv2d(3, 64, 7, 1, 3),
            nn.ReLU(),
            nn.Conv2d(64, 64, 5, 1, 2),
            nn.ReLU(),
            nn.Conv2d(64, 128, 3, 1, 1),
            nn.ReLU(),
            nn.Conv2d(128, 128, 3, 1, 1),
            nn.ReLU(),
            nn.Conv2d(128, 64, 3, 1, 1),
            nn.ReLU(),
            nn.Conv2d(64, 3, 3, 1, 1),
            nn.Tanh()
        )
    
    def forward(self, uv):
        return self.transform(uv)


# ============================================================
# Part 3: Training Loop
# ============================================================

def train_cycle_consistency():
    """Train with cycle consistency loss"""
    
    # Setup
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # Load dataset
    data_path = Path("../examples/gt4_skins/Automobilista 2/Vehicles/Textures/CustomLiveries/Overrides/ginetta_g55_gt4_2/GIN")
    dataset = LiveryDataset(data_path, transform_size=256)
    dataloader = DataLoader(dataset, batch_size=2, shuffle=True)
    
    # Initialize networks
    uv_predictor = UVPredictor().to(device)
    renderer = SimpleRenderer().to(device)
    
    # Optimizers
    optimizer_uv = optim.Adam(uv_predictor.parameters(), lr=0.0002, betas=(0.5, 0.999))
    optimizer_renderer = optim.Adam(renderer.parameters(), lr=0.0002, betas=(0.5, 0.999))
    
    # Loss tracking
    history = {
        'cycle_loss': [],
        'uv_recon_loss': [],
        'direct_loss': [],
        'total_loss': []
    }
    
    print("\nStarting training...")
    print("If loss decreases significantly, the approach works!\n")
    
    num_epochs = 50
    
    for epoch in range(num_epochs):
        epoch_losses = {'cycle': 0, 'uv_recon': 0, 'direct': 0, 'total': 0}
        
        for batch in dataloader:
            uv_real = batch['uv'].to(device)
            view_real = batch['view'].to(device)
            
            # ========================================
            # Forward Cycle: view → UV → view
            # ========================================
            
            # Predict UV from view
            uv_predicted = uv_predictor(view_real)
            
            # Render predicted UV
            view_reconstructed = renderer(uv_predicted)
            
            # Cycle loss: reconstructed view should match input view
            L_cycle = F.l1_loss(view_reconstructed, view_real)
            
            # ========================================
            # Backward Cycle: UV → view → UV
            # ========================================
            
            # Render real UV
            view_rendered = renderer(uv_real)
            
            # Predict UV from rendered view
            uv_reconstructed = uv_predictor(view_rendered)
            
            # UV reconstruction loss
            L_uv_recon = F.l1_loss(uv_reconstructed, uv_real)
            
            # ========================================
            # Direct Supervision (when available)
            # ========================================
            
            # Direct UV supervision
            L_direct = F.l1_loss(uv_predicted, uv_real)
            
            # ========================================
            # Combined Loss
            # ========================================
            
            loss = (
                0.3 * L_cycle +
                0.3 * L_uv_recon +
                0.4 * L_direct
            )
            
            # Backprop
            optimizer_uv.zero_grad()
            optimizer_renderer.zero_grad()
            loss.backward()
            optimizer_uv.step()
            optimizer_renderer.step()
            
            # Track losses
            epoch_losses['cycle'] += L_cycle.item()
            epoch_losses['uv_recon'] += L_uv_recon.item()
            epoch_losses['direct'] += L_direct.item()
            epoch_losses['total'] += loss.item()
        
        # Average losses
        for key in epoch_losses:
            epoch_losses[key] /= len(dataloader)
            history[key + '_loss'].append(epoch_losses[key])
        
        # Print progress
        if (epoch + 1) % 5 == 0:
            print(f"Epoch {epoch+1}/{num_epochs}")
            print(f"  Cycle Loss:     {epoch_losses['cycle']:.4f}")
            print(f"  UV Recon Loss:  {epoch_losses['uv_recon']:.4f}")
            print(f"  Direct Loss:    {epoch_losses['direct']:.4f}")
            print(f"  Total Loss:     {epoch_losses['total']:.4f}")
            print()
    
    return uv_predictor, renderer, history


def visualize_results(uv_predictor, renderer, dataset, device):
    """Visualize predictions"""
    
    uv_predictor.eval()
    renderer.eval()
    
    with torch.no_grad():
        # Get first sample
        sample = dataset[0]
        uv_real = sample['uv'].unsqueeze(0).to(device)
        view_real = sample['view'].unsqueeze(0).to(device)
        
        # Predictions
        uv_predicted = uv_predictor(view_real)
        view_reconstructed = renderer(uv_predicted)
        view_from_real_uv = renderer(uv_real)
        
        # Convert to numpy for plotting
        def to_img(tensor):
            img = tensor.cpu().squeeze(0).permute(1, 2, 0).numpy()
            img = (img + 1) / 2  # [-1, 1] -> [0, 1]
            return np.clip(img, 0, 1)
        
        # Create figure
        fig, axes = plt.subplots(2, 3, figsize=(15, 10))
        
        axes[0, 0].imshow(to_img(view_real))
        axes[0, 0].set_title("Input: 3D View")
        axes[0, 0].axis('off')
        
        axes[0, 1].imshow(to_img(uv_predicted))
        axes[0, 1].set_title("Predicted UV")
        axes[0, 1].axis('off')
        
        axes[0, 2].imshow(to_img(view_reconstructed))
        axes[0, 2].set_title("Reconstructed View")
        axes[0, 2].axis('off')
        
        axes[1, 0].imshow(to_img(uv_real))
        axes[1, 0].set_title("Ground Truth UV")
        axes[1, 0].axis('off')
        
        axes[1, 1].imshow(to_img(view_from_real_uv))
        axes[1, 1].set_title("Rendered from GT UV")
        axes[1, 1].axis('off')
        
        # Show difference
        diff = torch.abs(uv_predicted - uv_real)
        axes[1, 2].imshow(to_img(diff))
        axes[1, 2].set_title("UV Prediction Error")
        axes[1, 2].axis('off')
        
        plt.tight_layout()
        
        output_file = Path("poc_results/cycle_consistency_results.png")
        output_file.parent.mkdir(exist_ok=True)
        plt.savefig(output_file, dpi=150)
        print(f"\nSaved results to: {output_file}")
        
        plt.show()


def plot_training_curves(history):
    """Plot loss curves"""
    
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))
    
    axes[0, 0].plot(history['cycle_loss'])
    axes[0, 0].set_title("Cycle Consistency Loss")
    axes[0, 0].set_xlabel("Epoch")
    axes[0, 0].set_ylabel("Loss")
    axes[0, 0].grid(True)
    
    axes[0, 1].plot(history['uv_recon_loss'])
    axes[0, 1].set_title("UV Reconstruction Loss")
    axes[0, 1].set_xlabel("Epoch")
    axes[0, 1].set_ylabel("Loss")
    axes[0, 1].grid(True)
    
    axes[1, 0].plot(history['direct_loss'])
    axes[1, 0].set_title("Direct Supervision Loss")
    axes[1, 0].set_xlabel("Epoch")
    axes[1, 0].set_ylabel("Loss")
    axes[1, 0].grid(True)
    
    axes[1, 1].plot(history['total_loss'])
    axes[1, 1].set_title("Total Loss")
    axes[1, 1].set_xlabel("Epoch")
    axes[1, 1].set_ylabel("Loss")
    axes[1, 1].grid(True)
    
    plt.tight_layout()
    
    output_file = Path("poc_results/training_curves.png")
    plt.savefig(output_file, dpi=150)
    print(f"Saved training curves to: {output_file}")
    
    plt.show()


def main():
    """Run POC experiment"""
    
    print("\n" + "="*60)
    print("EXPERIMENT SETUP")
    print("="*60)
    print("\nWe will:")
    print("1. Load 5 UV textures + their 3D views")
    print("2. Train UV Predictor and Renderer with cycle consistency")
    print("3. Check if loss decreases (proves learning is happening)")
    print("4. Visualize predictions")
    print("\n" + "="*60 + "\n")
    
    # Train
    uv_predictor, renderer, history = train_cycle_consistency()
    
    # Visualize
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    data_path = Path("../examples/gt4_skins/Automobilista 2/Vehicles/Textures/CustomLiveries/Overrides/ginetta_g55_gt4_2/GIN")
    dataset = LiveryDataset(data_path, transform_size=256)
    
    visualize_results(uv_predictor, renderer, dataset, device)
    plot_training_curves(history)
    
    # Analysis
    print("\n" + "="*60)
    print("RESULTS ANALYSIS")
    print("="*60)
    
    initial_loss = history['total_loss'][0]
    final_loss = history['total_loss'][-1]
    improvement = (initial_loss - final_loss) / initial_loss * 100
    
    print(f"\nInitial Loss:  {initial_loss:.4f}")
    print(f"Final Loss:    {final_loss:.4f}")
    print(f"Improvement:   {improvement:.1f}%")
    
    print("\n" + "="*60)
    print("INTERPRETATION")
    print("="*60)
    
    if improvement > 50:
        print("\n✅ EXCELLENT! Loss decreased significantly (>50%)")
        print("   → Cycle consistency is WORKING")
        print("   → Network is learning UV mapping patterns")
        print("   → Approach is VIABLE - proceed to full implementation!")
    elif improvement > 20:
        print("\n✓ GOOD! Loss decreased moderately (>20%)")
        print("   → Some learning is happening")
        print("   → May need better architecture or more data")
        print("   → Approach shows promise - refine and retry")
    else:
        print("\n⚠ WARNING: Loss decreased minimally (<20%)")
        print("   → Network may not be learning effectively")
        print("   → Check: architecture, learning rate, data quality")
        print("   → May need different approach or more investigation")
    
    print("\n" + "="*60)
    print("NEXT STEPS")
    print("="*60)
    
    if improvement > 20:
        print("\n1. Review visual results (cycle_consistency_results.png)")
        print("2. If predictions show UV structure, proceed to full training")
        print("3. Implement data augmentation (render from multiple angles)")
        print("4. Scale to all 6 GT4 cars")
        print("5. Integrate SDXL for detail refinement")
    else:
        print("\n1. Debug: Check if gradients are flowing")
        print("2. Try different architectures (deeper, ResNet-based)")
        print("3. Increase training data (more augmentation)")
        print("4. Consider pre-training on synthetic data")
    
    print("\n" + "="*60 + "\n")


if __name__ == "__main__":
    main()
