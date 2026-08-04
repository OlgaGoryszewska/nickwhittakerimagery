"""
Generate "on your wall" room mockups for every photo in public/{Abstracts,Fine Art,
Reflections,Textures,Waves}, compositing each into the picture frame in
public/room01.png.

Usage: python3 scripts/gen_mockups.py
Requires: pip install Pillow

Output: public/mockups/<Category>/<original-filename-without-ext>.jpg
(mirrors the source folder structure; src/app/lib/categories.ts derives each
photo's `roomPreview` field from this same naming convention).

Re-run this after adding/removing photos in those folders. The frame's pixel
bounding box (FRAME_BOX) was measured against room01.png specifically via a
flood-fill from a seed point inside the blank canvas — if room01.png changes,
re-measure this box first.
"""

import os
from PIL import Image, ImageChops

PUBLIC = os.path.join(os.path.dirname(__file__), "..", "public")
BASE_PATH = os.path.join(PUBLIC, "room01.png")
OUT_DIR = os.path.join(PUBLIC, "mockups")

FRAME_BOX = (522, 181, 1076, 565)  # left, top, right, bottom
FRAME_W = FRAME_BOX[2] - FRAME_BOX[0]
FRAME_H = FRAME_BOX[3] - FRAME_BOX[1]

CATEGORIES = ["Abstracts", "Fine Art", "Reflections", "Textures", "Waves"]


def cover_fit(img, target_w, target_h):
    """Resize + center-crop img to exactly fill target_w x target_h (like CSS object-fit: cover)."""
    src_w, src_h = img.size
    src_aspect = src_w / src_h
    target_aspect = target_w / target_h
    if src_aspect > target_aspect:
        new_h = target_h
        new_w = int(target_h * src_aspect)
    else:
        new_w = target_w
        new_h = int(target_w / src_aspect)
    resized = img.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def main():
    base = Image.open(BASE_PATH).convert("RGB")
    frame_crop = base.crop(FRAME_BOX)

    # Light map: normalize the original frame's luminance around a mid gray so we
    # can multiply it onto each pasted photo and keep the mockup's natural light/shadow
    # (there's a soft diagonal light streak across the frame in room01.png).
    light_map = frame_crop.convert("L")
    mean = sum(light_map.getdata()) / (FRAME_W * FRAME_H)
    light_map = light_map.point(lambda p: max(0, min(255, int(p * 128 / mean))))
    light_rgb = Image.merge("RGB", (light_map, light_map, light_map))

    count = 0
    for cat in CATEGORIES:
        src_dir = os.path.join(PUBLIC, cat)
        out_dir = os.path.join(OUT_DIR, cat)
        os.makedirs(out_dir, exist_ok=True)
        for fname in sorted(os.listdir(src_dir)):
            if not fname.lower().endswith((".jpg", ".jpeg", ".png")):
                continue
            photo = Image.open(os.path.join(src_dir, fname)).convert("RGB")
            fitted = cover_fit(photo, FRAME_W, FRAME_H)
            lit = ImageChops.multiply(fitted, light_rgb)
            # Blend back a little of the original so the mockup's shading doesn't
            # over-darken the print.
            lit = Image.blend(fitted, lit, 0.75)

            composite = base.copy()
            composite.paste(lit, (FRAME_BOX[0], FRAME_BOX[1]))
            out_name = os.path.splitext(fname)[0] + ".jpg"
            composite.save(os.path.join(out_dir, out_name), "JPEG", quality=82, optimize=True)
            count += 1

    print(f"generated {count} mockups in {OUT_DIR}")


if __name__ == "__main__":
    main()
