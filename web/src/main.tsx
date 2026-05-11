// Cormorant Garamond — the editorial serif used throughout (spec §7)
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/600.css";

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
