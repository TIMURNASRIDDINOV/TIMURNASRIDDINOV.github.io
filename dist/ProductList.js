import React from "react";
import "./ProductList.css";
import { ProductHelpers } from "./types/Product";
const defaultProducts = [
    {
        id: 1,
        name: "Белая футболка",
        type: "t-shirt",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: [
            { name: "Белый", code: "white", hex: "#FFFFFF" },
        ],
        price: 1299,
        imageURL: "/products/tshirt_basic-white_front_001.png.webp",
        customizable: true,
        description: "Oddiy futbolka - базовая футболка из премиального хлопка",
        // Legacy fields
        title: "Белая футболка",
        image: "/products/tshirt_basic-white_front_001.png.webp",
        category: "tshirt",
    },
    {
        id: 2,
        name: "Белый свитшот",
        type: "hoodie",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: [
            { name: "Белый", code: "white", hex: "#FFFFFF" },
        ],
        price: 2499,
        imageURL: "/products/sweatshirt_basic-white_front_001.png",
        customizable: true,
        description: "Oddiy svitshot - базовый свитшот из мягкого трикотажа",
        // Legacy fields
        title: "Белый свитшот",
        image: "/products/sweatshirt_basic-white_front_001.png",
        category: "hoodie",
    },
];
const ProductList = ({ products = defaultProducts, }) => {
    const handleCustomize = (product) => {
        if (!ProductHelpers.isProductCustomizable(product)) {
            alert("Этот товар не поддерживает кастомизацию");
            return;
        }
        // Navigate to configurator page
        window.location.href = "configurator.html";
    };
    const handleAddToCart = (product) => {
        console.log("Добавление в корзину:", product.name);
        // Здесь можно добавить логику для добавления товара в корзину
    };
    return (React.createElement("div", { className: "product-list" },
        React.createElement("h2", { className: "product-list__title" }, "\u041D\u0430\u0448\u0438 \u0442\u043E\u0432\u0430\u0440\u044B"),
        React.createElement("div", { className: "product-grid" }, products.map((product) => (React.createElement("div", { key: product.id, className: "product-card" },
            React.createElement("div", { className: "product-card__image-container" },
                React.createElement("img", { src: product.imageURL || product.image || "", alt: `${product.name} - oddiy базовая одежда`, className: "product-card__image", onError: (e) => {
                        // Заменяем на placeholder при ошибке загрузки
                        e.target.src = `https://via.placeholder.com/300x300/cccccc/666666?text=${ProductHelpers.getProductTypeLabel(product.type)}`;
                    } }),
                React.createElement("div", { className: "product-card__category" },
                    React.createElement("span", { className: "product-type-badge" }, "oddiy"),
                    ProductHelpers.isProductCustomizable(product) && (React.createElement("span", { className: "customizable-badge" }, "\u041A\u0430\u0441\u0442\u043E\u043C\u0438\u0437\u0430\u0446\u0438\u044F")))),
            React.createElement("div", { className: "product-card__content" },
                React.createElement("h3", { className: "product-card__title" }, product.name),
                product.description && (React.createElement("p", { className: "product-card__description" }, product.description)),
                React.createElement("div", { className: "product-card__sizes" },
                    React.createElement("span", { className: "sizes-label" }, "\u0420\u0430\u0437\u043C\u0435\u0440\u044B:"),
                    React.createElement("div", { className: "sizes-list" }, product.sizes.map((size) => (React.createElement("span", { key: size, className: "size-badge" }, size))))),
                React.createElement("div", { className: "product-card__colors" },
                    React.createElement("span", { className: "colors-label" }, "\u0426\u0432\u0435\u0442\u0430:"),
                    React.createElement("div", { className: "colors-list" },
                        product.colors.slice(0, 3).map((color) => (React.createElement("div", { key: color.code, className: "color-swatch", style: { backgroundColor: color.hex }, title: color.name }))),
                        product.colors.length > 3 && (React.createElement("span", { className: "more-colors" },
                            "+",
                            product.colors.length - 3)))),
                React.createElement("div", { className: "product-card__price" }, ProductHelpers.formatPrice(product.price)),
                React.createElement("div", { className: "product-card__actions" },
                    React.createElement("button", { className: `btn ${ProductHelpers.isProductCustomizable(product)
                            ? "btn--primary"
                            : "btn--disabled"}`, onClick: () => handleCustomize(product), disabled: !ProductHelpers.isProductCustomizable(product), "aria-label": `Настроить ${product.name}` }, ProductHelpers.isProductCustomizable(product)
                        ? "Настроить"
                        : "Недоступно")))))))));
};
export default ProductList;
