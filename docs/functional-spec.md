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
| **Space** | Learn | เรียนรู้ทฤษฎีพื้นฐานวิศวกรรมอวกาศแบบ Interactive · เรียน 4 ด้าน |
| **Arena** | Build & Mission Simulation | สร้างตรรกะ Blockly + จำลองภารกิจในสภาพแวดล้อมอวกาศ |
| **Studio** | Launch, Tech-Transfer & Venture | เก็บผลงาน · LAIKA ช่วยต่อยอดไอเดีย · (อนาคต) แผนธุรกิจ / tech transfer |

---

## ฟีเจอร์ที่ 1: Space (Learn)

ระบบเรียนรู้ทฤษฎีพื้นฐานวิศวกรรมอวกาศแบบ **Interactive Learning** — เรียนองค์ความรู้ **4 ด้าน**

### 1. โมเดล 3 มิติ (3D Model — Spatial Learning)

| รายการ | รายละเอียด |
|--------|------------|
| **กิจกรรม** | หมุนดู CubeSat 101 แบบ 360° (Three.js / R3F) |
| **Exploded View** | ปรับ Slider แยกชิ้นส่วนแบบระเบิดวงแหวน — เรียนรู้โครงสร้างภายนอก |
| **Interactive detail** | คลิกชิ้นส่วน (เช่น Camera Payload) เพื่อเรียนรู้หน้าที่และการเชื่อมต่อ |

**Output:** ความเข้าใจโครงสร้างกายภาพ · progress ตามกิจกรรมที่ทำครบ

### 2. ระบบฝังตัว (Embedded System — Schematic Architecture)

| รายการ | รายละเอียด |
|--------|------------|
| **กิจกรรม** | ลากเส้นจำลองสัญญาณ Data Bus และพลังงาน |
| **องค์ประกอบ** | เชื่อม OBC (On-Board Computer), EPS (Electrical Power System), กล้องถ่ายภาพ (Payload) เข้าล็อกที่ถูกต้อง |
| **เป้าหมาย** | จำลองการไหลของข้อมูล — ผู้เรียนเข้าใจในระดับพื้นฐานว่าระบบทำงานอย่างไร |

**Output:** แผนผังที่เชื่อมถูกต้อง / feedback เมื่อผิด

### 3. ฟิสิกส์ (Physics — Simulation-Based Trial)

| รายการ | รายละเอียด |
|--------|------------|
| **กิจกรรม** | แผงควบคุมปรับตัวแปรแบบ real-time |
| **เนื้อหา** | กฎพลังงาน · วงโคจรระดับต่ำ (LEO) · จัดสรร Power Budget · สถานการณ์เข้าเงามืดของโลก (Eclipse) |

**Output:** กราฟ/ตัวเลข power · สถานะวงโคจร · checkpoint

**Backend:** คำนวณ orbital / power budget (Poliastro, PyEphem) — ดู [Backend/docs/development.md](../../Backend/docs/development.md)

### 4. การเขียนโปรแกรม (Programming — Algorithmic Thinking)

| รายการ | รายละเอียด |
|--------|------------|
| **กิจกรรม** | กระดานเขียนคำสั่งควบคุมแบบภาพ (Google Blockly) |
| **เป้าหมาย** | ต่อบล็อก Logic ชุดแรกให้ดาวเทียม (Autopilot) ทำงานได้ในขอบเขตที่กำหนด |

**Output:** บล็อกที่ compile/validate ผ่าน · preview พฤติกรรม

### Space — Progress model

```
เรียนครบกิจกรรมใน 4 ด้าน → บันทึก progress → เปิด Arena เมื่อพร้อม
```

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
| **บทบาท** | ช่วยแนะนำ · ประเมินไอเดียต่อยอด · shape ปัญหาให้สอดคล้องฟิสิกส์ |
| **LLM** | Gemini API (backend) |
| **RAG** | อ้างอิงเอกสารวิศวกรรม / NASA CubeSat 101 ฯลฯ — ลด hallucination |

**Input:** คำถาม / ไอเดีย / ผลงานจากผู้เรียน  
**Output:** คำแนะนำ · คำถามชวนคิด · แนวทางพัฒนาต่อ

### Roadmap (อนาคต)

- ฟอร์ม **แผนพัฒนาต่อยอดไอเดีย** (venture / tech transfer)
- ช่องทาง **จับคู่ผู้เชี่ยวชาญ** สำหรับคำปรึกษาด้าน IP / เทคโนโลยีอวกาศ

---

## การแมป Landing ↔ Product

| Landing (`PlatformSection`) | Module | Spec section |
|-----------------------------|--------|--------------|
| LEARN | **Space** | § Space — 4 domains |
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
| **Session** | httpOnly cookie `lunar_token` จาก backend |
| **Protected routes** | `/space`, `/studio` — redirect ไป `/login?next=...` ถ้ายังไม่ login |

**Input:** email, password, display name (optional)  
**Output:** session cookie · redirect ไป `/space` (หรือ `?next=` path)

### Google Sign-In (GIS)

| รายการ | รายละเอียด |
|--------|------------|
| **One Tap** | แสดงอัตโนมัติบนหน้า guest (`/login`, `/register`) — optional |
| **Sign-in button** | ปุ่ม Google อย่างเป็นทางการ (`renderButton`) บน login/register |
| **Flow** | GIS คืน credential JWT → `POST /api/auth/google/onetap` → backend verify + upsert user |
| **Config** | `VITE_GOOGLE_CLIENT_ID` ต้องตรงกับ `GOOGLE_CLIENT_ID` บน backend และ OAuth client ใน Google Cloud |

**Input:** การเลือกบัญชี Google  
**Output:** session cookie · redirect ไป `/space` (หรือ `?next=` path)

**หมายเหตุ:** GIS ทำงานใน browser; การสร้าง/ค้นหาผู้ใช้ใน PostgreSQL อยู่ที่ backend — ต้องมี DB รันอยู่ login จึงจะสำเร็จ

### Auth — Route guards

```
GuestRoute     → /login, /register  (redirect ถ้า login แล้ว)
ProtectedRoute → /space, /studio     (redirect /login?next= ถ้ายังไม่ login)
```

## Implementation notes (สำหรับ dev)

| ส่วน | Frontend | Backend |
|------|----------|---------|
| 3D / Canvas | Three.js, R3F, `.glb` assets | — |
| Blockly | Blockly editor, block defs | validate / run mission script |
| Physics / orbit | แสดงผล 3D + charts | Poliastro, PyEphem, power calc |
| LAIKA | chat UI ใน Studio | FastAPI → RAG → Gemini |
| Auth (email) | LoginForm, Register, route guards | `/auth/register`, `/auth/login`, JWT cookie |
| Auth (Google) | GIS One Tap + `renderButton` → `googleIdentity.ts` | `/auth/google/onetap`, token verify |
| Progress | UI state, lesson completion | PostgreSQL (users, progress) |

เมื่อ implement API ใหม่ บันทึก contract ใน `Backend/docs/api.md`
