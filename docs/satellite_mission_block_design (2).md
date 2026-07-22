# ออกแบบภารกิจและชุดบล็อก: เกมเขียนโปรแกรมดาวเทียมแบบ Visual Block Coding

โครงสร้างเกม: **Setup (ตั้งค่าก่อนเริ่ม)** → **Main Loop (เขียนโค้ดควบคุมช่วง tick ที่กำหนด)** → **Check (ตรวจผลลัพธ์เทียบเกณฑ์)**

แนวคิดหลัก: ผู้เล่นควบคุม **EPS (พลังงาน) + Thermal (ความร้อน) + OBC (การตัดสินใจ)** เป็นแกนหลัก ส่วน **Comms (ส่งข้อมูล)** และ **Orbital Longevity (อายุวงโคจร)** เป็น "ผลลัพธ์ที่รอ" จากแกนหลัก และมี **Payload** เป็น action เสริมที่มี trade-off เล็กๆ

---

## 1. โครงสร้างภารกิจ (Mission Structure)

ทุกภารกิจมี 3 ส่วนเสมอ:

```
[SETUP]  — ตั้งค่าตัวแปร/threshold ก่อนเริ่ม (คล้าย void setup() ของ Arduino)
   ↓
[MAIN LOOP] — โค้ดบล็อกที่รันซ้ำทุก tick จนครบจำนวน tick ที่กำหนด
   ↓
[CHECK]  — ระบบเทียบค่าตอนจบกับเกณฑ์ ให้ผลเป็น "สมบูรณ์ / เสี่ยง / ไม่ผ่าน"
```

- แต่ละภารกิจทดสอบด้วย **starting condition 2-3 แบบ** (สุ่มหรือเลือกทดสอบทีละแบบ) เพื่อบังคับให้ผู้เล่นใช้ if/else จริง ไม่ hard-code ตัวเลข
- ความยากคุมด้วย **จำนวน tick** ไม่ใช่เวลา (เช่น ด่านง่าย 3 tick, ด่านยาก 8 tick)
- ช่วงที่ไม่ได้ทดสอบ (นอก window) ระบบสมมติว่า "สถานการณ์เป็นใจ" ทั้งหมด

---

## 2. ชุดบล็อกทั้งหมด (Block Library)

### 🔧 กลุ่ม Setup (ใช้ได้เฉพาะส่วน Setup เท่านั้น)
| บล็อก | คำอธิบาย |
|---|---|
| `set battery threshold low = [__]%` | กำหนดค่าที่ถือว่า "แบตต่ำ" |
| `set battery threshold high = [__]%` | กำหนดค่าที่ถือว่า "แบตเต็ม/ปลอดภัย" |
| `set temp threshold min/max = [__]°C` | กำหนดช่วงอุณหภูมิที่ยอมรับได้ |
| `set heater power = [__]%` | กำหนดกำลังไฟที่ฮีตเตอร์ใช้ต่อ tick |
| `enable payload: [กล้อง / เซนเซอร์วิทย์ / ไม่เปิด]` | เลือกเปิด payload หรือไม่ (side-action) |

### 📡 กลุ่ม Sensor (บล็อกอ่านค่า — ใช้ใน Main Loop)
| บล็อก | คำอธิบาย |
|---|---|
| `battery level` | อ่านค่าแบตเตอรี่ปัจจุบัน (%) |
| `temperature` | อ่านค่าอุณหภูมิปัจจุบัน (°C) |
| `is daylight?` | true/false บอกว่าตอนนี้รับแสงอาทิตย์อยู่หรือไม่ |
| `tick number` | รอบปัจจุบันใน window นี้ (1, 2, 3, ...) |

