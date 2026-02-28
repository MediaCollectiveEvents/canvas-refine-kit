// Ensure a global 'process' object exists for any libs that expect it in the browser.
(window as any).process = (window as any).process || {
  env: { NODE_ENV: "development" },
};
