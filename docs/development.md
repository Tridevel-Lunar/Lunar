# LUNAR Frontend

Vite + React Router — web app, landing page, auth และ UI การเรียนรู้

**Product context:** [concept.md](concept.md) · [functional-spec.md](functional-spec.md)  
**Tech stack (เต็ม):** [stack.md](stack.md)  
**Stack:** Vite 7, React 19, React Router 7, Tailwind CSS v4, TypeScript, Three.js / R3F, Google Identity Services — วางแผนเพิ่ม Shadcn/ui, Blockly

## Commands

```bash
npm install
npm run dev          # Vite — http://localhost:3000
npm run build        # output → dist/
npm run preview      # preview production build
npm run lint
```

### Backend (local dev)

รัน FastAPI แยกที่ `localhost:8000` พร้อม PostgreSQL:

```bash
cd ../Backend
uvicorn app.main:app --reload --port 8000
```

Vite proxy ใน `vite.config.ts` ส่ง `/api` → `http://localhost:8000` (strip prefix `/api`)

ดู [../Backend/docs/development.md](../Backend/docs/development.md)

**Optional:** ทั้ง stack ผ่าน Docker Compose จาก workspace root (เมื่อมี `docker-compose.yml`) — `docker compose up --build`

## Environment

สร้าง `.env` ใน `Frontend/` (ไม่ commit):

| Variable | Default | ใช้เมื่อ |
|----------|---------|----------|
| `VITE_API_URL` | `/api` | เปลี่ยนเมื่อเรียก API ตรงไป backend (ไม่ผ่าน proxy) |
| `VITE_GOOGLE_CLIENT_ID` | _(ว่าง)_ | เปิด Google Sign-In — ต้องตรงกับ `GOOGLE_CLIENT_ID` บน backend |

ถ้าไม่ตั้ง `VITE_GOOGLE_CLIENT_ID` ปุ่ม Google จะไม่แสดง (email/password ยังใช้ได้)

### Google Sign-In setup (dev)

1. สร้าง OAuth 2.0 **Web application** client ใน [Google Cloud Console](https://console.cloud.google.com/)
2. **Authorized JavaScript origins:** `http://localhost:3000`, `http://127.0.0.1:3000`
3. OAuth consent screen: **External** + เพิ่ม test user (ถ้าอยู่ใน Testing mode)
4. ใส่ client ID ใน `Frontend/.env` และ `Backend/.env`
5. รีสตาร์ท `npm run dev` หลังแก้ `.env`

**Requirements:** Node.js 18.17+, npm 9+

## Product ↔ UI Mapping

| Product module | Landing tab (`PlatformSection`) | Route | เนื้อหาหลัก |
|----------------|--------------------------------|-------|-------------|
| **Space** | LEARN (เรียนรู้) | `/space` | 3D Model, Embedded, Physics, Programming |
| **Arena** | BUILD (สร้าง) | _(planned)_ | Visual Coding, Simulation |
| **Studio** | LAUNCH (ปล่อย) | `/studio` | พอร์ตโฟลิโอ, LAIKA, ต่อยอดไอเดีย |

ฟีเจอร์ LAIKA / LLM / RAG จะเรียก backend API — ไม่ implement ใน frontend โดยตรง

## Directory Map

```
Frontend/
├── index.html
├── vite.config.ts
├── src/
│   ├── main.tsx           # createRoot + BrowserRouter
│   ├── App.tsx            # React Router routes
│   ├── index.css          # Fonts, CSS variables, Tailwind
│   ├── pages/             # Home, Login, Register, Space, Studio
│   ├── routes/            # ProtectedRoute, GuestRoute, useAuthUser
│   ├── components/
│   │   ├── auth/          # GoogleSignInButton, GoogleOneTap, LoginForm, ...
│   │   ├── space/, studio/
│   │   └── ...            # Landing sections, Navbar, SpaceCanvas
│   ├── lib/
│   │   ├── api.ts         # User type, API helpers
│   │   ├── auth.ts        # signInWithGoogleCredential, getCurrentUser, logout
│   │   ├── googleIdentity.ts  # GIS script load, initialize, renderButton, One Tap
│   │   └── constants.ts   # API_URL
│   └── types/
│       └── google-identity.d.ts
├── docs/
├── tailwind.config.ts
└── tsconfig.json          # @/* → src/*
```

## Architecture

- **SPA** — Vite + React Router; ไม่มี server components
- **Section components** — แต่ละ section ของ landing อยู่ใน `components/<Section>.tsx`
- **Pages** — compose sections หรือ module UI
- **Canvas / WebGL** — `React.lazy()` + `<Suspense>` สำหรับ browser-only (ดู `HeroSection` → `SpaceCanvas`)
- **Auth** — httpOnly cookie จาก FastAPI; เรียก `/api/auth/*` (Vite proxy)
- **Google Sign-In** — Google Identity Services (`gsi/client`); credential ส่งไป `POST /auth/google/onetap`
- **Route guards** — `GuestRoute` (login/register) · `ProtectedRoute` (space/studio)
- **Styling** — Tailwind v4 utilities เป็นหลัก; `@theme` tokens ใน `index.css`

### Auth flow

```
Login/Register page
  ├─ Email/password → POST /api/auth/login | register → cookie
  ├─ GoogleSignInButton → GIS renderButton → credential → POST /api/auth/google/onetap → cookie
  └─ GoogleOneTap (GuestRoute) → auto prompt on guest pages

ProtectedRoute → GET /api/auth/me (cookie) → allow or redirect /login?next=
```

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
| ใช้ `credentials: "include"` กับ auth API | เก็บ JWT ใน localStorage (ใช้ httpOnly cookie) |
| ใช้ CSS variables จาก `index.css` | สี hex แบบ one-off เมื่อมี token แล้ว |

## Testing & Lint

```bash
npm run lint
```

Frontend ยังไม่มี unit test runner — auth/API ทดสอบผ่าน backend **pytest** (`cd ../Backend && pytest`) หรือ manual ที่ `/login`, `/register` + Swagger `/docs`

## Git

- Dev บน **`develop`** — ห้าม push ตรงไป **`main`**
- งานใหญ่: `feature/*` จาก `develop` → PR กลับ `develop`
- Release: PR **`develop` → `main`**

## Boundaries

- ห้ามเอา `lang="th"` ออกจาก `index.html`
- โค้ดอยู่ใน `Frontend/` เท่านั้น — ไม่ shared package กับ backend
- อย่าเพิ่ม dependency ถ้าไม่จำเป็น
- ห้าม commit `.env` หรือ Google client secrets

## Deploy

```bash
npm run build   # → dist/
```

Serve `dist/` เป็น static files พร้อม SPA fallback (`/* → index.html`). ตั้ง `VITE_API_URL` และ `VITE_GOOGLE_CLIENT_ID` สำหรับ production origin ใน build env.

## JIT Index

```bash
rg "LEARN|BUILD|LAUNCH" src/components/PlatformSection.tsx
rg "lazy\\(" src/
rg "googleIdentity|GoogleSignIn" src/
rg "--bg|--cyan|--teal" src/index.css
```
