// Simple React bundle for ProductList
(function () {
  "use strict";

  // React-like simple component system
  const React = {
    createElement: function (type, props, ...children) {
      return { type, props: props || {}, children };
    },
  };

  // Simple render function
  function render(element, container) {
    if (typeof element === "string") {
      container.textContent = element;
      return;
    }

    const dom = document.createElement(element.type);

    // Handle props
    Object.keys(element.props).forEach((key) => {
      if (key === "className") {
        dom.className = element.props[key];
      } else if (key.startsWith("on")) {
        dom.addEventListener(
          key.toLowerCase().substring(2),
          element.props[key]
        );
      } else {
        dom.setAttribute(key, element.props[key]);
      }
    });

    // Handle children
    element.children.forEach((child) => {
      if (typeof child === "string") {
        dom.appendChild(document.createTextNode(child));
      } else {
        render(child, dom);
      }
    });

    container.appendChild(dom);
  }

  // Product data
  const products = [
    {
      id: 1,
      name: "Классическая футболка",
      price: 1299,
      imageURL:
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=300&q=80",
      description: "Удобная хлопковая футболка",
      customizable: true,
    },
    {
      id: 2,
      name: "Спортивная футболка",
      price: 1599,
      imageURL:
        "https://images.unsplash.com/photo-1503341455253-b2cd399ece10?auto=format&fit=crop&w=300&q=80",
      description: "Дышащая ткань для активного отдыха",
      customizable: true,
    },
    {
      id: 3,
      name: "Боксеры Premium",
      price: 899,
      imageURL:
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=300&q=80",
      description: "Мягкое хлопковое белье",
      customizable: false,
    },
  ];

  // ProductList component
  function ProductList() {
    return React.createElement(
      "div",
      { className: "product-list" },
      React.createElement(
        "h2",
        { className: "product-list__title" },
        "Наши товары"
      ),
      React.createElement(
        "div",
        { className: "product-grid" },
        ...products.map((product) =>
          React.createElement(
            "div",
            { key: product.id, className: "product-card" },
            React.createElement(
              "div",
              { className: "product-card__image-container" },
              React.createElement("img", {
                src: product.imageURL,
                alt: product.name,
                className: "product-card__image",
                onError: function (e) {
                  e.target.src =
                    "https://via.placeholder.com/300x300/cccccc/666666?text=Футболка";
                },
              })
            ),
            React.createElement(
              "div",
              { className: "product-card__content" },
              React.createElement(
                "h3",
                { className: "product-card__title" },
                product.name
              ),
              React.createElement(
                "p",
                { className: "product-card__description" },
                product.description
              ),
              React.createElement(
                "div",
                { className: "product-card__price" },
                product.price + "₽"
              ),
              React.createElement(
                "div",
                { className: "product-card__actions" },
                React.createElement(
                  "button",
                  {
                    className: product.customizable
                      ? "btn btn--secondary"
                      : "btn btn--disabled",
                    disabled: !product.customizable,
                  },
                  product.customizable
                    ? "Кастомизировать"
                    : "Не кастомизируется"
                ),
                React.createElement(
                  "button",
                  { className: "btn btn--primary" },
                  "В корзину"
                )
              )
            )
          )
        )
      )
    );
  }

  // Mount when DOM is ready
  document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("product-list-root");
    if (container) {
      render(React.createElement(ProductList), container);
    }
  });
})();
