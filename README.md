# Flam — Multi-Surface Adaptive Ad Engine

A type-safe, constraint-based layout engine built with TypeScript and React that takes a single declarative ad specification and automatically adapts it across all 6 standard aspect ratios and display surfaces.

---

## 📱 Supported Standard Screen Sizes

| Surface Name | Aspect Ratio | Dimensions (px) | Layout Mode |
|---|---|---|---|
| **Widescreen Landscape** | **16:9** | $1920 \times 1080$ | Two-Column Split |
| **Full Vertical / Stories** | **9:16** | $1080 \times 1920$ | Vertical Stack |
| **Universal Square** | **1:1** | $1080 \times 1080$ | Vertical Stack |
| **Standard Portrait** | **4:5** | $1080 \times 1350$ | Vertical Stack |
| **Presentation Landscape** | **4:3** | $1024 \times 768$ | Two-Column Split |
| **Classic Photo Portrait** | **3:4** | $1200 \times 1600$ | Vertical Stack |

---

## 🎨 Theme & Interactive Customization
- **Modern Black, Blue & White Theme**: Deep black backdrop (`#050507`), vibrant blue active accents (`#2563eb`), and high-contrast white typography (`#ffffff`).
- **Content Options Drawer**: Click **`[Sliders] Content Options`** to customize:
  - Headline text
  - Price / Tagline
  - CTA Button label
  - Hero image URL
  - Card background color (defaults to black)
  - CTA accent color (defaults to electric blue)

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Run automated unit tests
npm test

# 4. Build for production
npm run build
```
