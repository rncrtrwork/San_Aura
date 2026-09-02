export function restoreDocumentScroll(): void {
  document.documentElement.style.overflow = '';
  document.documentElement.style.overflowY = '';
  document.body.style.overflow = '';
  document.body.style.overflowY = '';
}
