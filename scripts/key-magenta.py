"""Key flat-magenta window panes to transparent.

    python3 scripts/key-magenta.py <input image> <output.png> [width height]

Magenta-ness is min(R, B) - G: high only where red and blue are both well
above green, which a dark cockpit with amber and teal lights never is.
Pixels past the threshold go fully transparent, the edge is feathered over
about a pixel, and leftover magenta spill on the frame edges is pulled back
toward neutral.
"""
import sys

import numpy as np
from PIL import Image, ImageFilter

src, dst = sys.argv[1], sys.argv[2]
size = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else None

image = Image.open(src).convert("RGB")
if size:
    image = image.resize(size, Image.LANCZOS)
rgb = np.asarray(image).astype(np.float32)
r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]

magenta = np.minimum(r, b) - g
low, high = 60.0, 140.0  # fully opaque below, fully transparent above
alpha = 1.0 - np.clip((magenta - low) / (high - low), 0.0, 1.0)

# Close pinholes (JPEG noise inside the pane) and feather the edge ~1 px.
mask = Image.fromarray((alpha * 255).astype(np.uint8))
mask = mask.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
mask = mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
mask = mask.filter(ImageFilter.GaussianBlur(0.8))
alpha = np.asarray(mask).astype(np.float32) / 255.0

# Despill: wherever magenta remains, clamp red and blue down toward green.
spill = np.clip(magenta / high, 0.0, 1.0)[..., None]
neutral = np.minimum(rgb, g[..., None] + 18.0)
rgb = rgb * (1.0 - spill) + neutral * spill

out = np.dstack([np.clip(rgb, 0, 255), alpha * 255.0]).astype(np.uint8)
Image.fromarray(out, "RGBA").save(dst, optimize=True)
clear = float((alpha < 0.05).mean())
print(f"saved {dst}: {out.shape[1]}x{out.shape[0]}, {clear:.0%} transparent")
