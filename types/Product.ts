// types/Product.ts - Product Schema Definition for Clothing Store

export interface ProductColor {
  name: string; // Human-readable color name (e.g., "Белый", "Черный")
  code: string; // Code for API/form usage (e.g., "white", "black")
  hex: string; // Hex color code for display (e.g., "#FFFFFF", "#000000")
}

export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export type ProductType =
  | "t-shirt" // T-shirts
  | "underwear" // Underwear/briefs
  | "hoodie" // Hoodies/sweatshirts
  | "tank-top" // Tank tops/sleeveless shirts
  | "shorts" // Shorts
  | "dress" // Dresses
  | "jacket" // Jackets
  | "pants" // Pants/trousers
  | "skirt" // Skirts
  | "sweater"; // Sweaters

export interface Product {
  // Core product information
  id: number;
  name: string;
  type: ProductType;

  // Variant information
  sizes: ProductSize[];
  colors: ProductColor[];

  // Pricing and media
  price: number; // Price in kopecks or smallest currency unit
  imageURL: string; // Primary product image URL
  additionalImages?: string[]; // Additional product images

  // Customization
  customizable: boolean; // Whether this product supports customization
  customizationOptions?: {
    maxDesignSize?: string; // e.g., "20x20cm"
    allowedFileTypes?: string[]; // e.g., ["image/png", "image/jpeg"]
    designPlacements?: string[]; // e.g., ["front", "back", "left-chest"]
  };

  // Additional information
  description?: string;
  material?: string; // e.g., "100% Cotton", "Polyester blend"
  careInstructions?: string; // e.g., "Machine wash cold"
  brand?: string;
  category?: string; // Product category for filtering
  tags?: string[]; // Tags for search and filtering

  // Inventory and availability
  inStock?: boolean;
  stockQuantity?: number;
  restockDate?: Date;

  // SEO and metadata
  slug?: string; // URL-friendly identifier
  metaTitle?: string;
  metaDescription?: string;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;

  // Legacy fields for backward compatibility
  title?: string; // Old field name for name
  image?: string; // Old field name for imageURL
  category_legacy?: "tshirt" | "underwear"; // Old category system
}

// Product creation interface (for forms/API)
export interface CreateProductData {
  name: string;
  type: ProductType;
  sizes: ProductSize[];
  colors: ProductColor[];
  price: number;
  imageURL: string;
  customizable: boolean;
  description?: string;
  material?: string;
  brand?: string;
  customizationOptions?: Product["customizationOptions"];
}

// Product update interface
export interface UpdateProductData extends Partial<CreateProductData> {
  id: number;
}

// Product filter interface (for searching/filtering)
export interface ProductFilter {
  type?: ProductType[];
  sizes?: ProductSize[];
  colors?: string[]; // Color codes
  priceRange?: {
    min: number;
    max: number;
  };
  customizable?: boolean;
  inStock?: boolean;
  brands?: string[];
  categories?: string[];
  tags?: string[];
}

// Product sort options
export type ProductSortBy =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "created-asc"
  | "created-desc"
  | "popularity";

// API response interfaces
export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ProductSearchParams {
  query?: string;
  filter?: ProductFilter;
  sortBy?: ProductSortBy;
  page?: number;
  limit?: number;
}

// Example usage and validation helpers
export class ProductValidator {
  static isValidProduct(product: any): product is Product {
    return (
      typeof product.id === "number" &&
      typeof product.name === "string" &&
      typeof product.type === "string" &&
      Array.isArray(product.sizes) &&
      Array.isArray(product.colors) &&
      typeof product.price === "number" &&
      typeof product.imageURL === "string" &&
      typeof product.customizable === "boolean"
    );
  }

  static validateProductColor(color: any): color is ProductColor {
    return (
      typeof color.name === "string" &&
      typeof color.code === "string" &&
      typeof color.hex === "string" &&
      /^#[0-9A-F]{6}$/i.test(color.hex)
    );
  }

  static validateProductSize(size: any): size is ProductSize {
    const validSizes: ProductSize[] = ["XS", "S", "M", "L", "XL", "XXL"];
    return validSizes.includes(size);
  }
}

// Helper functions
export const ProductHelpers = {
  formatPrice: (price: number, locale = "ru-RU", currency = "RUB") => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  },

  getProductTypeLabel: (type: ProductType, locale = "ru") => {
    const labels: Record<ProductType, Record<string, string>> = {
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

  generateSlug: (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  },

  isProductCustomizable: (product: Product) => {
    return product.customizable === true;
  },

  getAvailableSizes: (product: Product) => {
    return product.sizes.filter(Boolean);
  },

  getAvailableColors: (product: Product) => {
    return product.colors.filter((color) =>
      ProductValidator.validateProductColor(color)
    );
  },
};
