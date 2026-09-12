# Flam — Multi-Surface Adaptive Ad Engine

A type-safe, constraint-based layout engine built with TypeScript and React that takes a single declarative content specification and automatically resolves it across all major standard aspect ratios and display surfaces.

---

## 📱 Supported Screen Sizes & Aspect Ratios

| Surface Name | Aspect Ratio | Dimensions (px) | Best For |
|---|---|---|---|
| **Widescreen Landscape** | **16:9** | $1920 \times 1080$ | TV screens, digital display boards, website banners, Zoom presentations (Full HD standard). |
| **Full Vertical / Stories** | **9:16** | $1080 \times 1920$ | Mobile screens, Instagram Stories, TikTok, YouTube Shorts, vertical signage kiosks. |
| **Universal Square** | **1:1** | $1080 \times 1080$ | Instagram feed posts, Facebook ads, centered digital flyers. |
| **Standard Portrait** | **4:5** | $1080 \times 1350$ | Vertical social media posts (maximum screen space on phone feeds without cut off). |
| **Presentation Landscape** | **4:3** | $1024 \times 768$ | Standard presentation slides, iPad screens, traditional desktop monitor displays. |
| **Classic Photo Portrait** | **3:4** | $1200 \times 1600$ | E-commerce graphics, digital lookbooks, vertical blog flyers. |
| **Cramped Banner** | **3.5:1** | $380 \times 110$ | Priority-based degradation stress test (P3 logo drops cleanly). |

---

## 🎨 Interactive Content Customization
Click **Content Options** in the header to edit:
- **Headline Text** (dynamic text re-wrapping)
- **Price / Tagline** (secondary copy)
- **CTA Button Label** (action label)
- **Hero Image URL** (custom product visual)
- **Background Color** (color picker + hex)
- **CTA Accent Color** (color picker + hex)

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Run unit tests
npm test

# 4. Build for production
npm run build
```
