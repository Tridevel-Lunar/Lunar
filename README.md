# 🌙 LUNAR — Space Technology Learning Platform

แพลตฟอร์มการเรียนรู้เทคโนโลยีอวกาศ — ทำให้อวกาศจับต้องได้และเห็นภาพนำไปใช้จริงในไทย

**ฟีเจอร์หลัก:** **Space** (เรียนรู้) · **Arena** (ลงมือปฏิบัติ) · **Studio** (สร้างสรรค์ต่อ + LAIKA)  
รายละเอียด: [docs/concept.md](docs/concept.md)

> Repo นี้เป็น **git submodule** ใน workspace [lunar-dev](https://github.com/Tridevel-Lunar/lunar-dev) — แนะนำรันทั้ง stack จาก workspace root

## Quick Start

### Docker (recommended)

จาก workspace root (`lunar-dev`):

```bash
cp .env.example .env          # ครั้งแรก — ใส่ GOOGLE_CLIENT_ID ถ้าใช้ Google Sign-In
docker compose up --build     # frontend + backend + PostgreSQL
```

App: http://localhost:3000 · API ผ่าน Vite proxy `/api`  
รายละเอียด: [../../docs/docker-dev.md](../../docs/docker-dev.md)

### Local (frontend only)

ต้องมี backend + PostgreSQL รันอยู่ (Docker หรือ uvicorn แยก):

```bash
npm install
npm run dev          # Vite — http://localhost:3000
```

ตั้ง `GOOGLE_CLIENT_ID` ใน env ของ Vite process (หรือใช้ Docker ที่ compose ส่งค่าให้แล้ว)  
ดู [docs/development.md](docs/development.md#environment)

## Requirements

- Node.js 18.17+, npm 9+
- Backend API + PostgreSQL (auth / Studio / LAIKA)
- Workspace clone: `git clone --recurse-submodules …` แล้ว checkout `develop` ใน submodule นี้

## Tech Stack

- **Vite 7** + **React 19** + **React Router 7**
- Tailwind CSS v4, TypeScript
- Three.js / React Three Fiber (Blender → `.gltf`)
- Framer Motion, react-icons
- Google Identity Services (Sign in with Google) — env: `GOOGLE_CLIENT_ID`
- Backend: Python **FastAPI** — ดู [../backend/docs/development.md](../backend/docs/development.md)
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
- Workspace Docker: [../../docs/docker-dev.md](../../docs/docker-dev.md)
