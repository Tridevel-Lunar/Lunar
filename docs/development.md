# LUNAR Frontend

Next.js 16 — web app, landing page และ UI การเรียนรู้

**Product context:** [concept.md](concept.md)  
**Tech stack (เต็ม):** [stack.md](stack.md)  
**Stack:** Next.js 16, React 19, Tailwind CSS v4, TypeScript, Three.js / R3F — วางแผนเพิ่ม Shadcn/ui, Framer Motion, Blockly

## Commands

```bash
npm install
npm run dev      # http://localhost:3000 (Turbopack)
npm run build
npm run start
npm run lint
```

### Docker (จาก `Lunar/` root)

```bash
docker compose -f compose.dev.yaml up --build
```

ดู [../../docs/docker-dev.md](../../docs/docker-dev.md)

**Requirements:** Node.js 18.17+, npm 9+

## Product ↔ UI Mapping

| Product module | Landing tab (`PlatformSection`) | เนื้อหาหลัก |
|----------------|--------------------------------|-------------|
| **Space** | LEARN (เรียนรู้) | 3D Model, Embedded, Physics, Programming |
| **Arena** | BUILD (สร้าง) | Visual Coding, Simulation |
| **Studio** | LAUNCH (ปล่อย) | พอร์ตโฟลิโอ, LAIKA, ต่อยอดไอเดีย |

ฟีเจอร์ LAIKA / LLM / RAG จะเรียก backend API — ไม่ implement ใน frontend โดยตรง

## Directory Map

```
frontend/
├── app/
│   ├── layout.tsx       # Root layout, metadata, lang="th"
│   ├── page.tsx         # Home — assembles section components
│   └── globals.css      # Fonts, CSS variables, Tailwind
├── components/
│   ├── SpaceCanvas.tsx  # Hero 3D/Canvas animation (client-only)
│   ├── Navbar.tsx
│   ├── HeroSection.tsx
│   ├── WhySpace.tsx     # ทำไมต้องอวกาศ / เศรษฐกิจอวกาศไทย
│   ├── PlatformSection.tsx  # LEARN / BUILD / LAUNCH tabs
│   ├── JoinSection.tsx
│   ├── Footer.tsx
│   └── StarField.tsx
├── docs/
│   ├── concept.md
│   ├── stack.md         # Tech stack FE/BE
│   └── development.md   # This file
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json        # @/* → ./*
```

## Architecture

- **App Router only** — `app/`, ไม่มี `pages/`
- **Section components** — แต่ละ section ของ landing อยู่ใน `components/<Section>.tsx`
- **`page.tsx` บาง** — compose sections เท่านั้น
- **Canvas / WebGL** — `"use client"` + `dynamic(..., { ssr: false })` สำหรับ browser-only (ดู `HeroSection` → `SpaceCanvas`)
- **Styling** — Tailwind v4 ใน `globals.css`; theme tokens ใน `:root`

## Code Style

- Import ด้วย `@/` (`@/components/Navbar`)
- Functional components; `"use client"` เมื่อจำเป็นเท่านั้น
- สีจาก CSS variables (`--bg`, `--cyan`, `--teal`, `--amber`, `--text`, `--muted`)
- Fonts: `Noto Sans Thai` (body), `Syne` (`.font-en`), `Space Mono` (`.font-mono`)
- ข้อความ UI ภาษา**ไทย**; ชื่อ component/code ภาษา**อังกฤษ**
- ชื่อ product: **Space**, **Arena**, **Studio**, **LAIKA**

### Component Pattern

```tsx
// Server component (default)
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>{/* sections */}</main>
    </>
  );
}
```

```tsx
// Client — canvas / animation
"use client";
import dynamic from "next/dynamic";

const SpaceCanvas = dynamic(() => import("./SpaceCanvas"), { ssr: false });
```

## Landing Sections

1. **Hero** — space canvas, brand intro (Thailand Deep Tech Space Program)
2. **Why Space** — แรงจูงใจ / ประโยชน์อวกาศต่อไทย (การ์ด interactive)
3. **Platform** — LEARN / BUILD / LAUNCH → Space / Arena / Studio
4. **Join** — enrollment + email signup CTA

## Do / Don't

| Do | Don't |
|----|-------|
| อ้างอิง [concept.md](concept.md) เมื่อเพิ่มฟีเจอร์ product | สร้างชื่อ module ใหม่ที่ขัด Space/Arena/Studio |
| Colocate section UI ใน `components/` | ใส่ business logic หนักใน `page.tsx` |
| `dynamic` + `ssr: false` สำหรับ Three.js/Canvas | Import WebGL ใน server components |
| เรียก LAIKA/RAG ผ่าน backend API | ฝัง LLM keys หรือ RAG logic ใน frontend |
| ใช้ CSS variables จาก `globals.css` | สี hex แบบ one-off เมื่อมี token แล้ว |

## Testing & Lint

```bash
npm run lint
```

ยังไม่มี test runner — ถ้าเพิ่ม ใช้ Vitest + React Testing Library, colocate `*.test.tsx`

## Boundaries

- ห้ามแก้ `next-env.d.ts` เอง
- ห้ามเอา `lang="th"` ออกจาก root layout
- โค้ดอยู่ใน `frontend/` เท่านั้น — ไม่ shared package กับ backend
- อย่าเพิ่ม dependency ถ้าไม่จำเป็น

## JIT Index

```bash
rg "LEARN|BUILD|LAUNCH" components/PlatformSection.tsx
rg -l '"use client"' .
rg "--bg|--cyan|--teal" app/globals.css
rg "dynamic\\(" components/
```
