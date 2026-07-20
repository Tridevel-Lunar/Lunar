# LUNAR — Functional Specification

เอกสารรายละเอียดฟังก์ชันระดับโปรแกรม (อ้างอิง proposal §7.4)  
บริบท product: [concept.md](concept.md) · tech stack: [stack.md](stack.md)

## 7.4.1 Input / Output Specification

| | รายละเอียด |
|---|------------|
| **Input** | การกระทำต่าง ๆ ของผู้ใช้งานบนแพลตฟอร์ม (คลิก, ลาก, ปรับ slider, เขียนบล็อก, ส่งคำถาม LAIKA ฯลฯ) |
| **Output** | การตอบสนองของระบบต่อการกระทำของผู้ใช้ (UI feedback, progress, ผลจำลอง, ข้อความ error/success, คำแนะนำ AI) |

## 7.4.2 Functional Specification — ภาพรวม

| Module | Tagline | บทบาทหลัก |
|--------|---------|-----------|
| **Space** | Learn | เรียนรู้ทฤษฎีพื้นฐานวิศวกรรมอวกาศแบบ Interactive · **Courses** ประกอบด้วย **Modules** (ปัจจุบัน 4 โมดูลใน CubeSat course) |
| **Arena** | Build & Mission Simulation | สร้างตรรกะ Blockly + จำลองภารกิจในสภาพแวดล้อมอวกาศ |
| **Studio** | Launch, Tech-Transfer & Venture | เก็บผลงาน · LAIKA ช่วยต่อยอดไอเดีย · (อนาคต) แผนธุรกิจ / tech transfer |

---

## ฟีเจอร์ที่ 1: Space (Learn)

ระบบเรียนรู้ทฤษฎีพื้นฐานวิศวกรรมอวกาศแบบ **Interactive Learning**

### โครงสร้าง Course / Module

| ชั้น | ความหมาย | ตัวอย่าง |
|------|----------|---------|
| **Space** | Product (Learn) | `/space` |
| **Course** | หลักสูตรที่ลงทะเบียนใน registry | `cubesat-for-beginner` |
| **Module** | หน้า React แบบ custom ของเพื่อน / ทีม | `physics`, `overview`, `anatomy`, `programming` |

- แต่ละ course มีรายการ modules ตามลำดับใน `course.ts`
- แต่ละ module ส่งมอบ **custom page** (`lazy` component) ผ่าน `SpaceModuleDefinition.Component` — ไม่บังคับ layout เดียวกัน
- Route: `/space/course/:courseId/module/:moduleId` → `SpaceModuleRoute` resolve แล้ว render หน้าของโมดูลนั้น
- รายละเอียดสำหรับ contributor: [`src/components/space/courses/README.md`](../src/components/space/courses/README.md)

เนื้อหาเรียนรู้ที่วางแผนไว้ (map ไปยัง modules ของ course ปัจจุบัน):

### 1. โมเดล 3 มิติ (3D Model — Spatial Learning) · module `anatomy` / overview

| รายการ | รายละเอียด |
|--------|------------|
| **กิจกรรม** | หมุนดู CubeSat 101 แบบ 360° (Three.js / R3F) |
| **Exploded View** | ปรับ Slider แยกชิ้นส่วนแบบระเบิดวงแหวน — เรียนรู้โครงสร้างภายนอก |
| **Interactive detail** | คลิกชิ้นส่วน (เช่น Camera Payload) เพื่อเรียนรู้หน้าที่และการเชื่อมต่อ |

**Output:** ความเข้าใจโครงสร้างกายภาพ · progress ตามกิจกรรมที่ทำครบ

### 2. ระบบฝังตัว (Embedded System — Schematic Architecture) · (planned under course modules)

| รายการ | รายละเอียด |
|--------|------------|
| **กิจกรรม** | ลากเส้นจำลองสัญญาณ Data Bus และพลังงาน |
| **องค์ประกอบ** | เชื่อม OBC (On-Board Computer), EPS (Electrical Power System), กล้องถ่ายภาพ (Payload) เข้าล็อกที่ถูกต้อง |
| **เป้าหมาย** | จำลองการไหลของข้อมูล — ผู้เรียนเข้าใจในระดับพื้นฐานว่าระบบทำงานอย่างไร |

**Output:** แผนผังที่เชื่อมถูกต้อง / feedback เมื่อผิด

### 3. ฟิสิกส์ (Physics — Simulation-Based Trial) · module `physics`

