import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import ProductList from "../ProductList";
import Customization from "./Customization";
import "../ProductList.css";

// Создаем точку входа для React приложения
const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'products' | 'customization'>('products');

  return (
    <div className="app">
      <nav className="app-navigation">
        <button 
          className={`nav-btn ${currentView === 'products' ? 'active' : ''}`}
          onClick={() => setCurrentView('products')}
        >
          Каталог товаров
        </button>
        <button 
          className={`nav-btn ${currentView === 'customization' ? 'active' : ''}`}
          onClick={() => setCurrentView('customization')}
        >
          3D Кастомизация
        </button>
      </nav>

      {currentView === 'products' && <ProductList />}
      {currentView === 'customization' && <Customization />}

      <style dangerouslySetInnerHTML={{
        __html: `
          .app-navigation {
            display: flex;
            gap: 10px;
            padding: 20px;
            justify-content: center;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
          }

          .nav-btn {
            padding: 12px 24px;
            border: 2px solid #e2e8f0;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
          }

          .nav-btn:hover {
            border-color: #3b82f6;
            background: #f0f9ff;
          }

          .nav-btn.active {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
          }
        `
      }} />
    </div>
  );
};

// Монтируем React приложение когда DOM готов
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("product-list-root");
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
});
