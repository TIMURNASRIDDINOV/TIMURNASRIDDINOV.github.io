import React from "react";
import "./ProductList.css";
import { Product, ProductHelpers } from "./types/Product";

interface ProductListProps {
  products?: Product[];
}

const defaultProducts: Product[] = [
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
    // Legacy fields
    title: "Классическая футболка",
    image: "/images/tshirt1.jpg",
    category: "tshirt",
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
    // Legacy fields
    title: "Спортивная футболка",
    image: "/images/tshirt2.jpg",
    category: "tshirt",
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
    // Legacy fields
    title: "Боксеры Premium",
    image: "/images/underwear1.jpg",
    category: "underwear",
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
    // Legacy fields
    title: "Трусы-слипы",
    image: "/images/underwear2.jpg",
    category: "underwear",
  },
];

const ProductList: React.FC<ProductListProps> = ({
  products = defaultProducts,
}) => {
  const handleCustomize = (product: Product) => {
    if (!ProductHelpers.isProductCustomizable(product)) {
      alert("Этот товар не поддерживает кастомизацию");
      return;
    }
    console.log("Кастомизация товара:", product.name);
    // Здесь можно добавить логику для открытия модального окна кастомизации
  };

  const handleAddToCart = (product: Product) => {
    console.log("Добавление в корзину:", product.name);
    // Здесь можно добавить логику для добавления товара в корзину
  };

  return (
    <div className="product-list">
      <h2 className="product-list__title">Наши товары</h2>
      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-card__image-container">
              <img
                src={product.imageURL || product.image || ""}
                alt={product.name}
                className="product-card__image"
                onError={(e) => {
                  // Заменяем на placeholder при ошибке загрузки
                  (
                    e.target as HTMLImageElement
                  ).src = `https://via.placeholder.com/300x300/cccccc/666666?text=${ProductHelpers.getProductTypeLabel(
                    product.type
                  )}`;
                }}
              />
              <div className="product-card__category">
                {ProductHelpers.getProductTypeLabel(product.type)}
                {ProductHelpers.isProductCustomizable(product) && (
                  <span className="customizable-badge">🎨 Кастомизация</span>
                )}
              </div>
            </div>

            <div className="product-card__content">
              <h3 className="product-card__title">{product.name}</h3>
              {product.description && (
                <p className="product-card__description">
                  {product.description}
                </p>
              )}

              {/* Доступные размеры */}
              <div className="product-card__sizes">
                <span className="sizes-label">Размеры:</span>
                <div className="sizes-list">
                  {product.sizes.map((size) => (
                    <span key={size} className="size-badge">
                      {size}
                    </span>
                  ))}
                </div>
              </div>

              {/* Доступные цвета */}
              <div className="product-card__colors">
                <span className="colors-label">Цвета:</span>
                <div className="colors-list">
                  {product.colors.slice(0, 3).map((color) => (
                    <div
                      key={color.code}
                      className="color-swatch"
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                  {product.colors.length > 3 && (
                    <span className="more-colors">
                      +{product.colors.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="product-card__price">
                {ProductHelpers.formatPrice(product.price)}
              </div>

              <div className="product-card__actions">
                <button
                  className={`btn ${
                    ProductHelpers.isProductCustomizable(product)
                      ? "btn--secondary"
                      : "btn--disabled"
                  }`}
                  onClick={() => handleCustomize(product)}
                  disabled={!ProductHelpers.isProductCustomizable(product)}
                >
                  {ProductHelpers.isProductCustomizable(product)
                    ? "Кастомизировать"
                    : "Не кастомизируется"}
                </button>
                <button
                  className="btn btn--primary"
                  onClick={() => handleAddToCart(product)}
                >
                  В корзину
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
