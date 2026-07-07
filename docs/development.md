# LUNAR Frontend

Vite + React Router — web app, landing page และ UI การเรียนรู้

**Product context:** [concept.md](concept.md) · [functional-spec.md](functional-spec.md)  
**Tech stack (เต็ม):** [stack.md](stack.md)  
**Stack:** Vite, React 19, React Router, Tailwind CSS v4, TypeScript, Three.js / R3F — วางแผนเพิ่ม Shadcn/ui, Blockly

## Commands

```bash
npm install
npm run dev          # Vite — http://localhost:3000
npm run build        # output → dist/
npm run preview      # preview production build
npm run lint
```

### Backend stack (จาก `Lunar/` root)

ทั้ง stack รันใน Docker (Vite HMR + volume mount):

```bash
docker compose up --build    # http://localhost:3000
```

ดู [../../docs/docker-dev.md](../../docs/docker-dev.md)

**Optional (hot reload บนเครื่อง):** `npm run dev` — Vite proxy ส่ง `/api` ไป `localhost:8000`

**Env:** ไม่จำเป็นสำหรับ Docker compose (API same-origin). สำหรับ `npm run dev` บนเครื่อง ใช้ `frontend/.env.example` (ว่าง = ใช้ proxy)

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
├── index.html
├── Dockerfile.dev         # Vite dev (compose — volume mount)
├── vite.config.ts
├── src/
│   ├── main.tsx           # createRoot + BrowserRouter
│   ├── App.tsx            # React Router routes
│   ├── index.css          # Fonts, CSS variables, Tailwind
│   ├── pages/             # Route pages
│   ├── routes/            # ProtectedRoute, GuestRoute
│   ├── components/        # Landing sections, auth, space demo, R3F canvas
│   └── lib/               # api.ts, auth.ts, constants.ts
├── docs/
├── tailwind.config.ts
└── tsconfig.json          # @/* → src/*
```

## Architecture

- **SPA** — Vite + React Router; ไม่มี server components
- **Section components** — แต่ละ section ของ landing อยู่ใน `components/<Section>.tsx`
- **Pages บาง** — compose sections เท่านั้น
- **Canvas / WebGL** — `React.lazy()` + `<Suspense>` สำหรับ browser-only (ดู `HeroSection` → `SpaceCanvas`)
- **Auth** — httpOnly cookie จาก FastAPI; API เรียก `/api/auth/*` (Vite proxy)
- **Styling** — Tailwind v4 utilities เป็นหลัก; `@theme` tokens ใน `index.css`; CSS เฉพาะ pseudo-element / keyframes

## Code Style

- Import ด้วย `@/` (`@/components/Navbar`)
- Functional components
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
import { lazy, Suspense } from "react";

const SpaceCanvas = lazy(() => import("./SpaceCanvas"));

// ...
<Suspense fallback={null}>
  <SpaceCanvas />
</Suspense>
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
| Colocate section UI ใน `components/` | ใส่ business logic หนักใน `pages/` |
| `React.lazy` + `Suspense` สำหรับ Three.js/Canvas | Import WebGL โดยตรงใน route ที่โหลดทันที |
| เรียก LAIKA/RAG ผ่าน backend API | ฝัง LLM keys หรือ RAG logic ใน frontend |
| ใช้ CSS variables จาก `index.css` | สี hex แบบ one-off เมื่อมี token แล้ว |

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

- ห้ามเอา `lang="th"` ออกจาก `index.html`
- โค้ดอยู่ใน `frontend/` เท่านั้น — ไม่ shared package กับ backend
- อย่าเพิ่ม dependency ถ้าไม่จำเป็น

## Deploy

```bash
npm run build   # → dist/
```

Serve `dist/` เป็น static files พร้อม SPA fallback (`/* → index.html`). ไม่ต้องมี Node server ใน production.

## JIT Index

```bash
rg "LEARN|BUILD|LAUNCH" src/components/PlatformSection.tsx
rg "lazy\\(" src/
rg "--bg|--cyan|--teal" src/index.css
```
