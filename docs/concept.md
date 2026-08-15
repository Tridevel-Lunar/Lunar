# LUNAR — สาระสำคัญของโครงการ

## วิสัยทัศน์

**Lunar** คือแพลตฟอร์มการเรียนรู้ **เทคโนโลยีอวกาศ (Space Technology)** — ทำให้เรื่องที่ดูไกลตัวจับต้องได้ สร้างแรงบันดาลใจ และเห็นภาพการนำไปใช้จริงในไทย

อวกาศไม่ใช่จินตนาการอย่างเดียวอีกต่อไป — สิ่งที่กำลังเกิดขึ้นคือ **เศรษฐกิจอวกาศ**: โครงสร้างพื้นฐานจากวงโคจร การสื่อสาร การนำทาง การสังเกตโลก ไปจนถึงการออกแบบภารกิจและยานที่บินได้

ตัวอย่างในไทย เช่น ใช้ข้อมูลจากอวกาศช่วยเกษตร ประเมินน้ำท่วม ป่า ฝุ่น หรือทะเล — เทคโนโลยีอวกาศสร้างคุณค่าได้เมื่อประกอบองค์ความรู้เล็ก ๆ เป็น “จิ๊กซอว์” จนเกิดนวัตกรรม

Lunar จึงมีไว้เพื่อ **เปิดทางเข้าสู่ Space Tech** ให้กับนักเรียน นักศึกษา บุคคลทั่วไป และสถาบันการศึกษา — ไม่จำกัดว่าทุกคนต้องสร้างดาวเทียม

## คำสำคัญ (Keywords)

| คำ | ความหมายในโครงการ |
|----|------------------|
| Lunar | แพลตฟอร์มเรียนรู้ **Space Technology** |
| Space Technology | โดเมนทั้งหมดของ Lunar — ไม่ใช่แค่ดาวเทียม |
| Space | โมดูล Learn — สำรวจคลังหัวข้อ / เส้นทางเรียน / เข้าคอร์ส |
| Arena | สนามลงมือปฏิบัติ — ภารกิจจำลองตามกิ่งโดเมน |
| Studio | พื้นที่สร้างสรรค์ต่อ — ผลงาน, ไอเดีย, LAIKA |
| LAIKA | AI mentor — ช่วยวางแผนเรียนและต่อยอดไอเดีย |
| Catalog | ต้นไม้หัวข้อ Space Technology (โฟลเดอร์ → คอร์ส) |
| Path | เส้นทางเรียนส่วนตัวที่ LAIKA / ผู้เรียนจัดเรียงจาก catalog |
| CubeSat | **หนึ่งคอร์สนำร่อง** ภายใต้กิ่ง FLIGHT — ไม่ใช่คำจำกัดความของ Lunar |
| RAG | ดึงความรู้จากเอกสารภายนอก ลด hallucination |
| Settings | จัดการบัญชี (`/settings`) |
| `display_name` | ชื่อแสดงใน Lunar — **ไม่ sync จาก Google** |
| Nametag / Badge | ตัวตนข้างชื่อ vs คลังความสำเร็จ — ดู [badges.md](badges.md) |
| เศรษฐกิจอวกาศ | บริบทไทย — นำ Space Tech ไปใช้ประโยชน์จริง |

ต้นไม้โดเมน (ละเอียด): [space_technology_hierarchy.md](../../docs/space_technology_hierarchy.md)

## ฟีเจอร์หลัก

