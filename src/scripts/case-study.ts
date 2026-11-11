let dispose: (() => void) | undefined;

function initCaseStudy() {
  dispose?.();
  const dialog = document.querySelector<HTMLDialogElement>('.image-dialog');
  if (!dialog) return;
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const img = dialog.querySelector<HTMLImageElement>('img')!;
  const caption = dialog.querySelector<HTMLElement>('#image-dialog-caption')!;
  const zoom = dialog.querySelector<HTMLButtonElement>('[data-image-zoom]')!;
  let opener: HTMLElement | null = null;
  function resetZoom() {
    dialog!.classList.remove('is-zoomed');
    zoom.setAttribute('aria-pressed', 'false');
    zoom.textContent = 'Actual size';
    const scroller = dialog!.querySelector('.image-dialog-scroll')!;
    scroller.scrollTop = scroller.scrollLeft = 0;
  }
  document.querySelectorAll<HTMLAnchorElement>('[data-lightbox]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (dialog.open) return;
      opener = link;
      const source = link.querySelector('img');
      img.src = link.href;
      img.alt = source?.alt || 'Project image';
      caption.textContent = img.alt;
      resetZoom();
      dialog.showModal();
    }, options);
  });
  dialog.querySelector('[data-image-close]')!.addEventListener('click', () => dialog.close(), options);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target === dialog.querySelector('.image-dialog-scroll')) dialog.close();
  }, options);
  dialog.addEventListener('close', () => {
    img.removeAttribute('src');
    opener?.focus({ preventScroll: true });
  }, options);
  zoom.addEventListener('click', () => {
    const expanded = dialog.classList.toggle('is-zoomed');
    zoom.setAttribute('aria-pressed', String(expanded));
    zoom.textContent = expanded ? 'Fit to window' : 'Actual size';
  }, options);
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.case-toc ol a')];
  const headings = [...document.querySelectorAll<HTMLElement>('.case-prose h2')];
  const observer = new IntersectionObserver(() => {
    const current = headings.filter((h) => h.getBoundingClientRect().top < window.innerHeight * .4).at(-1) || headings[0];
    links.forEach((link) => {
      if (decodeURIComponent(link.hash.slice(1)) === current?.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '0px 0px -60% 0px', threshold: 0 });
  headings.forEach((heading) => observer.observe(heading));
  dispose = () => {
    if (dialog.open) dialog.close();
    controller.abort();
    observer.disconnect();
  };
}
document.addEventListener('astro:before-swap', () => dispose?.());
document.addEventListener('astro:page-load', initCaseStudy);
initCaseStudy();
