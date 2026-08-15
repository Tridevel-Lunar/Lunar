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
| **Space** | Learn Space Tech | สำรวจ catalog โดเมน · เส้นทางเรียน · เข้าคอร์ส (นำร่อง: CubeSat) — ดู [concept.md](concept.md) |
| **Arena** | Build & Mission Simulation | ด่านตามกิ่ง Space Technology — Blockly + ซิมเมื่อมี runner |
| **Studio** | Launch, Tech-Transfer & Venture | เก็บผลงาน · LAIKA ต่อยอดไอเดีย · (อนาคต) venture / tech transfer |
| **Account** | Identity & session | Auth · Settings · รูป local · (อนาคต) nametag / badges — [badges.md](badges.md) |

---

## ฟีเจอร์ที่ 1: Space (Learn Space Tech)

โมดูล Learn ของ Lunar = เรียนรู้ **เทคโนโลยีอวกาศทั้งโดเมน** ไม่ใช่คอร์ส CubeSat อย่างเดียว  
CubeSat = คอร์สนำร่องใต้กิ่ง FLIGHT — รายละเอียดโดเมน: [space_technology_hierarchy.md](../../docs/space_technology_hierarchy.md)

### โครงชั้นข้อมูล

| ชั้น | ความหมาย | ตัวอย่าง |
|------|----------|---------|
| **Space** | Product (Learn) | `/space` |
| **Catalog** | ต้นไม้โฟลเดอร์ → คอร์ส | AROUND US, ACCESS, FLIGHT, … |
| **Course** | ใบที่เข้าเรียนได้ | `cubesat-for-beginner` |
| **Module** | หน้าเรียนในคอร์ส | `physics`, `anatomy`, `programming` |
| **Path** | ลำดับคอร์สส่วนตัว | `GET`/`PUT /space/learning-path` |

### พื้นผิว UI วันนี้

| พื้นผิว | บทบาท |
|--------|--------|
| **Home** | สรุปเส้นทาง + เข้า Explore / Path |
| **Explore** | `CatalogBrowser` — เดินโฟลเดอร์ถึงคอร์ส |
| **Path** | คุย LAIKA + กราฟเส้นทางเรียน |
| **Course / Module** | เนื้อหา interactive ของคอร์สที่เปิดแล้ว |

### กิ่งโดเมน (สรุป)

AROUND US · ACCESS · FLIGHT · GROUND · FOR EARTH · MISSION — แต่ละกิ่งมีโฟลเดอร์ย่อยและคอร์ส (ส่วนใหญ่ `[next]`/`[later]`)

### คอร์สนำร่อง: `cubesat-for-beginner` (ใต้ FLIGHT)

เนื้อหา interactive ที่มีอยู่จริง — **ไม่แทนที่** นิยาม Space ทั้งก้อน

รายละเอียดสำหรับ contributor: [`src/components/space/courses/README.md`](../src/components/space/courses/README.md)

#### 1. โมเดล 3 มิติ · module `anatomy` / overview

| รายการ | รายละเอียด |
|--------|------------|
| **กิจกรรม** | หมุนดู CubeSat แบบ 360° (Three.js / R3F) |
| **Exploded View** | Slider แยกชิ้นส่วน |
| **Interactive detail** | คลิกชิ้นส่วนเพื่อดูหน้าที่ |

**Output:** ความเข้าใจโครงสร้าง · progress

#### 2. ระบบฝังตัว · (ในคอร์ส / planned)

| รายการ | รายละเอียด |
|--------|------------|
| **กิจกรรม** | จำลอง Data Bus / พลังงานระหว่าง OBC, EPS, Payload |

**Output:** แผนผังที่เชื่อมถูกต้อง / feedback

#### 3. ฟิสิกส์ · module `physics`

| รายการ | รายละเอียด |
|--------|------------|
| **เนื้อหา** | พลังงาน · LEO · Power Budget · Eclipse |

**Backend:** orbital / power — [backend/docs/development.md](../../backend/docs/development.md)

#### 4. การเขียนโปรแกรม · module `programming`

| รายการ | รายละเอียด |
|--------|------------|
| **กิจกรรม** | Blockly — ตรรกะควบคุมภายใต้ข้อจำกัดอวกาศ |

### Space — Progress model

```
สำรวจ catalog / วาง path → เข้าคอร์ส → จบโมดูล → บันทึก progress → เปิด Arena ที่เกี่ยวข้องเมื่อพร้อม
```

Progress บันทึกผ่าน Space progress API (PostgreSQL)

---

