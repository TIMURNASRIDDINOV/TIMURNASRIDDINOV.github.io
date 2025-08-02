import React from 'react';
import { createRoot } from 'react-dom/client';
import ProductList from '../ProductList';
import '../ProductList.css';

// Создаем точку входа для React приложения
const App: React.FC = () => {
  return (
    <div className="app">
      <ProductList />
    </div>
  );
};

// Монтируем React приложение когда DOM готов
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('product-list-root');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
});