### ⚙️ กลุ่ม Actuator (บล็อกสั่งงาน — ใช้ใน Main Loop)
| บล็อก | คำอธิบาย |
|---|---|
| `turn heater [ON/OFF]` | เปิด/ปิดฮีตเตอร์ (กินพลังงานตอนเปิด) |
| `turn payload [ON/OFF]` | เปิด/ปิด payload ชั่วคราว (กินพลังงานเล็กน้อย) |
| `enter safe mode` | ปิดระบบทั้งหมดยกเว้นที่จำเป็น (ประหยัดพลังงานสุด แต่ payload/comms ใช้ไม่ได้) |
| `exit safe mode` | กลับสู่โหมดปกติ |

### 🧠 กลุ่ม Control (ตรรกะ — ใช้ใน Main Loop)
| บล็อก | คำอธิบาย |
|---|---|
| `if [เงื่อนไข] then ... else ...` | เงื่อนไขมาตรฐาน |
| `when [event] do ...` | บล็อกแบบ event-driven เช่น `when battery < 20% do ...` |
| `wait 1 tick` | ข้ามไป tick ถัดไปโดยไม่ทำอะไร |
| `repeat until end of window` | ให้โค้ดวนจนกว่า window จะจบ (ใช้แทน hardcode จำนวนรอบ) |

> หมายเหตุ: ตัด block เกี่ยวกับ ADCS (การหมุน/ทิศทาง) และ Propulsion ออกทั้งหมดตามที่ตกลงไว้ — พลังงานจากแสงอาทิตย์ผูกกับ `is daylight?` แบบ cycle คงที่ ไม่ต้องคำนวณมุม

---

## 3. ระบบให้คะแนนผลลัพธ์ (Grading)

เพื่อให้ผลลัพธ์ deterministic และเขียน test อัตโนมัติได้ ต้องล็อก threshold เป็นตัวเลขตายตัวดังนี้:

- **Perfect**
  - `battery_end` อยู่ในช่วง `40 <= battery_end <= 100`
  - `temperature_end` อยู่ในช่วงกลางของ threshold ที่ผู้เล่นตั้งไว้:
    - กำหนด `mid_low = temp_min + 5`
    - กำหนด `mid_high = temp_max - 5`
    - ผ่านเมื่อ `mid_low <= temperature_end <= mid_high`
- **Risky**
  - ไม่เข้าเงื่อนไข Perfect และยังไม่ Fail
  - โดยต้องเป็นไปตามนี้พร้อมกัน:
    - `15 <= battery_end < 40`
    - `temp_min <= temperature_end <= temp_max`
- **Fail**
  - `battery_end < 15` หรือ
  - `temperature_end < temp_min` หรือ `temperature_end > temp_max`

> Boundary rule: ใช้ inclusive (`<=`, `>=`) ทุกช่วงที่ระบุ ยกเว้นช่วงที่เขียน `<` หรือ `>` ตามนิยามด้านบน

เมื่อจบ window ระบบเช็ค **battery level** และ **temperature** พร้อมกัน แล้วจัดระดับ:

| ผลลัพธ์ | เงื่อนไข |
|---|---|
| ✅ **สมบูรณ์ (Perfect)** | แบตอยู่ใน "โซนปลอดภัยสบาย" (เช่น 40-100%) และอุณหภูมิอยู่กลางช่วงที่กำหนด |
| ⚠️ **เสี่ยง (Risky)** | อยู่ในเกณฑ์ผ่านขั้นต่ำ แต่ใกล้ขอบเขต (เช่น แบต 15-40% หรือ อุณหภูมิใกล้ขอบบน/ล่าง) |
| ❌ **ไม่ผ่าน (Fail)** | แบตต่ำกว่าเกณฑ์ขั้นต่ำ หรือ อุณหภูมิหลุดช่วงที่กำหนด |

ผลลัพธ์นี้จะไปกำหนดผลของ Comms และ Longevity โดยอัตโนมัติ (ผู้เล่นไม่ต้องเขียนโค้ดคุมสองระบบนี้เอง):