> ฟังก์ชันระดับโปรแกรม: **[functional-spec.md](functional-spec.md)** · Auth API: [backend/docs/api.md](../../backend/docs/api.md#auth) · Badge draft: **[badges.md](badges.md)**

### 1. Space — เรียนรู้ Space Tech (Learn)

พื้นที่แรกของผู้เรียน: **สำรวจโดเมนเทคโนโลยีอวกาศ** แล้วเข้าเรียนคอร์สทีละใบ — ไม่ได้หมายความว่าทุกเส้นทางต้องเป็น CubeSat

#### โดเมนกว้าง (catalog)

ต้นไม้ Space Technology จัดเป็นกิ่งหลัก เช่น:

| กิ่ง | ความหมายโดยย่อ |
|-----|----------------|
| **AROUND US** | อวกาศรอบตัว · วงโคจร · สภาพแวดล้อม |
| **ACCESS** | ทางขึ้นสู่อวกาศ · จรวด · ชั่วโมงแรกบนฟ้า |
| **FLIGHT** | ของที่บิน — CubeSat / ยานอื่น · บัส · ซอฟต์แวร์บนยาน |
| **GROUND** | สถานีภาคพื้น · ปฏิบัติการ · กลุ่มดาว |
| **FOR EARTH** | ใช้บนโลก — มองโลก, ไทย, นำทาง, สื่อสาร, วิทยาศาสตร์ |
| **MISSION** | ออกแบบภารกิจ · ข้อจำกัด · คนและทีม |

- **โฟลเดอร์** = สำรวจได้ เข้าเรียนไม่ได้  
- **คอร์ส (leaf)** = เข้าเรียนได้  
- UI วันนี้: Home / Path / Explore (`CatalogBrowser`) · LAIKA ช่วยวาง **learning path**

#### คอร์สนำร่องที่มีเนื้อหาจริงวันนี้

**`CUBESAT FOR BEGINNER`** อยู่ภายใต้ FLIGHT → Platforms → CubeSat — ใช้โชว์รูปแบบเรียน interactive (3D, ระบบฝังตัว, ฟิสิกส์, โปรแกรม) ไม่ใช่ขอบเขตทั้งหมดของ Space

| โมดูลในคอร์สนำร่อง | บทบาทในคอร์สนี้ |
|--------------------|----------------|
| Overview / Anatomy | โครงสร้างและชิ้นส่วน CubeSat |
| Physics | พลังงาน · LEO · eclipse |
| Programming | ตรรกะควบคุมแบบบล็อก |

คอร์สอื่นในต้นไม้ส่วนใหญ่ยังเป็นที่จอง (`[next]` / `[later]`) — ดู hierarchy

### 2. Arena — ลงมือปฏิบัติ

สนามภารกิจที่ **ผูกกับกิ่ง Space Technology** (ไม่บังคับว่าต้องเป็น CubeSat):

| หัวข้อ | รายละเอียด |
|--------|------------|
| **Hub** | Recommended / Explore ตามกิ่งโดเมน — เปิดเล่นได้เฉพาะด่านที่มี runner |
| **Visual Coding** | Blockly (เช่น ด่าน FLIGHT / orbit-bus) |
| **Simulation** | Backend จำลอง + เกรด · frontend แสดง trace / 3D |

### 3. Studio — สร้างสรรค์ต่อ

หลังเรียนและ/หรือลองภารกิจ — เก็บผลงาน วางแผน และคุยกับ LAIKA:

- พอร์ตโฟลิโอ / ไอเดียต่อยอด (ไม่จำกัดว่าต้องเป็นดาวเทียม)
- **LAIKA** — shape ปัญหาให้สอดคล้องฟิสิกส์และบริบท Space Tech · ชี้ทางอาชีพหรือนวัตกรรม

| ส่วน | บทบาท |
|------|--------|
| **LAIKA** | Mentor |
| **LLM** | ภาษาธรรมชาติ |
| **RAG** | อ้างอิงเอกสาร Space Tech |

### 4. Account — บัญชีและตัวตน

| ส่วน | รายละเอียด |
|------|------------|
| **เข้าสู่ระบบ** | อีเมล/รหัสผ่าน หรือ Google — httpOnly cookies |
| **Settings** | ชื่อ, รูป, รหัสผ่าน, เชื่อม Google |
| **รูป** | local `/api/avatars/{user_id}` |
| **`display_name`** | ของ Lunar เท่านั้น — ไม่ดึงจาก Google |
| **Nametag / Badge** | *(ร่าง)* — [badges.md](badges.md) |

## การแมปกับ Landing Page

Landing ใช้ **LEARN / BUILD / LAUNCH**:

| Landing | Product | บทบาท |
|---------|---------|--------|
| LEARN | **Space** | สำรวจ Space Tech + เรียนคอร์ส |
| BUILD | **Arena** | ภารกิจ / จำลอง |
| LAUNCH | **Studio** | ผลงาน + LAIKA |

ใช้ชื่อ **Space / Arena / Studio** เป็น canonical — Settings เป็น shell ร่วม

## กลุ่มเป้าหมาย

- นักเรียน / นักศึกษา
- บุคคลทั่วไปที่สนใจอวกาศหรือเศรษฐกิจอวกาศ
- สถาบันการศึกษา

## Tech Stack (สรุป)

| ฝั่ง | หลัก |
|------|------|
| **Frontend** | Vite, React Router, TypeScript, Tailwind v4, Three.js/R3F, Blockly, Framer Motion |
| **Backend** | Python, FastAPI, PostgreSQL + pgvector, LangChain RAG, LAIKA |
| **3D** | Blender → `.gltf` / `.glb` |

รายละเอียด: [stack.md](stack.md) · [development.md](development.md) · [backend/docs/development.md](../../backend/docs/development.md)
