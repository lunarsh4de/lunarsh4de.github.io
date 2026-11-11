let cleanup: (() => void) | undefined;

function initNavigation() {
  cleanup?.();
  const sidebar = document.querySelector<HTMLElement>('.reference-sidebar');
  const content = sidebar?.querySelector<HTMLElement>('.reference-sidebar-inner');
  if (!sidebar || !content) return;

  const controller = new AbortController();
  const options = { signal: controller.signal };
  const desktop = matchMedia('(min-width: 701px)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  const innerPage = !!sidebar.closest('.reference-inner-page');
  const buttons = sidebar.querySelectorAll<HTMLButtonElement>('.reference-menu, .sidebar-edge-toggle');
  let open = false;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  function setOpen(value: boolean) {
    clearTimeout(closeTimer);
    open = value;
    sidebar!.classList.toggle('is-open', open);
    content!.inert = !open && (innerPage || !desktop.matches);
    buttons.forEach((button) => {
      button.setAttribute('aria-expanded', String(open));
      if (button.classList.contains('sidebar-edge-toggle')) {
        button.setAttribute('aria-label', open ? 'Collapse navigation' : 'Expand navigation');
      }
    });
  }

  buttons.forEach((button) => button.addEventListener('click', () => setOpen(!open), options));
  sidebar.addEventListener('pointermove', (event) => {
    // Ignore boundary events caused by a page swap under a stationary pointer.
    if ((event.movementX || event.movementY) && innerPage && desktop.matches && hover.matches) setOpen(true);
  }, options);
  sidebar.addEventListener('pointerleave', () => {
    if (innerPage && desktop.matches && hover.matches) {
      closeTimer = setTimeout(() => {
        if (!sidebar.querySelector(':focus-visible')) setOpen(false);
      }, 150);
    }
  }, options);
  sidebar.addEventListener('focusout', (event) => {
    // activeElement can briefly be body during focusout. Use the destination
    // so Tab does not close the menu before the next link receives focus.
    if (event.relatedTarget instanceof Node && !sidebar.contains(event.relatedTarget) && !sidebar.matches(':hover')) setOpen(false);
  }, options);
  sidebar.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const toggle = sidebar.querySelector<HTMLButtonElement>(desktop.matches ? '.sidebar-edge-toggle' : '.reference-menu');
    toggle?.focus();
    setOpen(false);
  }, options);
  document.addEventListener('pointerdown', (event) => {
    if (!sidebar.contains(event.target as Node)) setOpen(false);
  }, options);
  desktop.addEventListener('change', () => setOpen(false), options);
  setOpen(false);
  cleanup = () => { controller.abort(); clearTimeout(closeTimer); };
}

document.addEventListener('astro:before-swap', () => cleanup?.());
document.addEventListener('astro:page-load', initNavigation);
initNavigation();