- **Comms:** Perfect = ส่งข้อมูลสำเร็จครบ + โบนัสถ้าเปิด payload ไว้ / Risky = ส่งได้บางส่วน / Fail = พลาด pass รอบนี้
- **Longevity:** Perfect = ไม่เสีย health / Risky = เสีย health เล็กน้อย / Fail = เสีย health มาก (สะสมมากพอจะจบเกมก่อนกำหนด — เก็บระบบสะสมนี้ไว้เป็น coming soon ตามที่ตกลง)

---

## 4. ภารกิจที่ออกแบบ (Mission — รวบเป็นภารกิจเดียว)

> รวบจาก 4 ภารกิจเดิมให้เหลือ **1 ภารกิจต่อเนื่อง 10 tick** เพื่อลดความล่าช้าตอนสาธิต (ไม่มีการโหลดฉากใหม่ระหว่างทาง) โดยยังคงลำดับการเรียนรู้แบบไล่ระดับไว้ในรูปแบบ **"เฟสภายใน window เดียว"** แทนการแยกด่าน

### 🛰️ Mission — "ภารกิจแรกในวงโคจร"

**เป้าหมายการเรียนรู้ (ครบทั้ง 4 เดิม เรียงลำดับในภารกิจเดียว):** if/else พื้นฐาน → จัดการ 2 ทรัพยากรพร้อมกัน → event-driven programming → วางแผนล่วงหน้าให้ผลลัพธ์ตรงเป้า

**Setup ที่ผู้เล่นทำได้ (ทำครั้งเดียวก่อนเริ่ม):**
- `set battery threshold low = [__]%`
- `set temp threshold min/max = [__]°C`
- `set heater power = [__]%`
- `enable payload: [กล้อง / เซนเซอร์วิทย์ / ไม่เปิด]`

**Main Loop:** รันต่อเนื่อง 10 tick แบ่งเป็น 3 เฟสภายใน (ใช้ **banner คั่นเฟส** บน timeline แทนการโหลดฉากใหม่ — ดูข้อ 7):

| เฟส | Tick | สิ่งที่เกิดขึ้น | บล็อกใหม่ที่ปลดล็อก |
|---|---|---|---|
| 🔋 Power Phase | 1-3 | `is daylight?` สลับ true/false, ยังไม่มีอุณหภูมิเข้ามา | `battery level`, `is daylight?`, `turn payload [ON/OFF]` |
| 🌡️ Thermal Phase | 4-6 | เริ่มมีค่า `temperature` เข้ามาและลดลงเรื่อยๆ ฝั่ง night | + `temperature`, `turn heater [ON/OFF]` |
| ⚡ OBC Phase | 7-9 | `radiation glitch` เกิดขึ้น **ตายตัวที่ tick 8** (ไม่สุ่ม เพื่อกันเดโมพัง) ลดแบต 25% ทันที | + `when [event] do`, `enter safe mode`, `exit safe mode`, `tick number` |
| 📡 Comms Check | 10 | ground station pass เกิดขึ้นพอดี — เช็คผลรวมทั้งหมด | (ไม่มีบล็อกใหม่ — ใช้ทักษะที่มีทั้งหมด) |

**Starting condition สำหรับสาธิต:** ใช้ **1 ชุดค่าเดียว** ที่กำหนดตายตัว (เช่น เริ่มแบต 70%, เริ่มอุณหภูมิ +50°C) เพื่อควบคุมผลลัพธ์ให้คาดเดาได้ระหว่างสาธิตสด — ส่วนโหมดฝึกฝนหลังเดโม (ไม่เร่งเวลา) ค่อยเปิดหลาย starting condition ตามดีไซน์เดิม

