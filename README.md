# 🌙 LUNAR — Space Technology Learning Platform

แพลตฟอร์มการเรียนรู้เทคโนโลยีอวกาศ — ทำให้อวกาศจับต้องได้และเห็นภาพนำไปใช้จริงในไทย

**ฟีเจอร์หลัก:** **Space** (เรียนรู้) · **Arena** (ลงมือปฏิบัติ) · **Studio** (สร้างสรรค์ต่อ + LAIKA)  
รายละเอียด: [docs/concept.md](docs/concept.md)

## Quick Start

```bash
npm install
npm run dev
```

หรือจาก `Lunar/` root: `docker compose -f compose.dev.yaml up --build`  
Docker: [../docs/docker-dev.md](../docs/docker-dev.md)

## Requirements

- Node.js 18.17+
- npm 9+

## Tech Stack

- Next.js 16 (App Router + Turbopack)
- Tailwind CSS v4, TypeScript
- Three.js / React Three Fiber (Blender → `.gltf`)
- Shadcn/ui, Framer Motion, Blockly (planned)
- Backend: Python **FastAPI** — ดู [../backend/docs/development.md](../backend/docs/development.md)
- Fonts: Syne, Space Mono, Noto Sans Thai

## Landing Sections

| Section | เนื้อหา |
|---------|---------|
| **Hero** | Animated space canvas |
| **Why Space** | ทำไมอวกาศสำคัญต่อไทย / เศรษฐกิจอวกาศ |
| **Platform** | LEARN → Space · BUILD → Arena · LAUNCH → Studio |
| **Join** | Enrollment + email signup |

## Project Structure

```
app/
  layout.tsx, page.tsx, globals.css
components/
  SpaceCanvas.tsx, HeroSection.tsx, WhySpace.tsx
  PlatformSection.tsx, JoinSection.tsx, Navbar.tsx, Footer.tsx
docs/
  concept.md        — วิสัยทัศน์ + product model
  development.md    — dev conventions
```

## Docs

- [concept.md](docs/concept.md) — สาระสำคัญ, Space / Arena / Studio, LAIKA, RAG
- [stack.md](docs/stack.md) — tech stack FE/BE, 3D pipeline, Blockly
- [development.md](docs/development.md) — commands, architecture, code style
