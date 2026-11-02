"""Publish responsive WebP derivatives of selected embedded images.

Run extract-portfolio.py first. No page renders enter public/.
"""
import json
from pathlib import Path
from PIL import Image, ImageStat

root = Path(__file__).resolve().parents[1]
source = root / 'tmp/portfolio'
manifest = json.loads((source / 'manifest.json').read_text(encoding='utf-8'))
# Source page, embedded image index, semantic name.
selections = {
    'pipe-cleaning-robot': (3, {
        11:'hero', 4:'sketches', 1:'motor-control', 3:'diameter-adaptation',
        5:'sensing', 9:'pipe-scan', 10:'pipe-fit', 12:'front-view',
        2:'chassis-details', 19:'rear-render', 21:'front-render', 22:'sensor-detail',
        13:'inspection', 14:'assisted-cleaning', 15:'traditional-cleaning', 16:'locating',
    }),
    'plant-ostomy': (4, {
        16:'hero', 6:'sketches', 5:'bag-study', 1:'anatomy', 9:'belt-render',
        12:'back-render', 13:'front-render', 14:'quick-release', 17:'seal-detail',
        18:'plant-form', 20:'care-routine', 27:'wearing-context', 29:'wearing-render',
        32:'growth-concept', 4:'prototype-shape', 10:'prototype-ring',
        8:'prototype-assembly', 2:'prototype-spray', 3:'prototype-material', 30:'wearing-sequence',
    }),
    'home-energy-storage': (5, {
        1:'hero', 15:'balcony-context', 9:'home-scenario', 28:'style-references',
        29:'ai-exploration', 11:'form-sketches', 17:'system-sketches', 18:'layout-sketches',
        10:'stack-sketch', 14:'form-study-1', 2:'form-study-2', 8:'form-study-3',
        7:'family-lineup', 4:'series-poster', 6:'family-poster',
        19:'ai-balcony', 20:'ai-system', 21:'ai-storage', 22:'ai-home',
        23:'ai-range', 24:'ai-section', 25:'ai-front', 26:'ai-cabinet', 27:'ai-series',
    }),
    'parametric-objects': (6, {
        5:'hero', 3:'branch-form', 1:'printed-branch', 4:'printed-holder', 2:'printed-knot',
    }),
    'youth-farm': (7, {3:'home-screen', 1:'activity-screen'}),
}
published = []
for slug, (page, items) in selections.items():
    target = root / 'public/images/projects' / slug
    target.mkdir(parents=True, exist_ok=True)
    for index, name in items.items():
        record = manifest[page-1]['images'][index-1]
        original = source / f'page-{page:02}' / record['file']
        im = Image.open(original)
        if max(ImageStat.Stat(im.convert('RGB')).stddev) < 1:
            raise ValueError(f'Blank image: {original}')
        # Keep transparency. Convert CMYK/palette images for browser decoding.
        im = im.convert('RGBA' if 'A' in im.getbands() else 'RGB')
        max_width = min(1920, im.width)
        full = im.copy()
        if full.width > max_width:
            full = full.resize((max_width, round(full.height*max_width/full.width)), Image.Resampling.LANCZOS)
        full.save(target / f'{name}.webp', quality=88, method=6)
        variants = []
        for width in (480, 960):
            if width < full.width:
                resized = full.resize((width, round(full.height*width/full.width)), Image.Resampling.LANCZOS)
                resized.save(target / f'{name}-{width}.webp', quality=84, method=6)
                variants.append(dict(src=f'/images/projects/{slug}/{name}-{width}.webp', width=width))
        variants.append(dict(src=f'/images/projects/{slug}/{name}.webp', width=full.width))
        published.append(dict(slug=slug, name=name, page=page, imageIndex=index, xref=record['xref'],
                              width=full.width, height=full.height, originalWidth=im.width, originalHeight=im.height,
                              src=f'/images/projects/{slug}/{name}.webp', variants=variants))
(root / 'src/data/portfolio-media.json').write_text(json.dumps(published, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(f'Published {len(published)} embedded images. No PDF page renders published.')
