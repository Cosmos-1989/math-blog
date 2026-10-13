// Progressive enhancements only; navigation and note content work without JS.
const searchButton = document.querySelector('.search-trigger');
const ninja = document.querySelector('ninja-keys');
if (searchButton && ninja) {
  customElements.whenDefined('ninja-keys').then(() => {
    searchButton.disabled = false;
    searchButton.addEventListener('click', () => ninja.open());
    // The upstream dialog leaves focus in its hidden input after closing.
    const restoreFocus = new MutationObserver(() => {
      if (!ninja.visible && document.activeElement === ninja) searchButton.focus();
    });
    restoreFocus.observe(ninja.shadowRoot, { attributes: true, childList: true, subtree: true });
    document.addEventListener('keydown', event => {
      const editing = event.composedPath().some(node =>
        node instanceof HTMLElement &&
        (node.isContentEditable || /^(INPUT|TEXTAREA|SELECT|NINJA-KEYS)$/.test(node.tagName)));
      if (event.key === '/' && !editing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        ninja.open();
      }
    });
  });
}

const toc = document.querySelector('.toc-panel');
if (toc) toc.open = window.matchMedia('(min-width: 1051px)').matches;

function revealFragment(hash = window.location.hash) {
  let id;
  try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
  let target = document.getElementById(id);
  const anchor = target;
  while (target) {
    if (target instanceof HTMLDetailsElement) target.open = true;
    target = target.parentElement;
  }
  anchor?.scrollIntoView();
}
document.querySelectorAll('.toc-anchor').forEach(link =>
  link.addEventListener('click', () => revealFragment(link.hash)));
window.addEventListener('hashchange', () => revealFragment());
// Includes direct bookmarks and redirects from /index.xml, after math layout.
window.addEventListener('load', () => revealFragment());
