export function ignoreChromeRuntimeErrors() {
  if (chrome.runtime.lastError) {
    // tslint:disable-next-line:no-unused-expression
    void(chrome.runtime.lastError.message);
  }
}
