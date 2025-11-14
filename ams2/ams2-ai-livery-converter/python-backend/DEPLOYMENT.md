# AI Livery Designer - Deployment Guide

## Model Distribution Strategy

### Current Size: ~25 GB
- SDXL Base Model: 6.5 GB
- UNet (fp16): 4.8 GB  
- Text Encoders: 2.6 GB + 1.3 GB
- ControlNet Depth: 2.3 GB
- VAE: 0.3 GB
- Config files: ~200 MB

## Distribution Options

### Option 1: User Downloads on First Launch (Recommended for POC)
**Pros:**
- Small initial installer (~100 MB)
- Only downloads if user wants AI features
- Easier to update models

**Cons:**
- Requires 25 GB download on first use
- Needs internet connection
- 10-30 minute setup time

**Implementation:**
```python
# In main.py startup
from check_models import check_models

if not check_models():
    # Show UI: "Download AI models? (25 GB)"
    # Run download_models.py with progress bar
```

### Option 2: Pre-packaged Installer
**Pros:**
- Works offline immediately
- No setup friction
- Professional user experience

**Cons:**
- 25+ GB installer download
- Slower distribution/updates
- Wasted space if user doesn't use AI

**Implementation:**
- Include `models/` folder in installer
- Use compression (LZMA can reduce to ~18 GB)
- Consider split archives for easier download

### Option 3: Hybrid (Recommended for Production)
**Best of both worlds:**
1. Ship with base SDXL model only (~7 GB)
2. Download ControlNet on demand
3. Let users choose quality (fp16 vs full precision)

**Size breakdown:**
- Minimal install: 7 GB (SDXL only)
- Full install: 25 GB (all features)
- User choice during setup

## Week 2 POC Recommendation

✅ **Use Option 1** - User downloads on demand
- Fast iteration during development
- Easy to test different models
- Matches POC-08 TTS approach
- Production decision deferred until Week 8

## Future Optimizations

### Model Quantization (Week 6+)
- 4-bit quantization: ~6 GB total (75% reduction)
- Trade-off: Slight quality loss
- Tools: bitsandbytes, GPTQ

### Model Sharing
- HuggingFace cache: `~/.cache/huggingface/`
- Multiple projects share same models
- Saves disk space across SimVox.ai ecosystem

### On-Demand Streaming (Advanced)
- Load model layers progressively
- Start generating while downloading
- Complex but best UX

## Installation Script Enhancement

Add to `download_models.py`:
```python
# Show progress in MB/s
# Estimate time remaining  
# Resume interrupted downloads
# Verify checksums
```

## Next Steps

1. ✅ Week 2: Basic download works
2. Week 3: Add progress bar to UI
3. Week 4: Add resume capability
4. Week 8: Decide production strategy