**โจทย์รวม:** เขียนโค้ดเดียวที่คุมพลังงาน+ความร้อนตลอด 9 tick แรก และตอบสนอง glitch ที่ tick 8 ได้ทัน เพื่อให้ ณ tick ที่ 10 แบตเตอรี่และอุณหภูมิอยู่ในเกณฑ์ **สมบูรณ์** — Comms จะส่งข้อมูลสำเร็จเต็มรูปแบบ พร้อมโบนัสถ้า payload เปิดไว้สำเร็จด้วย

---

## 4.1 กติกา Simulation แบบ Deterministic (ต้องล็อกก่อน implement)

> ค่าเหล่านี้เป็น baseline สำหรับเดโมและเทสต์ regression เพื่อให้ frontend/backend ได้ผลตรงกัน

### State ต่อ 1 tick

- `battery` (%), clamp อยู่ในช่วง `0..100`
- `temperature` (°C)
- `safe_mode` (boolean)
- `heater_on` (boolean, effective เฉพาะเมื่อ `safe_mode = false`)
- `payload_on` (boolean, effective เฉพาะเมื่อ `safe_mode = false`)
- `is_daylight` (boolean, จาก schedule ตายตัวของ mission)

### Daylight schedule (Mission 10 tick)

- Tick 1: day
- Tick 2: day
- Tick 3: night
- Tick 4: day
- Tick 5: night
- Tick 6: night
- Tick 7: day
- Tick 8: night + glitch
- Tick 9: day
- Tick 10: pass/check tick (ไม่รับคำสั่งใหม่)

### การเปลี่ยนค่า battery ต่อ tick

- ฐานจากแสง:
  - day: `+12`
  - night: `-8`
- ถ้า `heater_on = true`: เพิ่มโหลด `-heater_drain`, โดย
  - `heater_drain = round(heater_power / 10)` (เช่น 30% => 3)
- ถ้า `payload_on = true`: เพิ่มโหลด `-4`
- ถ้า `safe_mode = true`: บังคับปิด payload/heater และได้โบนัสประหยัดพลังงาน `+2`
- เหตุการณ์ `radiation glitch` (tick 8 เท่านั้น): หลังคำนวณโหลดปกติแล้วให้ `battery -= 25`
- ปิดท้ายด้วย clamp: `battery = min(100, max(0, battery))`

### การเปลี่ยนค่า temperature ต่อ tick

- ฐานอุณหภูมิ:
  - day: `+3`
  - night: `-4`
- ถ้า `heater_on = true`: `+heater_heat`, โดย
  - `heater_heat = round(heater_power / 15)` (เช่น 30% => 2)
- ถ้า `payload_on = true`: `+1`
- ถ้า `safe_mode = true`: ปิด payload/heater (ไม่มีผล +heater/+payload heat)
- `radiation glitch` ไม่มีผลตรงกับ temperature ในเวอร์ชันนี้

---

## 4.2 ลำดับการรันใน 1 tick (Execution Order)

เพื่อแก้ความไม่ชัดของ `when ... do`, `if ... else`, และ actuator ชนกัน ให้ใช้ลำดับตายตัวนี้:

1. อ่าน state ต้น tick (`battery`, `temperature`, `safe_mode`, `is_daylight`, `tick_number`)
2. ประมวลผล event block `when [event] do ...` ทั้งหมดที่เงื่อนไขเป็นจริงใน tick นี้
3. ประมวลผล main body (`if/else`, คำสั่งปกติ, `wait`, `repeat`)
4. resolve คำสั่ง actuator ที่ขัดแย้งด้วย priority policy
5. apply physics (battery/temperature delta)
6. apply forced event effect (`radiation glitch` tick 8)
7. clamp + บันทึก log + ขยับ tick ถัดไป

### Priority policy (เมื่อคำสั่งขัดแย้งกันใน tick เดียว)

- `enter safe mode` มี priority สูงสุด
- ถ้าเข้า safe mode แล้ว:
  - `payload_on` และ `heater_on` effective เป็น `false` ทันที
  - `exit safe mode` ที่เกิดใน tick เดียวกันให้มีผลที่ tick ถัดไปเท่านั้น