| รายการ | รายละเอียด |
|--------|------------|
| **กิจกรรม** | แผงควบคุมปรับตัวแปรแบบ real-time |
| **เนื้อหา** | กฎพลังงาน · วงโคจรระดับต่ำ (LEO) · จัดสรร Power Budget · สถานการณ์เข้าเงามืดของโลก (Eclipse) |

**Output:** กราฟ/ตัวเลข power · สถานะวงโคจร · checkpoint

**Backend:** คำนวณ orbital / power budget (Poliastro, PyEphem) — ดู [backend/docs/development.md](../../backend/docs/development.md)

### 4. การเขียนโปรแกรม (Programming — Algorithmic Thinking) · module `programming`

| รายการ | รายละเอียด |
|--------|------------|
| **กิจกรรม** | กระดานเขียนคำสั่งควบคุมแบบภาพ (Google Blockly) |
| **เป้าหมาย** | ต่อบล็อก Logic ชุดแรกให้ดาวเทียม (Autopilot) ทำงานได้ในขอบเขตที่กำหนด |

**Output:** บล็อกที่ compile/validate ผ่าน · preview พฤติกรรม

### Space — Progress model

```
เรียนครบกิจกรรมใน modules ของ course → บันทึก progress → เปิด Arena เมื่อพร้อม
```

Progress ใน UI ปัจจุบันเป็น metadata ชั่วคราว (ยังไม่ persist ผ่าน API)

---

## ฟีเจอร์ที่ 2: Arena (Build & Mission Simulation)

ห้องจำลองสถานการณ์ทางอวกาศ — ผู้เรียนสร้างตรรกะการทำงานของดาวเทียมด้วย Blockly แล้วนำเข้าสภาพแวดล้อมจำลองเพื่อให้ภารกิจสำเร็จ

### Blockly Code Editor

| บล็อก / ความสามารถ | รายละเอียด |
|---------------------|------------|
| **Stable Orbit Loop** | ลูปตรวจเช็คความเสถียรวงโคจร |
| **Fault Tolerance** | ควบคุมอุปกรณ์ยามฉุกเฉิน |
| **Payload control** | สั่งเปิด/ปิด Payload ตามปริมาณพลังงานที่มี |
| **Editor UX** | ลากวางบล็อกซ้อนกัน — สไตล์ Google Blockly |

**Input:** การจัดเรียง/แก้ไขบล็อก  
**Output:** AST / mission script ส่งไป Simulation Engine

### Mission Feedback Window (Physics Reality Check)

| รายการ | รายละเอียด |
|--------|------------|
| **3D preview** | ดาวเทียม 3D วิ่งรอบโลกควบคู่กับ code ที่รัน |
| **Simulation Engine** | จำลองตามกฎฟิสิกส์ — sync กับบล็อกที่ผู้เรียนเขียน |
| **สำเร็จ** | แสดง Orbital Data / ผลลัพธ์ที่ถูกต้อง |
| **ไม่สำเร็จ** | แสดง error message อธิบายว่าตรรกะหรือเงื่อนไขใดผิด |

```
Blockly → Backend Simulation Engine → 3D + metrics / errors
```

---

## ฟีเจอร์ที่ 3: Studio (Launch, Tech-Transfer & Venture)

หลังภารกิจ Arena สำเร็จ → **Launch** เก็บในพอร์ตโฟลิโอ Studio ของผู้เรียน

### พอร์ตโฟลิโอ & ประวัติภารกิจ

- เก็บผลงาน / mission log ที่ทำสำเร็จ
- แสดงความก้าวหน้าและผลจำลองย้อนหลัง

### LAIKA (AI Mentor)

| รายการ | รายละเอียด |
|--------|------------|
| **บทบาท** | Mentor ภาษาไทยสุภาพ เป็นกลาง — ช่วยสรุป/อธิบาย/ต่อยอดโน้ตและไอเดีย (ไม่ใช้คำลงท้ายเจาะจงเพศ) |
| **โทนการสนทนา** | รู้ชื่อผู้เรียน (จากบัญชี) · รู้เวลาและช่วงห่างจากข้อความก่อนหน้า · ไม่ทักทายซ้ำทุกตอบ · ต้อนรับกลับเมื่อหายไปหลายวัน |
| **LLM** | Gemini / DeepSeek / Ollama (backend config) |
| **RAG** | อ้างอิงเอกสารวิศวกรรม / NASA CubeSat ฯลฯ — ลด hallucination |

