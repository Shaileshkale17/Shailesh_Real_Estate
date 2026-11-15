/** Sets the document title and meta description for the current page. */
export function setMeta(title, description) {
  if (title) document.title = title;
  if (description) {
    const el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute('content', description);
  }
}
