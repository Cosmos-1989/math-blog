// Old XML bookmarks and the former repository prefix share this landing page.
const route = document.documentElement.getAttribute('data-redirect');
if (route) {
  const target = new URL(route, window.location.href);
  if (target.origin === window.location.origin) {
    target.search = window.location.search;
    target.hash = window.location.hash;
    window.location.replace(target.href);
  }
}
