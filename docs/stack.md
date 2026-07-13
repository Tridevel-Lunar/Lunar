# LUNAR Frontend — Tech Stack

รายละเอียดเครื่องมือที่ใช้และวางแผนใช้ฝั่ง frontend

**Backend stack:** [../../backend/docs/development.md](../../backend/docs/development.md)  
**Workspace Docker:** [../../docs/docker-dev.md](../../docs/docker-dev.md)

## ภาษา

| ภาษา | การใช้งาน |
|------|-----------|
| **TypeScript / JavaScript** | Logic หน้าบ้าน, state management |
| **HTML5 / CSS3** | โครงสร้างเว็บ, UI layout |

## Framework & UI

| เครื่องมือ | สถานะ | บทบาท |
|-----------|--------|--------|
| **Vite 7 + React Router 7** | ใช้อยู่ | SPA framework — React 19, client-side routing |
| **Tailwind CSS v4** | ใช้อยู่ | Styling หลัก — `@theme` tokens, utilities; CSS เฉพาะ auth pseudo-elements + keyframes |
| **Shadcn/ui** (base-vega) | ใช้อยู่ | Dialog, Button — Radix/Base UI + Tailwind tokens |
| **Framer Motion** | ใช้อยู่ | แอนิเมชัน auth — card entrance, ปุ่ม, error message |
| **react-icons** | ใช้อยู่ | ไอคอนทั่วไปใน UI |

## Authentication

| เครื่องมือ | สถานะ | บทบาท |
|-----------|--------|--------|
| **FastAPI auth API** | ใช้อยู่ | register, login, refresh, `/auth/me`, logout — httpOnly cookies `lunar_token` + `lunar_refresh` |
| **Google Identity Services (GIS)** | ใช้อยู่ | One Tap + `renderButton` — โหลด `accounts.google.com/gsi/client` |
| **`googleIdentity.ts`** | ใช้อยู่ | โหลด GIS script, `initialize()`, `renderGoogleSignInButton()`, `promptGoogleOneTap()` |
| **`auth.ts`** | ใช้อยู่ | `tryRefreshSession()`, `getCurrentUser()`, Google sign-in → `/auth/google/onetap` |

### Google Sign-In flow

```
Browser (GIS)  →  credential JWT
Frontend       →  POST /api/auth/google/onetap  (credentials: include)
Backend        →  verify token, upsert user in PostgreSQL, Set-Cookie (access + refresh)
Frontend       →  navigate to /space (or ?next=)

Access token หมดอายุ → `apiFetch` / `getCurrentUser` เรียก `POST /auth/refresh` แล้ว retry
```

- Client ID: `GOOGLE_CLIENT_ID` เดียวกันทั้ง frontend (GIS) และ backend (verify) — ตั้งใน workspace `.env`
- ไม่ใช้ client secret ฝั่ง frontend
- ปุ่ม login ใช้ `google.accounts.id.renderButton()` (ไม่ใช่ custom popup)

## 3D & Assets

| เครื่องมือ | บทบาท |
|-----------|--------|
| **Blender** | สร้าง 3D assets นอก repo — Chassis, OBC, Solar Panel, Camera Payload |
| **Three.js / React Three Fiber (R3F)** | ใช้อยู่ — โหลด `.gltf` / `.glb` จาก Blender แสดง 360° บนเบราว์เซอร์ |
| **KiCad** | ออกแบบอุปกรณ์อิเล็กทรอนิกส์ (นอก repo) — อ้างอิงใน Embedded System module |

Export จาก Blender → `public/models/` หรือ CDN (เมื่อมี)

## Arena — Visual Programming

| เครื่องมือ | บทบาท |
|-----------|--------|
| **Google Blockly** หรือ **react-blockly** | ห้องแล็บลากวางบล็อกคำสั่ง — Visual Programming Interface |

- Blockly สร้าง block graph → ส่งไป backend (FastAPI) เพื่อรัน/จำลอง
- ไม่ execute physics หนักฝั่ง browser

## Studio — LAIKA

| ส่วน | ที่รัน |
|------|--------|
| UI landing / แชท / branch map | Frontend |
| Collections + conversation tree | **Backend** (PostgreSQL) |
| LLM + RAG | **Backend** (Gemini / Groq / Ollama) |

Frontend เรียก API เท่านั้น — ไม่ฝัง API keys. แชทส่งประวัติพร้อม `created_at` และ `client_now`; ชื่อผู้เรียน inject ฝั่ง backend จาก session

## สรุปการแบ่งงาน FE ↔ BE

| งาน | Frontend | Backend |
|-----|----------|---------|
| UI / State | ✓ | |
| Auth UI + route guards | ✓ | |
| Google GIS (browser) | ✓ | |
| Google token verify + user upsert | | ✓ |
| 3D viewer (R3F) | ✓ | |
| Blockly editor | ✓ (planned) | |
| Orbital / physics calc | | ✓ (Poliastro, PyEphem) |
| Run block code / simulation | ส่ง request | ✓ |
| LAIKA LLM + RAG | แสดงผล | ✓ |
| Satellite imagery API | แสดงผล | ✓ |
| PostgreSQL (users, progress) | | ✓ |
