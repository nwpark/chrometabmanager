export function reloadWindow() {
  // Never reload background page - see chrome.runtime.reload if this behaviour is desired
  if (window.location.pathname !== '/_generated_background_page.html') {
    window.location.reload();
  }
}
