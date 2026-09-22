# DAMYAAN — THE FORBIDDEN LAIR

> A single-page, scroll-driven villain-lair cinematic web experience inspired by Damyaan (Chhota Bheem).

![Damyaan Banner](https://img.shields.io/badge/Experience-Cinematic%20Scroll-10b981?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-React%20%7C%20TypeScript%20%7C%20Vite%20%7C%20GSAP-047857?style=for-the-badge)
![Performance](https://img.shields.io/badge/FPS-60%20Buttery%20Smooth-10b981?style=for-the-badge)

---

## 🏛️ The Experience

The website is designed like an IMAX camera travelling through one continuous subterranean villain lair. Rather than using standard video elements that stutter or drop frames during scroll scrubbing, this project features an **Apple-grade Canvas frame-scrubbing engine** powered by **GSAP ScrollTrigger** and **Lenis** smooth scrolling.

### The 7 Chapters:
1. **Chapter 01: The Lair Awakens** — Dark underground environment with glowing serpentine eyes.
2. **Chapter 02: The Forbidden Gate** — Ancient stone doors parting with emerald mist.
3. **Chapter 03: Follow the Serpent** — Descent along the crypt pathway deeper into oblivion.
4. **Chapter 04: Damyaan (The Serpent Lord)** — Primary hero reveal with protected framing of his face, eyes, and hood.
5. **Chapter 05: The Chamber Remembers** — Reawakening of ancient dark power across the altars.
6. **Chapter 06: The Forbidden Ruins** — Subterranean relics and ancient lore of the forgotten kingdom.
7. **Chapter 07: Final Awakening** — The climax of dark magic with an interactive *"ENTER AGAIN"* ascension CTA.

---

## ✨ Features

- **Apple-Grade Canvas Frame-Scrubbing**: Instantaneous, 100% reversible 60 FPS scrubbing forwards and backwards.
- **Dual-Layer Responsive Framing**:
  - **Mobile**: Edge-to-edge `100svh` fitting with custom vertical offsets preserving character details.
  - **Desktop Widescreen**: High-clarity hero frame flanked by subtle ambient blurred extensions and feathered vignette masks.
- **Atmospheric Overlays**: Dynamic particle system with floating toxic emerald embers, ancient dust motes, and ambient lantern light.
- **Procedural Audio Engine**: Ambient subterranean serpent drone generated via Web Audio API (starts muted by default with an interactive HUD sound toggle).
- **Minimalist HUD**: Chapter counter (`01 / 07`), right-rail chapter jump dots, and a slide-out *Chronicles* codex.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/drago068/damyaan-website-chotta-bheem.git

# Navigate into project directory
cd damyaan-website-chotta-bheem

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:3000/` in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🛠️ Built With
- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Smooth Scroll**: [Lenis](https://github.com/darkroomengineering/lenis)
- **Animation & Scroll Control**: [GSAP](https://gsap.com/) + [ScrollTrigger](https://gsap.com/scrolltrigger/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio**: Web Audio API (Synthesized Ambient Drone)
