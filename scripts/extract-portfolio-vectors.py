"""Extract two original structural diagrams as SVG (no raster page captures)."""
import argparse
import json
from pathlib import Path
import pymupdf as fitz

parser = argparse.ArgumentParser()
parser.add_argument('pdf', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
records = []
for name, box in [
    ('adjustable-opening', (960, 3590, 1280, 3900)),
    ('anti-reflux', (680, 4100, 1050, 4620)),
]:
    # Work on an in-memory copy; never save to the input PDF.
    doc = fitz.open(args.pdf)
    page = doc[3]
    x0, y0, x1, y1 = box
    for rect in [fitz.Rect(0, 0, page.rect.width, y0), fitz.Rect(0, y1, page.rect.width, page.rect.height),
                 fitz.Rect(0, y0, x0, y1), fitz.Rect(x1, y0, page.rect.width, y1)]:
        page.add_redact_annot(rect, fill=False)
    page.apply_redactions(images=2, graphics=2, text=0)
    page.set_cropbox(fitz.Rect(box))
    svg = page.get_svg_image(text_as_path=True)
    destination = root / 'public/images/projects/plant-ostomy' / f'{name}.svg'
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(svg, encoding='utf-8')
    review = root / 'tmp/portfolio'
    review.mkdir(parents=True, exist_ok=True)
    page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5)).save(review / f'{name}-svg-review.png')
    records.append(dict(slug='plant-ostomy', name=name, page=4, box=box, format='svg',
                        width=x1-x0, height=y1-y0, src=f'/images/projects/plant-ostomy/{name}.svg', variants=[]))
    doc.close()
(root / 'src/data/portfolio-vectors.json').write_text(json.dumps(records, indent=2)+'\n', encoding='utf-8')
print(f'Extracted {len(records)} original structural diagrams to SVG.')