## ฟีเจอร์ที่ 2: Arena (Build & Mission Simulation)

ห้องแล็บของเนื้อหา **Space** — ไม่จำกัดแค่ดาวเทียม Hub (`/arena`) จัดด่านตามกิ่ง Space Technology (AROUND US → ACCESS → FLIGHT → GROUND → FOR EARTH → MISSION) ด่านที่เปิดเล่นได้วันนี้คือ **ONE LAP AROUND EARTH** (CubeSat / orbit-bus) ที่เหลือเป็นภาพรวม coming soon จนกว่าจะมี runner

ผู้เรียนด่าน FLIGHT สร้างตรรกะ OBC ด้วย Blockly แล้วนำเข้าสภาพแวดล้อมจำลองฝั่ง backend เพื่อให้ภารกิจสำเร็จ

### Blockly Code Editor

| บล็อก / ความสามารถ | รายละเอียด |
|---------------------|------------|
| **Stable Orbit Loop** | ลูปตรวจเช็คความเสถียรวงโคจร |
| **Fault Tolerance** | ควบคุมอุปกรณ์ยามฉุกเฉิน |
| **Payload control** | สั่งเปิด/ปิด Payload ตามปริมาณพลังงานที่มี |
| **Editor UX** | ลากวางบล็อกซ้อนกัน — สไตล์ Google Blockly |

**Input:** การจัดเรียง/แก้ไขบล็อก  
**Output:** program **AST** (รัน/ให้คะแนน) + Blockly **workspace** JSON (ตำแหน่งบล็อก/เลย์เอาต์) — บันทึก draft แยก field; จำลองใช้ AST เท่านั้น

### Mission Feedback Window (Physics Reality Check)

| รายการ | รายละเอียด |
|--------|------------|
| **3D preview** | R3F Earth + craft ในกล่องผลภารกิจ — ขับด้วย `trace[].phase` / `isSunlit` (`frameloop="demand"`) ไม่ใช้ Space `RealisticEarth` และไม่คำนวณ physics ฝั่ง UI |
| **Simulation Engine** | Backend deterministic tick sim — sync กับ AST จากบล็อก |
| **สำเร็จ** | grade `perfect` / `risky` + battery/temp / comms จาก `POST .../runs` — ตาราง 2×2 ใน MISSION OUTCOME |
| **ไม่สำเร็จ** | grade `fail` หรือ modal แสดง validation error (AST โครงสร้างผิด) |

```
Blockly → Backend Simulation Engine → 3D + metrics / errors
```

---

## ฟีเจอร์ที่ 3: Studio (Launch, Tech-Transfer & Venture)

พื้นที่ต่อยอดหลังเรียน Space และ/หรือลอง Arena — **Launch** เก็บผลงานและไอเดียในบริบท Space Tech (ไม่บังคับว่าต้องเป็นดาวเทียม)

### พอร์ตโฟลิโอ & ประวัติภารกิจ

- เก็บผลงาน / mission log / โน้ตไอเดีย
- แสดงความก้าวหน้าและผลจำลองย้อนหลังเมื่อมี

### LAIKA (AI Mentor)

| รายการ | รายละเอียด |
|--------|------------|
| **บทบาท** | Mentor ภาษาไทยสุภาพ เป็นกลาง — ช่วยสรุป/อธิบาย/ต่อยอดโน้ตและไอเดีย (ไม่ใช้คำลงท้ายเจาะจงเพศ) |
| **โทนการสนทนา** | รู้ชื่อผู้เรียน (จากบัญชี) · รู้เวลาและช่วงห่างจากข้อความก่อนหน้า · ไม่ทักทายซ้ำทุกตอบ · ต้อนรับกลับเมื่อหายไปหลายวัน |
| **LLM** | Gemini / DeepSeek / Ollama (backend config) |
| **RAG** | อ้างอิงเอกสาร Space Technology / วิศวกรรมอวกาศ ฯลฯ — ลด hallucination |

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
| LEARN | **Space** | § Catalog + Path + Courses (นำร่อง CubeSat) |
| BUILD | **Arena** | § Blockly + Simulation |
| LAUNCH | **Studio** | § Portfolio + LAIKA |

---

## ฟีเจอร์ที่ 4: Authentication & Settings

