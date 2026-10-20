import React from "react";
import { createRoot } from "react-dom/client";
import "../app/globals.css";
import Home from "../app/page";

const root = document.getElementById("root")!;
createRoot(root).render(<Home />);

if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.debug("SW registration error:", err));
  });
}
