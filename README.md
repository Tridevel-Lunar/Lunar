# 🌙 LUNAR — Space Technology Learning Platform

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Requirements
- Node.js 18.17+ 
- npm 9+

## Tech Stack
- Next.js 16.2.9 (App Router + Turbopack)
- Tailwind CSS v4
- TypeScript
- Canvas API animations (no extra dependencies)
- Fonts: Syne, Space Mono, Noto Sans Thai

## Sections
1. **Hero** — Animated space canvas (satellites orbiting Earth, laser beams, moon rover, shooting stars)
2. **Why Space** — 4 key research pillars with hover cards (Thai descriptions)
3. **Research Topics** — 7 topics: Star Tracker, Air Bearing, CubeSat OS, Laser Comm, SAR, Electric Propulsion, Rocket GNC
4. **Platform** — BUILD / LAUNCH / CUSTOM IDEA tabs with live Canvas visuals
5. **Join** — 4-step enrollment flow + email signup CTA

## Project Structure
```
app/
  layout.tsx      — root layout + metadata
  page.tsx        — assembles all sections
  globals.css     — CSS variables, fonts, Tailwind
components/
  SpaceCanvas.tsx     — hero Canvas animation
  Navbar.tsx          — sticky nav
  HeroSection.tsx     — animated hero
  WhySpace.tsx        — reason cards
  ResearchSection.tsx — research topic explorer
  PlatformSection.tsx — learning platform tabs
  JoinSection.tsx     — CTA + email signup
  Footer.tsx          — footer
```
