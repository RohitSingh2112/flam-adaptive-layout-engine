# Flam — Multi-Surface Adaptive Ad Engine

[![Live Demo](https://img.shields.io/badge/Live_Demo-Active-emerald?style=for-the-badge&logo=googlechrome&logoColor=white)](https://rohitsingh2112.github.io/flam-adaptive-layout-engine/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vitest](https://img.shields.io/badge/Tests-8%20Passed-success?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

> **Frontend R&D Assignment — Option 1: Adaptive Layout Engine for Multi-Surface Ads**  
> A declarative, constraint-based layout engine built with **TypeScript** and **React** that dynamically adapts a single ad specification across 6 standard aspect ratios without hardcoded layout templates or CSS media query hacks.

---

## 🌐 Live Application
Experience the interactive engine live in your browser:  
👉 **[https://rohitsingh2112.github.io/flam-adaptive-layout-engine/](https://rohitsingh2112.github.io/flam-adaptive-layout-engine/)**

---

## 📱 Supported Target Aspect Ratios

The engine computes layout positioning mathematically based on continuous aspect ratios ($AR = \text{Width} / \text{Height}$):

| Surface Name | Aspect Ratio | Dimensions | Layout Topology | Best For |
|---|---|---|---|---|
| **Widescreen Landscape** | **16:9** | $1920 \times 1080\text{px}$ | Two-Column Split | TV screens, digital display boards, website banners, Full HD displays. |
| **Full Vertical / Stories** | **9:16** | $1080 \times 1920\text{px}$ | Vertical Cascade | Mobile screens, Instagram Stories, TikTok, YouTube Shorts. |
| **Universal Square** | **1:1** | $1080 \times 1080\text{px}$ | Vertical Cascade | Instagram feed posts, Facebook ads, centered digital flyers. |
| **Standard Portrait** | **4:5** | $1080 \times 1350\text{px}$ | Vertical Cascade | Vertical social posts (maximized screen height without cutoff). |
| **Presentation Landscape** | **4:3** | $1024 \times 768\text{px}$ | Two-Column Split | Presentation slides, iPad screens, traditional desktop displays. |
| **Classic Photo Portrait** | **3:4** | $1200 \times 1600\text{px}$ | Vertical Cascade | E-commerce product showcases, digital lookbooks, blog cards. |

---

## ✨ Key Features & Technical Highlights

1. **Single Source of Truth (`src/spec.ts`)**:
   - The ad is declared once with semantic roles (`headline`, `description`, `hero`, `price`, `cta`, `logo`) and explicit priority levels (`P1 = Critical`, `P2 = Secondary`, `P3 = Supplemental`).
2. **Algorithmic Constraint Resolution (`src/resolver.ts`)**:
   - **Zero Hardcoded CSS**: Uses continuous aspect ratio calculation rather than `if (surface === 'mobile')` branches.
   - **Proportional Density Scaling**: Elements automatically scale relative to canvas resolution so Full HD ($1920\times 1080$) and mobile viewports render with balanced typography and tap targets.
3. **Interactive Content Options**:
   - Live customizable fields for **Headline**, **Description**, **Price**, **CTA Button Label**, **Hero Image URL**, and **Brand Theme Colors** (Black, Blue & White).
4. **Collision Avoidance & Verification**:
   - Guaranteed non-overlapping bounding boxes $(x, y, \text{width}, \text{height})$ strictly respecting surface safe areas.
   - Optional **Debug Boxes** overlay mode for visual inspection of element rects and priority tags.

---

## 🛠️ Project Structure

```
flam-adaptive-layout-engine/
├── src/
│   ├── spec.ts          # Declarative Ad Spec schema, types & content model
│   ├── surfaces.ts      # 6 standard aspect ratio surface definitions & constraints
│   ├── resolver.ts      # Pure mathematical constraint solver & degradation engine
│   ├── render-dom.tsx   # DOM/CSS presentation renderer with smooth animations
│   ├── App.tsx          # Interactive showcase dashboard with Content Options drawer
│   ├── main.tsx         # Application entry point
│   └── index.css        # Tailwind directives & global styling
├── tests/
│   └── resolver.test.ts # Vitest automated test suite (8 unit tests)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 💻 Local Development & Testing

### 1. Clone & Install
```bash
git clone https://github.com/RohitSingh2112/flam-adaptive-layout-engine.git
cd flam-adaptive-layout-engine
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```
Open `http://localhost:5173` to test the interactive preview.

### 3. Run Automated Tests
```bash
npm test
```
Executes 8 automated unit tests verifying constraint solving, collision detection, and degradation.

### 4. Build for Production
```bash
npm run build
```
Compiles a production bundle into `dist/`.
