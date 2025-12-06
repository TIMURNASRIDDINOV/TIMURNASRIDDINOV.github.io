# LOOM - Custom T-Shirt Design Platform

A modern, minimalist e-commerce platform for creating custom-designed t-shirts with real-time 3D preview and product customization.

🌐 **Live Site:** [looom.me](https://looom.me)

## 📁 Project Structure

```
TIMURNASRIDDINOV.github.io/
├── index.html                 # Main landing page
├── catalog.html               # Product catalog page
├── configurator.html          # T-shirt design configurator
├── products-catalog.js        # Vanilla JS product catalog logic
├── products-catalog.css       # Product card styling
├── ProductList.css            # Legacy product list styles
├── CNAME                      # Custom domain configuration (looom.me)
├── assets/
│   └── models/
│       └── oversized-tshirt.obj   # 3D model for catalog preview
├── images/
│   ├── tshirt.png            # Product thumbnail
│   └── tshirtgif.mp4         # Hero section video
└── products/
    ├── tshirt_basic-white_front_001.png.webp
    ├── sweatshirt_basic-white_front_001.png
    └── [additional product images]
```

## 🛠 Technologies Used

### Frontend

- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with:
  - CSS Grid & Flexbox for layouts
  - CSS Custom Properties (variables)
  - Responsive design with media queries
  - Glassmorphism effects (backdrop-filter)
  - Custom animations and transitions
- **Vanilla JavaScript** - No frameworks, pure DOM manipulation
- **Tailwind CSS** (via CDN) - Utility-first CSS framework

### Libraries (CDN)

- **React 18** - For legacy product list component
- **React DOM 18** - React rendering
- **Three.js** (v0.160.0) - 3D graphics and model rendering
- **Fabric.js** (v5.3.1) - Canvas manipulation for design configurator
- **Lucide Icons** - Modern icon library

### Fonts & Assets

- **Google Fonts** - Inter (weights: 300-900)
- **System Fonts Fallback** - -apple-system, BlinkMacSystemFont

## 📄 File Descriptions

### Core Pages

#### `index.html`

Main landing page featuring:

- **Navigation Bar** - Fixed header with glassmorphism effect, purple hover states (#2596be)
- **Hero Section** - Gradient background with video preview
- **Product Catalog** - Grid layout with vanilla JS product cards
- **Features Section** - 3-column grid highlighting platform benefits
- **Footer** - Contact info, links, newsletter signup

**Key Features:**

- Responsive navigation with CSS gap-based spacing
- Hero video with aspect ratio 1:1, max-width 420px
- Product catalog populated via `products-catalog.js`
- Mobile-first responsive design

#### `catalog.html`

Full product catalog with advanced features:

- Product filtering and search
- 3D model preview using Three.js
- Product grid with hover effects
- Integration with external product data

#### `configurator.html`

Interactive t-shirt design tool:

- Fabric.js canvas for design manipulation
- Real-time preview of custom designs
- Color selection and customization options
- Design upload and editing capabilities

### JavaScript Files

#### `products-catalog.js`

**Purpose:** Vanilla JavaScript product catalog renderer

**Functionality:**

- Renders 2 products (t-shirt 150k сум, sweatshirt 250k сум)
- Creates DOM elements dynamically using `createElement`/`appendChild`
- Formats prices with `toLocaleString('ru-RU')`
- Handles image loading errors with placeholder fallbacks
- Click handlers for "Настроить дизайн" buttons → `configurator.html`

**Key Functions:**

```javascript
formatPrice(price); // Formats to "150,000 сум"
createProductCard(product); // Builds card DOM structure
renderProducts(); // Targets #product-list-root
```

**Products Array:**

```javascript
[
  {
    id: 1,
    name: "Белая футболка",
    price: 150000,
    image: "products/tshirt_basic-white_front_001.png.webp",
  },
  {
    id: 2,
    name: "Белый свитшот",
    price: 250000,
    image: "products/sweatshirt_basic-white_front_001.png",
  },
];
```

### CSS Files

#### `products-catalog.css`

**Purpose:** Modern product card styling

**Key Classes:**

- `.product-grid` - CSS Grid (2 columns, auto-fit minmax(300px, 1fr))
- `.product-card` - Card container with hover effects
- `.product-card__image-container` - Image wrapper (280px height)
- `.product-card__image` - Scaled images (transform: scale(0.85))
- `.customize-btn` - Primary action button with transitions
- `.product-type-badge` - Overlay badge with backdrop-filter blur

**Responsive Breakpoints:**

- **Mobile (≤768px):** 1 column grid, 240px image height
- **Small Mobile (≤480px):** 200px image height, full-width buttons
- **Tablet (769-1024px):** 2 columns maintained, 260px image height

**Button Specificity:**

```css
.product-card
  .customize-btn.btn-primary; /* High specificity to override global .btn-primary */
```

#### `ProductList.css`

Legacy styling for React product component (currently unused in favor of vanilla JS).

## 🎨 Design System

### Color Palette

- **Primary Text:** `#0a0a0a` (Near black)
- **Secondary Text:** `#6b7280` (Gray)
- **Hover Accent:** `#2596be` (Cyan blue)
- **Background:** `#ffffff` (White)
- **Borders:** `rgba(0, 0, 0, 0.05-0.08)`

### Typography

- **Font Family:** Inter, -apple-system, BlinkMacSystemFont
- **Headings:** 700-900 weight, -0.02em letter-spacing
- **Body:** 400-500 weight, 1.5-1.65 line-height

### Spacing

- **Gap (Nav):** 1.25rem base, 1.5rem md, 2rem lg
- **Card Padding:** 1.5rem
- **Section Padding:** 6rem vertical (4rem mobile)

### Effects

- **Glassmorphism:** `backdrop-filter: blur(18px) saturate(140%)`
- **Shadows:** `0 2px 8px rgba(0,0,0,0.06)` → `0 12px 40px rgba(0,0,0,0.12)` on hover
- **Transitions:** `cubic-bezier(0.4, 0, 0.2, 1)` for smooth animations

## 🚀 Setup Instructions

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Web server (optional, for local development)
- No Node.js or build tools required

### Local Development

#### Option 1: Simple HTTP Server (Recommended)

```bash
# Using Python 3
cd TIMURNASRIDDINOV.github.io
python3 -m http.server 8000

# Using PHP
php -S localhost:8000

# Using Node.js (if installed)
npx serve
```

Then open: `http://localhost:8000`

#### Option 2: Direct File Access

Simply open `index.html` in your browser:

```bash
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

**Note:** Some features (like video autoplay) may require a web server.

### Production Deployment

#### GitHub Pages (Current Setup)

1. Repository is already configured for GitHub Pages
2. Custom domain: `looom.me` (configured via CNAME)
3. Deploys automatically on push to `main` branch

#### Manual Deployment

Upload these files to any static hosting:

- All `.html` files
- All `.css` and `.js` files
- `assets/`, `images/`, `products/` folders
- `CNAME` (if using custom domain)

**Supported Hosts:**

- Netlify
- Vercel
- Cloudflare Pages
- AWS S3 + CloudFront
- Any static file server

## 📦 Dependencies

### No Build Dependencies

This project runs entirely in the browser with **zero build steps**.

### CDN Libraries (Loaded at Runtime)

```html
<!-- Styling -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- React (legacy support) -->
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

<!-- 3D Graphics -->
<script type="importmap">
  "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
</script>

<!-- Canvas Manipulation -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>

<!-- Icons -->
<script src="https://unpkg.com/lucide@latest"></script>
```

### Browser Requirements

- **Modern Browsers:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **ES6+ Support Required**
- **CSS Grid & Flexbox Support**
- **backdrop-filter Support** (for glassmorphism effects)

## 🎯 Key Features

### 1. Product Catalog

- Vanilla JavaScript implementation (no framework)
- Dynamic DOM rendering
- Error-resilient image loading
- Responsive grid layout (2 cols → 1 col mobile)
- Smooth hover animations

### 2. Navigation

- Fixed glassmorphism header
- Responsive gap-based spacing
- Animated underline on hover (slides from center)
- Mobile-friendly (collapses on small screens)

### 3. Hero Section

- Gradient background with radial effects
- Embedded video preview (aspect-ratio 1:1)
- CTA buttons with hover states
- Fully responsive layout

### 4. Mobile Optimization

- Breakpoints: 480px, 768px, 1024px
- Touch-friendly button sizes
- Optimized image scaling
- Flexible layouts with CSS Grid/Flexbox

## 📱 Mobile Responsiveness

### Breakpoints

```css
/* Small Mobile */
@media (max-width: 480px) {
}

/* Mobile */
@media (max-width: 768px) {
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
}

/* Desktop */
@media (min-width: 1025px) {
}
```

### Mobile Fixes

- **Hero Video:** Centered, max-width 100%, maintains aspect ratio
- **Product Cards:** Single column, full-width buttons
- **Navigation:** Hidden on mobile (needs hamburger menu implementation)
- **Images:** Scaled appropriately, no overflow

## 🔧 How to Run Locally

### Quick Start

```bash
# Clone the repository
git clone https://github.com/TIMURNASRIDDINOV/TIMURNASRIDDINOV.github.io.git

# Navigate to directory
cd TIMURNASRIDDINOV.github.io

# Start local server (choose one method)
python3 -m http.server 8000
# OR
php -S localhost:8000
# OR
npx serve

# Open in browser
open http://localhost:8000
```

### Testing

1. Open browser DevTools (F12)
2. Toggle device emulation (Ctrl+Shift+M / Cmd+Shift+M)
3. Test at breakpoints: 320px, 375px, 425px, 768px, 1024px
4. Verify:
   - Navigation responsiveness
   - Hero video positioning
   - Product card layouts
   - Image scaling
   - Button interactions

## 🐛 Known Issues & Future Improvements

### Current Limitations

- [ ] No mobile hamburger menu (nav hidden on mobile)
- [ ] Legacy React code not fully removed
- [ ] Missing loading states for images
- [ ] No dark mode support

### Planned Features

- [ ] Mobile navigation drawer
- [ ] Product filtering/sorting
- [ ] Shopping cart functionality
- [ ] User authentication
- [ ] Order management system
- [ ] Payment integration

## 📄 License

This project is proprietary. All rights reserved.

## 👤 Author

**TIMUR NASRIDDINOV**

- Website: [looom.me](https://looom.me)
- GitHub: [@TIMURNASRIDDINOV](https://github.com/TIMURNASRIDDINOV)

## 🙏 Acknowledgments

- **Three.js** - 3D graphics library
- **Fabric.js** - Canvas manipulation
- **Tailwind CSS** - Utility-first CSS
- **Lucide Icons** - Icon library
- **Google Fonts** - Inter typeface

---

**Last Updated:** December 6, 2025
