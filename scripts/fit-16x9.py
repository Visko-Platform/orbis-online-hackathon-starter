"""Trim letterbox / pillarbox bars and center-crop to a clean 16:9 frame.

    python3 scripts/fit-16x9.py public/worlds/*.jpg

Image models sometimes return a "cinematic" frame with black bars baked in;
fed to Orbis as an opening frame, the bars become part of the scene. Rows or
columns at the edges that are almost entirely near-black are removed, then
the image is center-cropped to 16:9 and saved at 1920x1080.
"""
import sys

import numpy as np
from PIL import Image

DARK = 18          # a pixel this dark (0–255) counts as "bar"
BAR_SHARE = 0.985  # a row/column this full of dark pixels is a bar

for path in sys.argv[1:]:
    image = Image.open(path).convert("RGB")
    pixels = np.asarray(image)
    dark = pixels.max(axis=2) < DARK
    rows = dark.mean(axis=1) >= BAR_SHARE
    cols = dark.mean(axis=0) >= BAR_SHARE

    def trim(flags):
        start, end = 0, len(flags)
        while start < end and flags[start]:
            start += 1
        while end > start and flags[end - 1]:
            end -= 1
        return start, end

    top, bottom = trim(rows)
    left, right = trim(cols)
    cropped = image.crop((left, top, right, bottom))
    w, h = cropped.size
    target = 16 / 9
    if w / h > target:
        new_w = round(h * target)
        cropped = cropped.crop(((w - new_w) // 2, 0, (w - new_w) // 2 + new_w, h))
    else:
        new_h = round(w / target)
        cropped = cropped.crop((0, (h - new_h) // 2, w, (h - new_h) // 2 + new_h))
    cropped.resize((1920, 1080), Image.LANCZOS).save(path, quality=92)
    bars = f"bars trimmed (top {top}, bottom {image.height - bottom}, left {left}, right {image.width - right})" if (top or left or bottom < image.height or right < image.width) else "no bars"
    print(f"{path}: {image.width}x{image.height} → 1920x1080, {bars}")
