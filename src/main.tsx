import React from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";

import App from "./App";
import { Toaster } from "./components/ui/toaster";
import "./index.css";

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);

  root.render(
    <React.StrictMode>
      <HelmetProvider>
        <App />
        <Toaster />
      </HelmetProvider>
    </React.StrictMode>
  );
} else {
  console.error("Root element with id 'root' not found");
}
