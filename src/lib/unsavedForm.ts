export function protectUnsavedForm(browser: Window) {
  const warn = (event: BeforeUnloadEvent) => {
    event.preventDefault();
    event.returnValue = "";
  };
  browser.addEventListener("beforeunload", warn);
  return () => browser.removeEventListener("beforeunload", warn);
}
