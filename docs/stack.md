# LUNAR Frontend — Tech Stack

รายละเอียดเครื่องมือที่ใช้และวางแผนใช้ฝั่ง frontend

**Backend stack:** [../../backend/docs/development.md](../../backend/docs/development.md)

## ภาษา

| ภาษา | การใช้งาน |
|------|-----------|
| **TypeScript / JavaScript** | Logic หน้าบ้าน, state management |
| **HTML5 / CSS3** | โครงสร้างเว็บ, UI layout |

## Framework & UI

| เครื่องมือ | สถานะ | บทบาท |
|-----------|--------|--------|
| **Vite + React Router** | ใช้อยู่ | SPA framework — React 19, client-side routing |
| **Tailwind CSS v4** | ใช้อยู่ | Styling หลัก — `@theme` tokens, utilities; CSS เฉพาะ auth pseudo-elements + keyframes |
| **Shadcn/ui** | วางแผน | คอมโพเนนต์พื้นฐาน (Button, Dialog, Form ฯลฯ) |
| **Framer Motion** | ใช้อยู่ | แอนิเมชัน auth — card entrance, ปุ่ม, error message |
| **react-icons** | ใช้อยู่ | ไอคอนทั่วไป (auth ใช้ inline SVG สำหรับ Google logo) |

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
| UI แชท / คำแนะนำ | Frontend |
| LLM + RAG | **Backend** (Gemini, LangChain/LlamaIndex) |

Frontend เรียก API เท่านั้น — ไม่ฝัง API keys

## สรุปการแบ่งงาน FE ↔ BE

| งาน | Frontend | Backend |
|-----|----------|---------|
| UI / State | ✓ | |
| 3D viewer (R3F) | ✓ | |
| Blockly editor | ✓ | |
| Orbital / physics calc | | ✓ (Poliastro, PyEphem) |
| Run block code / simulation | ส่ง request | ✓ |
| LAIKA LLM + RAG | แสดงผล | ✓ |
| Satellite imagery API | แสดงผล | ✓ |
| PostgreSQL (data) | | ✓ |