ระบบเข้าสู่ระบบ สมัครสมาชิก และจัดการบัญชี — รองรับ email/password และ Google Sign-In  
Contract เต็ม: [backend/docs/api.md](../../backend/docs/api.md#auth) · ร่าง badge/nametag: [badges.md](badges.md)

### Email / Password

| รายการ | รายละเอียด |
|--------|------------|
| **Register** | สร้างบัญชีด้วย email + password (≥ 8 ตัวอักษร) · `display_name` optional |
| **Login** | เข้าสู่ระบบด้วย email + password |
| **Session** | httpOnly cookies `lunar_token` (access JWT) + `lunar_refresh` (refresh token) จาก backend |
| **Refresh** | access หมดอายุ → `POST /api/auth/refresh` อัตโนมัติ (rotate refresh token) |
| **Protected routes** | `/space`, `/arena`, `/studio`, `/settings`, `/backoffice` — redirect ไป `/login?next=...` ถ้ายังไม่ login |

**Input:** email, password, display name (optional)  
**Output:** session cookies · redirect ไป `/space` (หรือ `?next=` path)

### Google Sign-In (GIS)

| รายการ | รายละเอียด |
|--------|------------|
| **One Tap** | แสดงอัตโนมัติบนหน้า guest (`/login`, `/register`) — optional |
| **Sign-in button** | ปุ่ม Google อย่างเป็นทางการ (`renderButton`) บน login/register |
| **Flow** | GIS คืน credential JWT → `POST /api/auth/google/onetap` → backend verify + upsert user |
| **ชื่อ** | **ไม่**คัดลอก/อัปเดต `display_name` จาก Google ตอนสมัคร ลิงก์ หรือล็อกอินซ้ำ |
| **รูป** | ดาวน์โหลดจาก URL Google แล้วเก็บ local → `users.picture` = `/api/avatars/{user_id}` (ไม่เก็บ hotlink CDN) |
| **Config** | `GOOGLE_CLIENT_ID` เดียวกันทั้ง frontend/backend และ OAuth client ใน Google Cloud (workspace `.env`) |

**Input:** การเลือกบัญชี Google  
**Output:** session cookies · redirect ไป `/space` (หรือ `?next=` path)

**หมายเหตุ:** GIS ทำงานใน browser; การสร้าง/ค้นหาผู้ใช้ใน PostgreSQL อยู่ที่ backend — ต้องมี DB รันอยู่ login จึงจะสำเร็จ

### Settings (`/settings`)

หน้าจัดการบัญชีภายใต้ `ModuleSidebar` — อัปเดตชื่อ/รูปใน sidebar ผ่าน `AuthUserProvider` + `refreshUser()`

| ส่วน | พฤติกรรม | API |
|------|----------|-----|
| **โปรไฟล์** | แก้ `display_name`, อัปโหลด/ลบรูป | `PATCH /auth/me` · `POST`/`DELETE /auth/me/picture` |
| **รหัสผ่าน** | เปลี่ยนรหัส (ต้องใส่รหัสเดิม) หรือตั้งรหัสครั้งแรกถ้ายังไม่มี | `POST /auth/me/password` |
| **เชื่อมกับระบบอื่น** | ลิงก์ / ยกเลิกลิงก์ Google — ยกเลิกได้เมื่อมีรหัสผ่านแล้ว | `POST /auth/google/link` · `POST /auth/google/unlink` |

รูป serve ที่ `GET /avatars/{user_id}` (FE เรียกผ่าน `/api/avatars/...` + Vite proxy)

### Nametag & Badges (ออกแบบ — ยังไม่ implement)

| แนวคิด | บทบาท |
|--------|--------|
| **Nametag** | ชิปเดียวข้างชื่อ (เช่น Adventurer) — เลือกสวมจากชุดที่ปลดแล้ว |
| **Badge** | ของสะสมหลายอันในคลัง — ปลดจาก event การเรียน/ภารกิจ |

รายละเอียดชื่อ + เงื่อนไขปลดล็อก: [badges.md](badges.md)

### Auth — Route guards & silent refresh

```
GuestRoute     → /login, /register  (redirect ถ้า login แล้ว)
ProtectedRoute → /space, /arena, /studio, /settings, /backoffice
                 (redirect /login?next= ถ้ายังไม่ login; wrap AuthUserProvider)

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
| Auth (Google) | GIS One Tap + `renderButton` → `googleIdentity.ts` | `/auth/google/onetap`, token verify; picture localize |
| Settings | `SettingsView`, `AuthUserContext` | `/auth/me*`, `/auth/google/link\|unlink`, `/avatars/{id}` |
| Progress | Space progress UI + API | PostgreSQL (users, progress) |
| Badges / nametag | *(planned)* | *(planned)* — ดู [badges.md](badges.md) |

เมื่อ implement API ใหม่ บันทึก contract ใน `backend/docs/api.md`