- ถ้าคำสั่งเดียวกันถูกสั่งหลายครั้งใน tick เดียว (เช่น payload ON/OFF ซ้ำ):
  - ใช้กฎ `last command wins` ภายใน execution phase เดียวกัน

---

## 4.3 Semantics ของบล็อกที่เสี่ยงสูง

- `repeat until end of window`
  - loop ตาม tick ไม่ใช่ instruction-level spin
  - 1 iteration ต้องจบด้วยการ consume เวลา 1 tick เสมอ
  - ห้ามวนใน tick เดิมแม้ body ไม่มี `wait`
- `wait 1 tick`
  - จบ tick ปัจจุบันทันที และย้ายไปรอบถัดไป
- `when [event] do ...`
  - trigger ได้อย่างมาก 1 ครั้งต่อ event ต่อ tick
  - ไม่ re-enter ซ้อนใน tick เดียวกัน

---

## 4.4 กติกาโบนัส Payload (ทำให้วัดผลได้แน่นอน)

- โบนัส Comms ให้เฉพาะเมื่อ:
  - ผลรวมเป็น Perfect และ
  - `payload_on_effective = true` ใน tick 10 (ช่วง pass/check)
- หาก Perfect แต่ payload ไม่ effective ณ tick 10 => Comms สำเร็จเต็มแต่ **ไม่มีโบนัส**

**บล็อกที่ใช้ได้ (สะสมครบเมื่อถึง tick 10):** ทั้งหมดจากทั้ง 3 เฟส — `battery level`, `temperature`, `is daylight?`, `tick number`, `turn heater [ON/OFF]`, `turn payload [ON/OFF]`, `enter/exit safe mode`, `if...then...else`, `when...do`, `wait 1 tick`, `repeat until end of window`

**ผลลัพธ์ที่แสดงตอนจบ:**
- Comms: สำเร็จเต็ม / บางส่วน / ล้มเหลว (อิงจาก grading ในข้อ 3)
- Payload data: ได้ครบ / ได้บางส่วน / ไม่ได้เลย
- Longevity impact: แสดงผลอย่างเดียว ยังไม่สะสม (coming soon)
- ข้อความสรุปปิดท้ายเสมอ: **"ดาวเทียมอยู่รอด: ใช่/ไม่ใช่ — ส่งข้อมูลกลับโลกได้: ใช่/ไม่ใช่"**

---

## 5. ข้อควรระวังเฉพาะตอนสาธิต (Demo Mode)

- **Time acceleration:** ปรับให้ tick ที่ไม่มีอะไรเกิดขึ้น (เช่น 1-2 tick แรก) วิ่งเร็ว แล้วชะลอเป็น normal speed ช่วง tick 7-10 ที่มี glitch และ pass ให้ผู้ชมตามทัน
- **เตรียมโค้ดตัวอย่างสำเร็จรูป (pre-built script)** ที่ผ่านครบ perfect ไว้ล่วงหน้า เผื่อกรณีอยากโชว์ผลลัพธ์เร็วๆ แล้วค่อยแก้โค้ดสดบางจุดให้เห็นว่าพัง/แก้ได้จริง
- **glitch ตายตัวที่ tick 8 เท่านั้น** ห้ามสุ่มในโหมดสาธิต เพื่อไม่ให้ผลลัพธ์ของเดโมไม่คงที่
- **Banner คั่นเฟส** ("🔋 Power Phase" → "🌡️ Thermal Phase" → "⚡ OBC Phase") ควรลอยขึ้นสั้นๆ ตอนเปลี่ยน tick 4 และ tick 7 เพื่อให้ผู้ชมยังรู้สึกถึงการไล่ระดับบทเรียน 4 ขั้นเดิม โดยไม่มี loading คั่น

---

## 6. รายการที่เก็บไว้เป็น Coming Soon

