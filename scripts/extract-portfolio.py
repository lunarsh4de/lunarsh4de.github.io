"""Extract embedded portfolio media and a review manifest; never flatten pages for the site."""
import argparse
import json
from pathlib import Path
import pymupdf as fitz
from PIL import Image, ImageDraw, ImageOps

parser = argparse.ArgumentParser()
parser.add_argument('pdf', type=Path)
parser.add_argument('--output', type=Path, default=Path('tmp/portfolio'))
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
doc = fitz.open(args.pdf)
manifest = []
for number, page in enumerate(doc, 1):
    folder = args.output / f'page-{number:02}'
    folder.mkdir(exist_ok=True)
    (folder / 'text.txt').write_text(page.get_text(), encoding='utf-8')
    # Rendered pages are review references only, never production assets.
    scale = 1000 / page.rect.width
    pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
    preview = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    preview.save(folder / 'reference.jpg', quality=90)
    for start in range(0, preview.height, 1200):
        preview.crop((0, start, preview.width, min(start+1200, preview.height))).save(folder / f'review-{start//1200+1}.jpg', quality=92)
    records = []
    for idx, info in enumerate(page.get_images(full=True), 1):
        xref, mask = info[:2]
        pix = fitz.Pixmap(doc, xref)
        if pix.colorspace and pix.colorspace.n > 3:
            pix = fitz.Pixmap(fitz.csRGB, pix)
        if mask:
            pix = fitz.Pixmap(pix, fitz.Pixmap(doc, mask))
        name = f'image-{idx:02}-xref-{xref}.png'
        pix.save(folder / name)
        boxes = [list(r) for r in page.get_image_rects(xref)]
        records.append(dict(file=name, xref=xref, width=pix.width, height=pix.height, boxes=boxes))
    # Image contact sheet: stable indices link the review to raw extracted assets.
    sheet = Image.new('RGB', (1000, ((len(records)+3)//4)*190 or 190), '#eeeeee')
    draw = ImageDraw.Draw(sheet)
    for idx, record in enumerate(records):
        im = Image.open(folder / record['file']).convert('RGBA')
        thumb = ImageOps.contain(im, (238, 155))
        x,y = (idx%4)*250, (idx//4)*190
        sheet.paste(thumb, (x+(250-thumb.width)//2,y+22), thumb)
        draw.text((x+6,y+4), f"{idx+1:02} | {record['width']}x{record['height']}", fill='black')
    sheet.save(folder / 'images.jpg', quality=90)
    manifest.append(dict(page=number, size=list(page.rect), images=records))
(args.output / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps([dict(page=r['page'], images=len(r['images']), height=r['size'][3]) for r in manifest]))
