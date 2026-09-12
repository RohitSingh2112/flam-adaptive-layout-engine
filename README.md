# Flam — Multi-Surface Adaptive Ad Engine

An adaptive layout engine built with TypeScript and React that takes a single declarative content specification and automatically resolves it across all major ad surfaces and aspect ratios.

---

## 📱 Supported Target Surfaces

| Surface Name | Dimensions | Aspect Ratio | Template Mode |
|---|---|---|---|
| **Square** | $1080 \times 1080$ | 1:1 | `text-dominant` |
| **Portrait / Story** | $1080 \times 1920$ | 9:16 | `text-dominant` |
| **Landscape** | $1200 \times 628$ | 1.91:1 | `text-dominant` |
| **Medium Rectangle** | $300 \times 250$ | 1.2:1 | `text-dominant` |
| **Leaderboard** | $728 \times 90$ | 8.09:1 | `stacked` |
| **Wide Billboard** | $1920 \times 540$ | 3.56:1 | `text-dominant` |

---

## 🎨 Interactive Content Customization
The live dashboard includes a real-time **Content** panel:
- **Brand Name**: Configurable brand label (default: `SonicWave`).
- **Headline**: Dynamic headline text.
- **Description**: Body description (dynamically dropped on thin banners to prevent overflow).
- **CTA Text**: Configurable action button (default: `Shop Now`).
- **Hero Image URL**: Configurable product visual.
- **Brand Colors**:
  - Primary Background color (e.g. `#0f172a`).
  - Secondary Accent color (e.g. `#e94560`).
- **Focal Point**: Live $X$ and $Y$ positioning sliders ($0.0 - 1.0$) for smart image cropping.

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
