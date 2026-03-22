"""Generate WebP thumbnails for cover images.

Reads every image in public/assets/covers/, resizes to max 400px wide
(preserving aspect ratio), and saves a WebP version in
public/assets/covers/thumbs/.

Originals are never modified.
"""

import os
from pathlib import Path
from PIL import Image

COVERS_DIR = Path(__file__).resolve().parent.parent / "public" / "assets" / "covers"
THUMBS_DIR = COVERS_DIR / "thumbs"
MAX_WIDTH = 600
WEBP_QUALITY = 90


def generate():
    THUMBS_DIR.mkdir(exist_ok=True)

    for img_path in sorted(COVERS_DIR.iterdir()):
        if img_path.is_dir():
            continue
        if img_path.suffix.lower() not in (".png", ".jpg", ".jpeg", ".webp"):
            continue

        out_name = img_path.stem + ".webp"
        out_path = THUMBS_DIR / out_name

        with Image.open(img_path) as img:
            w, h = img.size
            if w > MAX_WIDTH:
                ratio = MAX_WIDTH / w
                new_size = (MAX_WIDTH, round(h * ratio))
                img = img.resize(new_size, Image.LANCZOS)

            img.save(out_path, "WEBP", quality=WEBP_QUALITY)

        orig_kb = img_path.stat().st_size / 1024
        thumb_kb = out_path.stat().st_size / 1024
        print(f"{img_path.name:30s} {orig_kb:7.0f} KB -> {out_name:30s} {thumb_kb:5.0f} KB")


if __name__ == "__main__":
    generate()
