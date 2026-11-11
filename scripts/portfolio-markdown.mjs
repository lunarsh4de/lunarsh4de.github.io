import { readFileSync } from 'node:fs';

// Connect published pictures to embedded PDF images and preserve semantic captions.
const media = JSON.parse(readFileSync(new URL('../src/data/portfolio-media.json', import.meta.url), 'utf8'));
media.push(...JSON.parse(readFileSync(new URL('../src/data/portfolio-vectors.json', import.meta.url), 'utf8')));
const bySource = new Map(media.map((item) => [item.src, item]));
const element = (tagName, properties, children) => ({ type: 'element', tagName, properties, children });

export default function portfolioMarkdown() {
  return (tree) => {
    function walk(node) {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        const images = child.tagName === 'p' && child.children?.filter((item) => item.tagName === 'img');
        const onlyImages = images?.length && child.children.every((item) => item.tagName === 'img' || (item.type === 'text' && !item.value.trim()));
        if (onlyImages && images.every((img) => bySource.has(img.properties.src))) {
          return element('div', { className: ['case-gallery'], 'data-count': images.length }, images.map((img) => {
            const record = bySource.get(img.properties.src);
            Object.assign(img.properties, {
              width: record.width, height: record.height, loading: 'lazy', decoding: 'async',
              style: `max-width:${record.format === 'svg' ? 600 : (record.originalWidth || record.width)}px;margin-inline:auto`,
              srcSet: record.variants.map((v) => `${v.src} ${v.width}w`).join(', '),
              sizes: images.length > 1 ? '(max-width: 700px) calc(100vw - 36px), (max-width: 1050px) 42vw, 32vw' : '(max-width: 700px) calc(100vw - 36px), (max-width: 1050px) 84vw, 66vw',
            });
            return element('figure', { className: ['case-figure'] }, [
              element('a', { href: record.src, className: ['case-image-link'], 'data-lightbox': '', 'aria-label': `Enlarge image: ${img.properties.alt}`, target: '_blank', rel: 'noopener' }, [img,
                element('span', { className: ['image-enlarge'], 'aria-hidden': 'true' }, [{type:'text',value:'↗'}]),
              ]),
              element('figcaption', {}, [{ type: 'text', value: img.properties.alt }]),
            ]);
          }));
        }
        walk(child);
        return child;
      });
    }
    walk(tree);
  };
}
