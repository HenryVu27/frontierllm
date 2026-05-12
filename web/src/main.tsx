// Geist Sans + Geist Mono — minimalist documentation typography.
import "@fontsource-variable/geist/index.css";
import "@fontsource-variable/geist-mono/index.css";

// Global styles + design tokens
import "./styles/globals.css";
import "katex/dist/katex.min.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);