**Studio landing:** ข้อความ hero แบบ static + typewriter (ไม่เรียก LLM) — สุ่มข้อความ casual / ต้อนรับกลับตาม last visit

**Studio chat:** multi-turn tree + `POST /laika/assist/stream` พร้อมประวัติและ timestamp

**Input:** คำถาม / ไอเดีย / ผลงานจากผู้เรียน  
**Output:** คำแนะนำ · คำถามชวนคิด · แนวทางพัฒนาต่อ · `sources[]`

### Roadmap (อนาคต)

- ฟอร์ม **แผนพัฒนาต่อยอดไอเดีย** (venture / tech transfer)
- ช่องทาง **จับคู่ผู้เชี่ยวชาญ** สำหรับคำปรึกษาด้าน IP / เทคโนโลยีอวกาศ

---

## การแมป Landing ↔ Product

| Landing (`PlatformSection`) | Module | Spec section |
|-----------------------------|--------|--------------|
| LEARN | **Space** | § Space — Courses / Modules |
| BUILD | **Arena** | § Blockly + Simulation |
| LAUNCH | **Studio** | § Portfolio + LAIKA |

---

## ฟีเจอร์ที่ 4: Authentication

ระบบเข้าสู่ระบบและสมัครสมาชิก — รองรับ email/password และ Google Sign-In

### Email / Password

| รายการ | รายละเอียด |
|--------|------------|
| **Register** | สร้างบัญชีด้วย email + password (≥ 8 ตัวอักษร) |
| **Login** | เข้าสู่ระบบด้วย email + password |
| **Session** | httpOnly cookies `lunar_token` (access JWT) + `lunar_refresh` (refresh token) จาก backend |
| **Refresh** | access หมดอายุ → `POST /api/auth/refresh` อัตโนมัติ (rotate refresh token) |
| **Protected routes** | `/space`, `/studio`, `/backoffice` — redirect ไป `/login?next=...` ถ้ายังไม่ login |

**Input:** email, password, display name (optional)  
**Output:** session cookies · redirect ไป `/space` (หรือ `?next=` path)

### Google Sign-In (GIS)

| รายการ | รายละเอียด |
|--------|------------|
| **One Tap** | แสดงอัตโนมัติบนหน้า guest (`/login`, `/register`) — optional |
| **Sign-in button** | ปุ่ม Google อย่างเป็นทางการ (`renderButton`) บน login/register |
| **Flow** | GIS คืน credential JWT → `POST /api/auth/google/onetap` → backend verify + upsert user |
| **Config** | `GOOGLE_CLIENT_ID` เดียวกันทั้ง frontend/backend และ OAuth client ใน Google Cloud (workspace `.env`) |

**Input:** การเลือกบัญชี Google  
**Output:** session cookies · redirect ไป `/space` (หรือ `?next=` path)

**หมายเหตุ:** GIS ทำงานใน browser; การสร้าง/ค้นหาผู้ใช้ใน PostgreSQL อยู่ที่ backend — ต้องมี DB รันอยู่ login จึงจะสำเร็จ

### Auth — Route guards & silent refresh

```
GuestRoute     → /login, /register  (redirect ถ้า login แล้ว)
ProtectedRoute → /space, /studio, /backoffice  (redirect /login?next= ถ้ายังไม่ login)

API 401 (access หมดอายุ)
  → tryRefreshSession() → POST /api/auth/refresh
  → retry request หรือ redirect login ถ้า refresh ล้มเหลว
```

## Implementation notes (สำหรับ dev)

| ส่วน | Frontend | Backend |
|------|----------|---------|
| 3D / Canvas | Three.js, R3F, `.glb` assets | — |
| Blockly | Blockly editor, block defs | validate / run mission script |
| Physics / orbit | แสดงผล 3D + charts | Poliastro, PyEphem, power calc |
| LAIKA | chat UI ใน Studio | FastAPI → RAG → Gemini |
| Auth (email) | LoginForm, Register, route guards, `tryRefreshSession` | `/auth/register`, `/auth/login`, `/auth/refresh`, JWT cookies |
| Auth (Google) | GIS One Tap + `renderButton` → `googleIdentity.ts` | `/auth/google/onetap`, token verify |
| Progress | UI state, lesson completion | PostgreSQL (users, progress) |

เมื่อ implement API ใหม่ บันทึก contract ใน `backend/docs/api.md`
