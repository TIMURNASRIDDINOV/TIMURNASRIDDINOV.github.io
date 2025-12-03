// types/Product.ts - Product Schema Definition for Clothing Store
// Example usage and validation helpers
export class ProductValidator {
    static isValidProduct(product) {
        return (typeof product.id === "number" &&
            typeof product.name === "string" &&
            typeof product.type === "string" &&
            Array.isArray(product.sizes) &&
            Array.isArray(product.colors) &&
            typeof product.price === "number" &&
            typeof product.imageURL === "string" &&
            typeof product.customizable === "boolean");
    }
    static validateProductColor(color) {
        return (typeof color.name === "string" &&
            typeof color.code === "string" &&
            typeof color.hex === "string" &&
            /^#[0-9A-F]{6}$/i.test(color.hex));
    }
    static validateProductSize(size) {
        const validSizes = ["XS", "S", "M", "L", "XL", "XXL"];
        return validSizes.includes(size);
    }
}
// Helper functions
export const ProductHelpers = {
    formatPrice: (price, locale = "ru-RU", currency = "RUB") => {
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 0,
        }).format(price);
    },
    getProductTypeLabel: (type, locale = "ru") => {
        const labels = {
            "t-shirt": { ru: "Футболка", en: "T-Shirt" },
            underwear: { ru: "Белье", en: "Underwear" },
            hoodie: { ru: "Худи", en: "Hoodie" },
            "tank-top": { ru: "Майка", en: "Tank Top" },
            shorts: { ru: "Шорты", en: "Shorts" },
            dress: { ru: "Платье", en: "Dress" },
            jacket: { ru: "Куртка", en: "Jacket" },
            pants: { ru: "Брюки", en: "Pants" },
            skirt: { ru: "Юбка", en: "Skirt" },
            sweater: { ru: "Свитер", en: "Sweater" },
        };
        return labels[type]?.[locale] || type;
    },
    generateSlug: (name) => {
        return name
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    },
    isProductCustomizable: (product) => {
        return product.customizable === true;
    },
    getAvailableSizes: (product) => {
        return product.sizes.filter(Boolean);
    },
    getAvailableColors: (product) => {
        return product.colors.filter((color) => ProductValidator.validateProductColor(color));
    },
};
