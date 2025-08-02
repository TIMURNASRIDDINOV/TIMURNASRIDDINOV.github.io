// Simple JavaScript version for browser compatibility
const { useState, useEffect } = React;

// Product helpers
const ProductHelpers = {
  isProductCustomizable: (product) => product.customizable,
  
  getProductTypeLabel: (type) => {
    switch (type) {
      case 't-shirt':
        return 'Футболка';
      case 'underwear':
        return 'Белье';
      default:
        return 'Товар';
    }
  },
  
  formatPrice: (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  }
};

// Default products data
const defaultProducts = [
  {
    id: 1,
    name: "Классическая футболка",
    type: "t-shirt",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Белый", code: "white", hex: "#FFFFFF" },
      { name: "Черный", code: "black", hex: "#000000" },
      { name: "Серый", code: "gray", hex: "#808080" },
    ],
    price: 1299,
    imageURL: "/images/tshirt1.jpg",
    customizable: true,
    description: "Удобная хлопковая футболка",
  },
  {
    id: 2,
    name: "Спортивная футболка",
    type: "t-shirt",
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
      { name: "Темно-синий", code: "navy", hex: "#1E3A8A" },
      { name: "Красный", code: "red", hex: "#DC2626" },
      { name: "Зеленый", code: "green", hex: "#16A34A" },
    ],
    price: 1599,
    imageURL: "/images/tshirt2.jpg",
    customizable: true,
    description: "Дышащая ткань для активного отдыха",
  },
  {
    id: 3,
    name: "Боксеры Premium",
    type: "underwear",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Черный", code: "black", hex: "#000000" },
      { name: "Серый", code: "gray", hex: "#6B7280" },
      { name: "Темно-синий", code: "navy", hex: "#1E3D6F" },
    ],
    price: 899,
    imageURL: "/images/underwear1.jpg",
    customizable: false,
    description: "Мягкое хлопковое белье",
  },
  {
    id: 4,
    name: "Трусы-слипы",
    type: "underwear",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Белый", code: "white", hex: "#FFFFFF" },
      { name: "Черный", code: "black", hex: "#000000" },
    ],
    price: 699,
    imageURL: "/images/underwear2.jpg",
    customizable: false,
    description: "Комфортная посадка",
  },
];

// Product List Component
function ProductList({ products = defaultProducts }) {
  const handleCustomize = (product) => {
    if (!ProductHelpers.isProductCustomizable(product)) {
      alert("Этот товар не поддерживает кастомизацию");
      return;
    }
    console.log("Кастомизация товара:", product.name);
    // Здесь можно добавить логику для открытия модального окна кастомизации
  };

  const handleAddToCart = (product) => {
    console.log("Добавление в корзину:", product.name);
    // Здесь можно добавить логику для добавления товара в корзину
  };

  return React.createElement(
    'div',
    { className: 'product-list' },
    React.createElement('h2', { className: 'product-list__title' }, 'Наши товары'),
    React.createElement(
      'div',
      { className: 'product-grid' },
      products.map((product) =>
        React.createElement(
          'div',
          { key: product.id, className: 'product-card' },
          React.createElement(
            'div',
            { className: 'product-card__image-container' },
            React.createElement('img', {
              src: product.imageURL || product.image || '',
              alt: product.name,
              className: 'product-card__image',
              onError: (e) => {
                e.target.src = `https://via.placeholder.com/300x300/cccccc/666666?text=${ProductHelpers.getProductTypeLabel(product.type)}`;
              }
            }),
            React.createElement(
              'div',
              { className: 'product-card__category' },
              ProductHelpers.getProductTypeLabel(product.type),
              ProductHelpers.isProductCustomizable(product) &&
                React.createElement('span', { className: 'customizable-badge' }, '🎨 Кастомизация')
            )
          ),
          React.createElement(
            'div',
            { className: 'product-card__content' },
            React.createElement('h3', { className: 'product-card__title' }, product.name),
            product.description &&
              React.createElement('p', { className: 'product-card__description' }, product.description),
            React.createElement(
              'div',
              { className: 'product-card__sizes' },
              React.createElement('span', { className: 'sizes-label' }, 'Размеры:'),
              React.createElement(
                'div',
                { className: 'sizes-list' },
                product.sizes.map((size) =>
                  React.createElement('span', { key: size, className: 'size-badge' }, size)
                )
              )
            ),
            React.createElement(
              'div',
              { className: 'product-card__colors' },
              React.createElement('span', { className: 'colors-label' }, 'Цвета:'),
              React.createElement(
                'div',
                { className: 'colors-list' },
                product.colors.slice(0, 3).map((color) =>
                  React.createElement('div', {
                    key: color.code,
                    className: 'color-swatch',
                    style: { backgroundColor: color.hex },
                    title: color.name
                  })
                ),
                product.colors.length > 3 &&
                  React.createElement('span', { className: 'more-colors' }, `+${product.colors.length - 3}`)
              )
            ),
            React.createElement('div', { className: 'product-card__price' }, ProductHelpers.formatPrice(product.price)),
            React.createElement(
              'div',
              { className: 'product-card__actions' },
              React.createElement(
                'button',
                {
                  className: `btn ${ProductHelpers.isProductCustomizable(product) ? 'btn--secondary' : 'btn--disabled'}`,
                  onClick: () => handleCustomize(product),
                  disabled: !ProductHelpers.isProductCustomizable(product)
                },
                ProductHelpers.isProductCustomizable(product) ? 'Кастомизировать' : 'Не кастомизируется'
              ),
              React.createElement(
                'button',
                {
                  className: 'btn btn--primary',
                  onClick: () => handleAddToCart(product)
                },
                'В корзину'
              )
            )
          )
        )
      )
    )
  );
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('product-list-root');
  if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(ProductList));
  }
});
