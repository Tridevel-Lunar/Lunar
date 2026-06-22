# LUNAR Frontend

Next.js 16 — web app, landing page และ UI การเรียนรู้

**Product context:** [concept.md](concept.md) · [functional-spec.md](functional-spec.md)  
**Tech stack (เต็ม):** [stack.md](stack.md)  
**Stack:** Next.js 16, React 19, Tailwind CSS v4, TypeScript, Three.js / R3F — วางแผนเพิ่ม Shadcn/ui, Framer Motion, Blockly

## Commands

```bash
npm install
npm run dev          # Turbopack — http://localhost:3000
npm run build
npm run start
npm run lint
```

### Backend stack (จาก `Lunar/` root)

Frontend รันบนเครื่อง — backend + PostgreSQL ใช้ Docker:

```bash
docker compose up --build    # terminal แรก
cd frontend && npm run dev     # terminal ที่สอง
```

ดู [../../docs/docker-dev.md](../../docs/docker-dev.md)

**Env:** `cp .env.example .env.local` — ต้องมี `NEXT_PUBLIC_API_URL=http://localhost:8000` (หรือรัน `../../scripts/setup-env.ps1` จาก root)

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
- **Styling** — Tailwind v4 utilities เป็นหลัก; `@theme` tokens ใน `globals.css`; CSS เฉพาะ pseudo-element / keyframes

## Code Style

- Import ด้วย `@/` (`@/components/Navbar`)
- Functional components; `"use client"` เมื่อจำเป็นเท่านั้น
- สีจาก Tailwind theme (`bg-bg`, `text-cyan`, `text-muted` ฯลฯ) หรือ CSS variables (`--bg`, `--cyan`)
- Fonts (semantic utilities ใน `@theme`):
  - `font-thai` — Noto Sans Thai (body)
  - `font-en` — Syne (Navbar, Hero, Footer, Join, Research, auth logo)
  - `font-mono` — Space Mono (labels, CTAs, auth primary btn)
  - `font-display` — Orbitron (WhySpace headings)
  - `font-section-thai` — Sarabun (WhySpace / Platform ย่อหน้าไทย)
  - `font-platform` — Space Grotesk (Platform headings EN)
  - `font-ui-mono` — ui-monospace (Platform labels — ไม่ใช่ Space Mono)
- หลีกเลี่ยง inline `style={{}}` ใหม่ — ยกเว้น Three.js, dynamic accent colors (`--accent`), runtime animation duration
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

Frontend ยังไม่มี unit test runner — auth/API ทดสอบผ่าน backend **pytest** (`cd ../backend && pytest`) หรือ manual ที่ `/register` + Swagger `/docs`

## Git

- Dev บน **`develop`** — ห้าม push ตรงไป **`main`**
- งานใหญ่: `feature/*` จาก `develop` → PR กลับ `develop`
- Release: PR **`develop` → `main`**
- รายละเอียด: [../../docs/git-workflow.md](../../docs/git-workflow.md)

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
