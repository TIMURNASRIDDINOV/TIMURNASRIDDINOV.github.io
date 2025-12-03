// Vanilla JavaScript Product Catalog
(function () {
  "use strict";

  // Products data
  const products = [
    {
      id: 1,
      name: "Белая футболка",
      nameEn: "White T-shirt",
      type: "Oddiy futbolka",
      image: "products/tshirt_basic-white_front_001.png.webp",
      price: 150000,
      customizable: true,
    },
    {
      id: 2,
      name: "Белый свитшот",
      nameEn: "White Sweatshirt",
      type: "Oddiy svitshot",
      image: "products/sweatshirt_basic-white_front_001.png",
      price: 250000,
      customizable: true,
    },
  ];

  // Format price in сум
  function formatPrice(price) {
    return price.toLocaleString("ru-RU") + " сум";
  }

  // Create product card element
  function createProductCard(product) {
    // Main card container
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-product-id", product.id);

    // Image container
    const imageContainer = document.createElement("div");
    imageContainer.className = "product-card__image-container";

    const img = document.createElement("img");
    img.src = product.image;
    img.alt = `${product.name} - ${product.type}`;
    img.className = "product-card__image";

    // Image error handling
    img.onerror = function () {
      this.src =
        "https://via.placeholder.com/400x400/f5f5f5/666666?text=" +
        encodeURIComponent(product.name);
    };

    // Product type badge
    const badge = document.createElement("span");
    badge.className = "product-type-badge";
    badge.textContent = "oddiy";

    imageContainer.appendChild(img);
    imageContainer.appendChild(badge);

    // Content container
    const content = document.createElement("div");
    content.className = "product-card__content";

    // Product name
    const title = document.createElement("h3");
    title.className = "product-card__title";
    title.textContent = product.name;

    // Product description
    const description = document.createElement("p");
    description.className = "product-card__description";
    description.textContent = product.type;

    // Price
    const priceDiv = document.createElement("div");
    priceDiv.className = "product-card__price";
    priceDiv.textContent = formatPrice(product.price);

    // Actions container
    const actions = document.createElement("div");
    actions.className = "product-card__actions";

    // Customize button
    const button = document.createElement("button");
    button.className = product.customizable
      ? "customize-btn btn-primary"
      : "customize-btn btn-disabled";
    button.textContent = product.customizable
      ? "Настроить дизайн"
      : "Недоступно";
    button.disabled = !product.customizable;
    button.setAttribute("aria-label", `Настроить ${product.name}`);

    // Add click event listener
    if (product.customizable) {
      button.addEventListener("click", function () {
        window.location.href = "configurator.html";
      });
    }

    actions.appendChild(button);

    // Assemble content
    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(priceDiv);
    content.appendChild(actions);

    // Assemble card
    card.appendChild(imageContainer);
    card.appendChild(content);

    return card;
  }

  // Render products to container
  function renderProducts() {
    const container = document.getElementById("product-list-root");

    if (!container) {
      console.error("Product container #product-list-root not found");
      return;
    }

    // Clear existing content
    container.innerHTML = "";

    // Create grid container
    const grid = document.createElement("div");
    grid.className = "product-grid";

    // Generate and append product cards
    products.forEach(function (product) {
      const card = createProductCard(product);
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderProducts);
  } else {
    renderProducts();
  }
})();