- โหมดฝึกฝนแบบหลาย starting condition ต่อ 1 ภารกิจ (ใช้หลังเดโม ไม่ใช่ตอนสาธิตสด)
- การเชื่อมต่อ state ข้ามภารกิจ (ถ้าภายหลังขยายเป็นหลายภารกิจอีกครั้ง)
- ระบบสะสม "satellite health" ระยะยาวที่ผูกกับ Orbital Longevity จริงจัง
- ADCS, Propulsion, Structure — ยังไม่นำเข้าระบบในเวอร์ชันนี้

---

## 7. แนวทาง UI ที่แนะนำเพิ่มเติม (เผื่อใช้ตอนออกแบบจริง)

- แสดง **battery bar + temperature gauge** แบบ real-time ระหว่างเล่น เพื่อให้เห็นผลของโค้ดทันทีทุก tick
- ไฮไลต์ **tick ปัจจุบัน** บนไทม์ไลน์ด้านล่างจอ พร้อมจุดที่บอกว่า "pass จะเกิดตรงนี้" (Mission 4)
- เมื่อเกิด `radiation glitch` ให้มี visual shake/flash สั้นๆ เพื่อให้ผู้เล่นรู้ทันทีว่ามีเหตุการณ์เกิดขึ้นโดยไม่ต้องอ่านข้อความ

---

## 8. ข้อควรระวังตอน Implement จริง (สรุปย่อ)

- **ตั้ง global step counter จุดเดียวในตัว interpreter** ที่ทุก block/op ต้องผ่าน — โดยเฉพาะ `repeat until end of window` หรือลูปแบบมี `maxTries` ต้องนับรวมเข้า step counter เดียวกัน ไม่แยกนับเอง ไม่งั้นจะเกิดช่องโหว่ให้ loop วิ่งเกิน limit ที่ตั้งใจไว้
- **อย่าพึ่ง wall-clock timeout จากภายนอกอย่างเดียว** — ให้ interpreter เช็คเวลาที่ผ่านไปเองทุกครั้งที่รัน 1 tick/op เพราะ thread ใน Python สั่ง kill กลางคันไม่ได้จริง
- **ถ้ารันบน backend แบบ async (เช่น FastAPI)** ต้องส่งการรัน interpreter ไปที่ thread pool/executor แยก ไม่เรียกตรงใน coroutine เพื่อไม่ให้ผู้เล่นคนอื่นค้างรอตอนมีคนกด "run" พร้อมกันหลายคน
- **เช็คความลึก/ขนาดของ block program แบบ loop ไม่ใช่ recursive function** ตอน validate ก่อนรัน เพื่อกันกรณีมีคนต่อบล็อกซ้อนลึกผิดปกติจนโปรแกรม validator เองพัง
- **ถ้ามี schema ของ AST/บล็อกอยู่ทั้งฝั่งหน้าบ้านและหลังบ้านแยกกัน** ให้ generate จากแหล่งเดียว (เช่น export JSON Schema จาก backend) แทนการเขียนซ้ำสองที่ เพื่อกันข้อมูล 2 ฝั่งไม่ตรงกันเมื่อเพิ่มบล็อกใหม่ในอนาคต

### เพิ่มเติมที่ต้องมีใน DoD (Definition of Done)

- มี golden test อย่างน้อย 1 เคสของ Mission 10 tick ที่ expected state ต่อ tick ถูกตรึงครบทั้ง `battery` และ `temperature`
- มี conflict test: tick เดียวกันที่สั่ง `enter safe mode` พร้อม `payload ON` ต้องได้ผลตาม priority policy
- มี boundary test ของ grading ครบจุดสำคัญ (14/15/39/40 ของ battery และขอบ `temp_min`, `temp_max`, `mid_low`, `mid_high`)
- มี test ยืนยันว่า `repeat until end of window` consume tick จริง ไม่สามารถ spin ใน tick เดียวจนหลบ step limit
