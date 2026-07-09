# 🌙 LUNAR — Space Technology Learning Platform

แพลตฟอร์มการเรียนรู้เทคโนโลยีอวกาศ — ทำให้อวกาศจับต้องได้และเห็นภาพนำไปใช้จริงในไทย

**ฟีเจอร์หลัก:** **Space** (เรียนรู้) · **Arena** (ลงมือปฏิบัติ) · **Studio** (สร้างสรรค์ต่อ + LAIKA)  
รายละเอียด: [docs/concept.md](docs/concept.md)

## Quick Start

```bash
npm install
npm run dev          # Vite — http://localhost:3000
```

**Backend:** รัน FastAPI ที่ `localhost:8000` พร้อม PostgreSQL — Vite proxy ส่ง `/api` ไป backend อัตโนมัติ  
ดู [../Backend/docs/development.md](../Backend/docs/development.md)

**Google Sign-In (optional):** ตั้ง `VITE_GOOGLE_CLIENT_ID` ใน `.env` — ดู [docs/development.md](docs/development.md#environment)

## Requirements

- Node.js 18.17+
- npm 9+
- Backend API + PostgreSQL (สำหรับ auth และข้อมูลผู้ใช้)

## Tech Stack

- **Vite 7** + **React 19** + **React Router 7**
- Tailwind CSS v4, TypeScript
- Three.js / React Three Fiber (Blender → `.gltf`)
- Framer Motion, react-icons
- Google Identity Services (Sign in with Google)
- Backend: Python **FastAPI** — ดู [../Backend/docs/development.md](../Backend/docs/development.md)
- Fonts: Syne, Space Mono, Noto Sans Thai, Orbitron, Sarabun, Space Grotesk

## Routes

| Path | Access | หน้า |
|------|--------|------|
| `/` | Public | Landing |
| `/login`, `/register` | Guest | Auth (email/password + Google) |
| `/space`, `/studio` | Protected | Product modules |
| `/dashboard` | Redirect | → `/space` |

## Landing Sections

| Section | เนื้อหา |
|---------|---------|
| **Hero** | Animated space canvas |
| **Why Space** | ทำไมอวกาศสำคัญต่อไทย / เศรษฐกิจอวกาศ |
| **Platform** | LEARN → Space · BUILD → Arena · LAUNCH → Studio |
| **Join** | Enrollment + email signup |

## Project Structure

```
src/
  main.tsx, App.tsx, index.css
  pages/              Home, Login, Register, Space, Studio
  routes/             ProtectedRoute, GuestRoute
  components/
    auth/             GoogleSignInButton, GoogleOneTap, LoginForm
    space/, studio/   Module demos
    HeroSection.tsx, Navbar.tsx, ...
  lib/
    api.ts, auth.ts, googleIdentity.ts, constants.ts
  types/
    google-identity.d.ts
docs/
  concept.md, functional-spec.md, development.md, stack.md
```

## Docs

- [concept.md](docs/concept.md) — วิสัยทัศน์ + product model
- [functional-spec.md](docs/functional-spec.md) — ฟีเจอร์ Space / Arena / Studio + auth
- [stack.md](docs/stack.md) — tech stack FE/BE, 3D pipeline, Blockly
- [development.md](docs/development.md) — commands, architecture, auth, code style
