#!/usr/bin/env python3
"""Generate simple PNG icons (16/48/128) for the Try It On: Omni extension.

Orange (#ff6a3d) rounded square with a white dot. Stdlib only (zlib, struct).
Run: python3 -I tools/make_icons.py   (from the extension folder, or pass an out dir)
"""
import os
import struct
import sys
import zlib

ORANGE = (0xFF, 0x6A, 0x3D)
WHITE = (0xFF, 0xFF, 0xFF)


def png_bytes(size, pixels):
    raw = bytearray()
    for row in pixels:
        raw.append(0)
        for r, g, b, a in row:
            raw += bytes((r, g, b, a))

    def chunk(tag, data):
        c = tag + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b"")


STOPS = [(0.0, (0xFF, 0xB3, 0x47)), (0.5, (0xFF, 0x6A, 0x3D)), (1.0, (0xFF, 0x3D, 0x77))]


def grad(t):
    for (t0, c0), (t1, c1) in zip(STOPS, STOPS[1:]):
        if t <= t1:
            k = (t - t0) / (t1 - t0)
            return tuple(round(a + (b - a) * k) for a, b in zip(c0, c1))
    return STOPS[-1][1]


def in_triangle(x, y, s):
    # play triangle in 32-unit space: (13.2,10.4) (13.2,21.6) (22.4,16)
    ax, ay, bx, by, cx, cy = 13.2 * s, 10.4 * s, 13.2 * s, 21.6 * s, 22.4 * s, 16 * s
    d1 = (x - bx) * (ay - by) - (ax - bx) * (y - by)
    d2 = (x - cx) * (by - cy) - (bx - cx) * (y - cy)
    d3 = (x - ax) * (cy - ay) - (cx - ax) * (y - ay)
    neg = d1 < 0 or d2 < 0 or d3 < 0
    pos = d1 > 0 or d2 > 0 or d3 > 0
    return not (neg and pos)


def icon(size, ss=4):
    s = size / 32.0
    rows = []
    for py in range(size):
        row = []
        for px in range(size):
            acc = [0, 0, 0, 0]
            for sy in range(ss):
                for sx in range(ss):
                    x = px + (sx + 0.5) / ss
                    y = py + (sy + 0.5) / ss
                    dx, dy = x - 16 * s, y - 16 * s
                    if dx * dx + dy * dy <= (15 * s) ** 2:
                        col = (255, 255, 255) if in_triangle(x, y, s) else grad(min(1, max(0, (x + y) / (2 * size))))
                        acc[0] += col[0]; acc[1] += col[1]; acc[2] += col[2]; acc[3] += 255
            n = ss * ss
            a = acc[3] / n
            row.append((round(acc[0] / max(1, acc[3] / 255)), round(acc[1] / max(1, acc[3] / 255)), round(acc[2] / max(1, acc[3] / 255)), round(a)) if acc[3] else (0, 0, 0, 0))
        rows.append(row)
    return png_bytes(size, rows)


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "icons")
    os.makedirs(out, exist_ok=True)
    for n in (16, 48, 128):
        with open(os.path.join(out, f"icon{n}.png"), "wb") as f:
            f.write(icon(n))
        print("wrote", n)
