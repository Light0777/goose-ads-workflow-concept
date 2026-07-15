# Gooseworks Ads — Workflow Concept

A UI prototype for [Gooseworks Ads](https://make.gooseworks.ai/) — an ad creative studio — built as a Next.js + Tailwind CSS + TypeScript single-page application.

## Case Study: Gooseworks Ads

This project reimagines the [Gooseworks Ads](https://make.gooseworks.ai/) creative studio interface as a design-to-code concept, adding several workflow improvements:

### Improvements Implemented

| Area | Detail |
|------|--------|
| **Image Selection UX** | Multi-select grid with visual check marks and orange selection borders; selected images appear as ref chips in the composer |
| **Generate Flow** | Full chat-style generation view with image thumbnails, prompt display, circular progress ring, shimmer placeholder animations, and Download/Share actions |
| **History Sidebar** | Hamburger-menu sidebar with placeholder history entries; clicking loads a prior generation back into the chat view |
| **Responsive Layout** | Breakpoints at 1100px / 768px / 680px / 640px / 480px with grid columns (5→3→2→1), mobile sidebar full-width, and scaled text/padding throughout |
| **Mobile Optimization** | Composer buttons collapse to circular icon-only at <640px, filter scrollbar hidden, breadcrumb and brand label scale down |
| **Composer** | Fixed-bottom prompt bar with model selector, auto-resizing textarea, ref chips with remove button, and segmented Plan/Generate action buttons |
| **Filter Bar** | Horizontally scrollable chip filters (All, Clean, Premium, etc.) with active state styling |
| **Icon System** | All icons sourced from [HugeIcons CDN](https://cdn.hugeicons.com/) using stroke-rounded variants |
| **Breadcrumb** | "Ad Studio / Mybrand / Create" navigation with responsive scaling |

### Tech Stack

- **Next.js 16** (App Router)
- **Tailwind CSS v4**
- **TypeScript**
- **HugeIcons** (via CDN)
- **Geist** font family

### Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
