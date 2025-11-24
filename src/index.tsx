import React from "react";
import { createRoot } from "react-dom/client";
import ProductList from "../ProductList";
import "../ProductList.css";

// Монтируем React приложение когда DOM готов
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("product-list-root");
  if (container) {
    const root = createRoot(container);
    root.render(<ProductList />);
  }
});
