import editorial from '../../../data/wechat-editorial.json';

// Original vector covers for the English archive; source images stay in the WeChat archive.
export function getStaticPaths() {
  return Object.entries(editorial).map(([slug, entry]) => ({ params: { slug }, props: { entry } }));
}

const escapeXml = (text: string) => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]!));
const motifs: Record<string, string> = {
  orbit: '<ellipse cx="510" cy="175" rx="74" ry="26" transform="rotate(-40 510 175)"/><ellipse cx="510" cy="175" rx="74" ry="26" transform="rotate(40 510 175)"/><circle cx="510" cy="175" r="10" fill="#303c33"/>',
  nodes: '<path d="M450 126L556 164L474 232Z"/><circle cx="450" cy="126" r="17"/><circle cx="556" cy="164" r="25"/><circle cx="474" cy="232" r="12"/>',
  pages: '<path d="M465 103H540L563 126V228H465Z M540 103V126H563 M449 121V246H547 M484 153H543 M484 172H543 M484 191H522"/>',
  board: '<rect x="438" y="108" width="144" height="127" rx="5"/><path d="M438 136H582 M486 136V235 M534 136V235"/><path d="M449 154H474 M449 167H474 M497 154H522 M497 181H522 M545 154H570" stroke-width="5"/>'
};

export function GET({ props }: { props: { entry: typeof editorial[keyof typeof editorial] } }) {
  const { entry } = props;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
    <rect width="640" height="360" fill="${entry.color}"/>
    <g fill="#303c33" font-family="Arial, Helvetica, sans-serif">
      <text x="32" y="46" font-size="20">Design &amp; AI</text>
      ${entry.coverLines.map((line, i) => `<text x="32" y="${157 + i * 52}" font-size="${line.length > 13 ? 40 : 46}" letter-spacing="-1.6">${escapeXml(line)}</text>`).join('')}
      <text x="32" y="321" font-size="18">${escapeXml(entry.topic)}</text>
    </g>
    <g fill="none" stroke="#303c33" stroke-width="2" stroke-linejoin="round">${motifs[entry.motif]}</g>
  </svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
}
