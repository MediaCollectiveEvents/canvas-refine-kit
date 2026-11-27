export function focusMainContent(scrollToStart: boolean): boolean {
  const main = document.getElementById("main-content") ?? document.querySelector("main");
  if (!main) return false;

  if (!main.hasAttribute("tabindex")) main.tabIndex = -1;
  main.focus({ preventScroll: true });
  if (scrollToStart) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  return true;
}
