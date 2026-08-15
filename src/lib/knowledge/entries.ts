import type { KnowledgeEntry } from "./types";

const ENTRIES: KnowledgeEntry[] = [
  {
    id: "geographic-axis",
    title: "แกนหมุนโลก",
    english: "Geographic Axis / Rotation Axis",
    summary:
      "แกนสมมติที่ลากผ่านขั้วเหนือและขั้วใต้ภูมิศาสตร์ ซึ่งโลกหมุนรอบแกนนี้ทุกวัน",
    visual: "axes-3d",
    body: [
      "แกนนี้เอียงประมาณ 23.44 องศาจากแนวตั้งฉากกับระนาบวงโคจร (ecliptic) มุมเอียงนี้เรียกว่า [[obliquity|obliquity]] และเป็นเหตุที่ทำให้เกิดฤดูกาล เพราะซีกโลกเหนือและใต้ได้รับแสงอาทิตย์ไม่เท่ากันตลอดปี",
      "โลกหมุนรอบแกนนี้ครบหนึ่งรอบใช้เวลาประมาณ 23 ชั่วโมง 56 นาที ซึ่งเรียกว่า sidereal day (วันดาวฤกษ์) สั้นกว่าวันตามปฏิทินเล็กน้อยเพราะโลกเคลื่อนที่ในวงโคจรด้วย",
      "ปลายด้านเหนือของแกนชี้ไปใกล้ดาวโพลาริส (North Star) จึงเป็นจุดอ้างอิงทิศเหนือที่คนใช้มานาน อย่าสับสนกับ [[geomagnetic-axis|แกนแม่เหล็ก]] ที่เอียงออกไปอีกประมาณ 11 องศา",
    ],
  },
  {
    id: "geomagnetic-axis",
    title: "แกนแม่เหล็ก",
    english: "Geomagnetic Dipole Axis",
    summary:
      "แกนสมมติของสนามแม่เหล็กโลก ซึ่งไม่ตรงกับ [[geographic-axis|แกนหมุนโลก]] พอดี",
    visual: "axes-3d",
    body: [
      "แกนแม่เหล็กเอียงประมาณ 11 องศาจากแกนหมุนโลก ดังนั้นขั้วเหนือแม่เหล็กจึงไม่ได้อยู่ที่ขั้วเหนือภูมิศาสตร์ และการเอียงนี้ยังเปลี่ยนตำแหน่งช้าๆ ตามเวลา",
      "สนามแม่เหล็กโลกไม่ได้เกิดจากแท่งแม่เหล็กก้อนใหญ่ แต่เกิดจากกระแสไฟฟ้าในของเหลวโลหะของแกนโลกชั้นนอก (geodynamo) แบบจำลองที่ใช้บ่อยคือ [[dipole|point dipole]] ที่ใจกลางโลก",
      "เส้นสนามแม่เหล็กที่ลากออกจากขั้วหนึ่งไปอีกขั้วหนึ่งสามารถจัดกลุ่มเป็นชั้นที่เรียกว่า [[l-shell|L-shell]] โดยระยะห่างจากโลกยิ่งมาก ชั้นนั้นยิ่งโค้งกว้างขึ้น",
    ],
  },
  {
    id: "freefall",
    title: "ตกอย่างอิสระ",
    english: "Freefall",
    summary:
      "สถานะที่วัตถุเคลื่อนที่ด้วยแรงโน้มถ่วงอย่างเดียว โดยไม่มีพื้นหรือแรงอื่นมารองรับ",
    body: [
      "นักบินอวกาศและดาวเทียมไม่ได้ \"ลอยเพราะไม่มีแรงโน้มถ่วง\" แต่กำลังตกอย่างอิสระรอบโลกตลอดเวลา เหมือนขว้างลูกบอลแรงมากจนโค้งตามความโค้งของโลกไปเรื่อยๆ โดยยังไม่ถึงพื้น",
      "ที่ความสูงประมาณ 400 กิโลเมตรใน [[leo|LEO]] แรงโน้มถ่วงยังเหลือเกือบ 90% ของพื้นโลก แต่เพราะไม่มีพื้นรองรับและทุกอย่างในยานตกพร้อมกัน จึงรู้สึกเหมือนไร้น้ำหนัก",
    ],
  },
  {
    id: "leo",
    title: "วงโคจรต่ำ",
    english: "Low Earth Orbit (LEO)",
    summary:
      "วงโคจรใกล้โลกที่สุดที่ดาวเทียมใช้งานบ่อย ความสูงประมาณ 160 ถึง 2,000 กิโลเมตร",
    body: [
      "ดาวเทียมใน LEO เคลื่อนที่เร็วประมาณ 7.5 ถึง 7.8 กิโลเมตรต่อวินาที และใช้เวลาประมาณ 90 นาทีต่อหนึ่งรอบโลก หลายภารกิจถ่ายภาพโลก สื่อสาร และสถานีอวกาศนานาชาติก็อยู่ในช่วงนี้",
      "แม้จะเรียกว่าอวกาศ แต่ชั้นบรรยากาศบางๆ ยังเหลืออยู่ จึงมีแรงต้านที่ค่อยๆ ทำให้เกิด [[orbital-decay|orbital decay]] หากไม่มีการยกวงโคจร",
    ],
  },
  {
    id: "magnetometer",
    title: "เครื่องวัดสนามแม่เหล็ก",
    english: "Magnetometer",
    summary:
      "เซนเซอร์ที่วัดความแรงและทิศทางของสนามแม่เหล็กรอบตัวดาวเทียม",
    body: [
      "ในวงโคจร ดาวเทียมใช้ magnetometer เพื่อรู้ว่าตัวเองหันไปทางไหนเทียบกับสนามแม่เหล็กโลก เปรียบเหมือนเข็มทิศของยานอวกาศ",
      "ข้อมูลจาก magnetometer มักถูกส่งต่อไปยังระบบควบคุมทิศทาง และมักทำงานคู่กับ [[magnetorquer|magnetorquer]] เพื่อหมุนตัวโดยไม่ต้องพ่นเชื้อเพลิง",
    ],
  },
  {
    id: "magnetorquer",
    title: "แม่เหล็กหมุนอากาศยาน",
    english: "Magnetorquer",
    summary:
      "ขดลวดบนดาวเทียมที่สร้างสนามแม่เหล็กชั่วคราว แล้วใช้แรงจากสนามโลกช่วยหมุนตัวยาน",
    body: [
      "เมื่อส่งกระแสไฟฟ้าผ่านขดลวด จะเกิด moment แม่เหล็ก (m) และเมื่อ moment นี้ตัดกับสนามแม่เหล็กโลก (B) จะได้แรงบิดตามความสัมพันธ์ τ = m × B ทำให้ดาวเทียมหมุนได้โดยไม่ใช้เชื้อเพลิง",
      "วิธีนี้เหมาะกับ CubeSat เพราะประหยัดพลังงานและไม่สิ้นเปลือง propellant แต่แรงบิดค่อนข้างอ่อน และหมุนได้เฉพาะทิศที่ตั้งฉากกับสนามแม่เหล็กในขณะนั้น จึงต้องอาศัย [[magnetometer|magnetometer]] วัดทิศอยู่ตลอด",
    ],
  },
  {
    id: "thermal-cycling",
    title: "Thermal cycling",
    english: "Thermal Cycling",
    summary:
      "การสลับร้อนจัดและเย็นจัดซ้ำๆ ในทุกรอบวงโคจรของดาวเทียม",
    body: [
      "ด้านที่หันเข้าหาดวงอาทิตย์อาจร้อนเกิน 100 องศาเซลเซียส ส่วนด้านที่อยู่ในเงาโลกอาจเย็นต่ำกว่า −100 องศา ใน [[leo|LEO]] การสลับนี้เกิดประมาณทุก 90 นาที",
      "วัสดุจึงขยายและหดตัวซ้ำๆ จนอาจแตกร้าวหรือเสื่อมเร็ว หากออกแบบไม่ดี ดาวเทียมจึงต้องมีฉนวนหลายชั้น (MLI) และพื้นผิวระบายความร้อนเพื่อลดการกระแทกทางอุณหภูมิ",
    ],
  },
  {
    id: "seu",
    title: "SEU",
    english: "Single Event Upset",
    summary:
      "เหตุการณ์ที่อนุภาคพลังงานสูงชนวงจรแล้วทำให้ข้อมูลในหน่วยความจำพลิกค่าชั่วคราว",
    body: [
      "อนุภาคจากดวงอาทิตย์หรือรังสีคอสมิกอาจชนชิปอิเล็กทรอนิกส์จน bit ที่เก็บค่า 0 กลายเป็น 1 หรือกลับกัน โดยไม่ต้องมีซอฟต์แวร์ผิดพลาด ความเสี่ยงจะสูงขึ้นเมื่อบินผ่าน [[saa|SAA]]",
      "วิศวกรมักป้องกันด้วยหน่วยความจำที่มี [[ecc|ECC]], การเก็บข้อมูลซ้ำหลายชุด และ [[watchdog-timer|watchdog timer]] ที่รีเซ็ตระบบเมื่อพบพฤติกรรมผิดปกติ",
    ],
  },
  {
    id: "ecc",
    title: "ECC",
    english: "Error Correction Code",
    summary:
      "วิธีเพิ่มบิตตรวจสอบในหน่วยความจำ เพื่อตรวจจับและแก้ไข bit ที่ flip จากรังสีได้โดยอัตโนมัติ",
    body: [
      "เมื่อเกิด [[seu|SEU]] bit เดียวในหน่วยความจำอาจเปลี่ยนค่าโดยไม่มีใครรู้ ECC จะตรวจพบความผิดปกติจาก parity หรือ checksum ที่เก็บไว้คู่กับข้อมูล แล้วคืนค่าที่ถูกต้องกลับมาได้ทันที โดยซอฟต์แวร์มักไม่รู้ด้วยซ้ำว่าเคยมีข้อผิดพลาด",
      "หน่วยความจำบางชนิด เช่น SRAM ที่มี ECC ในตัว หรือการใช้ Hamming code บนบล็อกข้อมูล ช่วยลดความเสี่ยงที่คำสั่งหรือพารามิเตอร์ภารกิจจะเพี้ยนจากรังสี โดยเฉพาะเมื่อบินผ่าน [[saa|SAA]]",
      "ECC แก้ได้เฉพาะข้อผิดพลาดระดับ bit ไม่กี่ตัว หากเสียหายมากเกินไประบบอาจยังต้องพึ่ง [[watchdog-timer|watchdog timer]] หรือการเก็บข้อมูลซ้ำหลายชุดเพื่อกู้ภารกิจ",
    ],
  },
  {
    id: "watchdog-timer",
    title: "Watchdog timer",
    english: "Watchdog Timer (WDT)",
    summary:
      "ตัวจับเวลาบนบอร์ดที่รีเซ็ตหรือรีสตาร์ทระบบเมื่อซอฟต์แวร์หยุดทำงานตามปกตินานเกินกำหนด",
    body: [
      "โดยปกติโปรแกรมหลักจะ \"feed\" หรือรีเซ็ต watchdog เป็นระยะ เพื่อบอกว่ายังทำงานอยู่ หากเกิด [[seu|SEU]] หรือบั๊กที่ทำให้โค้ดค้าง ลูปหลักไม่ feed แล้ว watchdog จะหมดเวลาและสั่งรีเซ็ต MCU หรือทั้งระบบ",
      "บน CubeSat การมี watchdog ช่วยให้ดาวเทียมกลับมาทำงานได้เองหลังเหตุการณ์ชั่วคราว โดยไม่ต้องรอคำสั่งจากพื้นดินทุกครั้ง แต่ต้องออกแบบให้ feed ถี่พอและไม่รีเซ็ตระหว่างงานสำคัญ เช่น การบันทึกข้อมูลลงหน่วยความจำ",
      "watchdog ไม่ได้แก้ bit ที่เสียหายโดยตรง แต่ช่วยให้ระบบเริ่มต้นใหม่จากสถานะที่รู้จัก มักใช้คู่กับ [[ecc|ECC]] และการเก็บข้อมูลซ้ำเพื่อให้ภารกิจทนต่อรังสีในอวกาศได้ดีขึ้น",
    ],
  },
  {
    id: "van-allen-belts",
    title: "แถบรังสี Van Allen",
    english: "Van Allen Radiation Belts",
    summary:
      "โซนสองชั้นรอบโลกที่สนามแม่เหล็กกักอนุภาคมีประจุพลังงานสูงจากลมสุริยะและรังสีคอสมิกไว้",
    body: [
      "แถบรังสี Van Allen ถูกค้นพบในปี 1958 จากเครื่องมือบน Explorer 1 โดย James Van Allen ก่อนที่มนุษย์จะขึ้นอวกาศ ชั้นในประมาณ 1 ถึง 2 รัศมีโลก ส่วนชั้นนอกประมาณ 3 ถึง 5 รัศมีโลก ตำแหน่งเหล่านี้อธิบายด้วย [[l-shell|L-shell]] ได้",
      "อนุภาคที่ถูกกักไว้จะเคลื่อนที่เป็นรูป doughnut รอบ [[geomagnetic-axis|แกนแม่เหล็ก]] ไม่ได้กระจายเท่ากันทุกที่ ดาวเทียมใน [[leo|LEO]] ส่วนใหญ่บินต่ำกว่าแถบชั้นใน แต่ยังได้รับรังสีจาก SAA และเหตุการณ์พลุงจากดวงอาทิตย์",
      "แถบนี้ช่วยปกป้องโลกโดยดึงอนุภาคอันตรายออกจากพื้นผิว แต่สำหรับดาวเทียมที่ต้องข้ามแถบหรือบินผ่าน [[saa|SAA]] ต้องออกแบบให้ทนต่อรังสีและป้องกัน [[seu|SEU]] ด้วย [[ecc|ECC]] หรือเซนเซอร์ radiation-hardened",
    ],
  },
  {
    id: "saa",
    title: "SAA",
    english: "South Atlantic Anomaly",
    summary:
      "บริเวณเหนือมหาสมุทรแอตแลนติกใต้ที่สนามแม่เหล็กโลกอ่อนกว่าปกติ จึงมีรังสีหนาแน่นกว่าที่อื่นในระดับความสูงเดียวกัน",
    body: [
      "ในโซนนี้ [[van-allen-belts|แถบรังสี Van Allen]] ชั้นในเข้าใกล้พื้นโลกมากกว่าที่อื่น ดาวเทียมที่บินผ่านจึงได้รับรังสีสูงขึ้นชั่วคราว และมีโอกาสเกิด [[seu|SEU]] มากขึ้น",
      "ภารกิจจำนวนมากจึงระวังช่วงผ่าน SAA เป็นพิเศษ เช่น ปิดเซนเซอร์บางตัวชั่วคราว หรือเตรียมรับมือกับข้อผิดพลาดจากรังสีที่เพิ่มขึ้น",
    ],
  },
  {
    id: "orbital-decay",
    title: "Orbital decay",
    english: "Orbital Decay",
    summary:
      "การที่วงโคจรค่อยๆ ต่ำลงเพราะแรงต้านจากบรรยากาศเบาบางหรือแรงรบกวนอื่น",
    body: [
      "ที่ [[leo|LEO]] โมเลกุลอากาศที่เหลืออยู่ยังสร้างแรงต้านได้ เมื่อดาวเทียมช้าลง วงโคจรจะต่ำลง และแรงต้านจะยิ่งแรงขึ้นตามความหนาแน่นของบรรยากาศที่สูงขึ้น",
      "CubeSat การศึกษาหลายลำจึงออกแบบให้ deorbit เองภายในไม่กี่ปี หลังหมดภารกิจ เพื่อลดปัญหาขยะอวกาศ",
    ],
  },
  {
    id: "dipole",
    title: "สนามไดโพล",
    english: "Dipole Field",
    summary:
      "รูปแบบสนามแม่เหล็กพื้นฐานที่มีขั้วเหนือและขั้วใต้ คล้ายสนามรอบแท่งแม่เหล็ก",
    body: [
      "แม้แหล่งกำเนิดจริงของโลกจะซับซ้อนกว่า แต่ในระยะห่างพอสมควร สนามแม่เหล็กโลกสามารถประมาณได้ด้วย dipole ที่วางที่ใจกลางโลก ตามแนว [[geomagnetic-axis|แกนแม่เหล็ก]]",
      "เส้นสนามของ dipole มีรูปร่างสมมาตรและสามารถอธิบายด้วยสมการ r = L · Rₑ · sin²θ ซึ่งใช้จัดกลุ่มเส้นสนามเป็น [[l-shell|L-shell]] ได้",
    ],
  },
  {
    id: "l-shell",
    title: "L-shell",
    english: "McIlwain L-shell",
    summary:
      "ตัวเลขบอกว่าเส้นสนามแม่เหล็กเส้นหนึ่งตัดระนาบศูนย์สูตรที่ระยะกี่เท่าของรัศมีโลก",
    body: [
      "เช่น L = 1.4 หมายถึงเส้นนั้นตัดศูนย์สูตรที่ประมาณ 1.4 รัศมีโลก จึงอยู่ใกล้พื้นผิว ส่วน L = 3.2 จะโค้งออกไปกว้างกว่ามาก ตามแบบจำลอง [[dipole|dipole]]",
      "[[van-allen-belts|แถบรังสี Van Allen]] ที่กักอนุภาคพลังงานสูงไว้ มักอธิบายด้วยช่วง L ประมาณ 1.2 ถึง 6 ดังนั้น L-shell จึงเป็นเครื่องมือสำคัญในการพูดถึงตำแหน่งในสนามแม่เหล็กโลก",
    ],
  },
  {
    id: "obliquity",
    title: "Obliquity",
    english: "Axial Obliquity",
    summary:
      "มุมเอียงของ [[geographic-axis|แกนหมุนโลก]] เทียบกับแนวตั้งฉากของระนาบวงโคจร",
    body: [
      "ค่า obliquity ของโลกปัจจุบันอยู่ที่ประมาณ 23.44 องศา ซึ่งทำให้ซีกโลกแต่ละซีกได้รับแสงอาทิตย์ต่างกันตามฤดูกาล",
      "มุมนี้ไม่ได้คงที่ตลอดกาล แต่เปลี่ยนช้าๆ ตามวัฏจักรยาวหลายหมื่นปีที่เรียกว่า Milankovitch cycles และส่งผลต่อภูมิอากาศระยะยาวของโลก",
    ],
  },
  {
    id: "obc",
    title: "คอมพิวเตอร์ควบคุมบนดาวเทียม",
    english: "On-Board Computer (OBC)",
    summary:
      "สมองกลางของดาวเทียม รับข้อมูลจากทุกระบบ ตัดสินใจ แล้วสั่งงานกลับไป",
    body: [
      "OBC เป็นตัวกลางของการสื่อสารภายในดาวเทียม ระบบอื่นมักไม่คุยตรงกันเอง แต่ส่งเรื่องมาที่ OBC ก่อน",
      "OBC อ่านค่าจาก sensor แล้วรัน [[flight-software|flight software]] ที่มนุษย์เขียนไว้ ทุก [[tick|tick]] วน [[main-loop|Main Loop]]",
      "ไม่ได้ฉลาดเอง ทำตามกฎ: อ่าน → ตัดสินใจ → สั่ง [[eps|EPS]] [[comm|COMM]] [[payload|Payload]]",
    ],
  },
  {
    id: "eps",
    title: "ระบบไฟฟ้ากำลัง",
    english: "Electrical Power System (EPS)",
    summary:
      "ระบบผลิต เก็บ และจ่ายไฟฟ้าให้ทุกส่วนของดาวเทียม",
    body: [
      "EPS ผลิตไฟจากแผงโซลาร์เซลล์ เก็บในแบตเตอรี่ แล้วจ่ายไฟให้ทุกระบบในปริมาณที่เหมาะสม",
      "ดาวเทียมไม่มีปลั๊กไฟให้เสียบใหม่ พลังงานทั้งหมดต้องมาจากแสงอาทิตย์ และต้องพอใช้แม้ตอนอยู่ในเงาโลก",
      "เหมือนพาวเวอร์แบงค์ที่ต้องชาร์จตัวเองด้วยแผงโซลาร์ตลอดเวลา แล้วแบ่งไฟให้อุปกรณ์หลายชิ้นโดยไม่ให้แบตหมด",
    ],
  },
  {
    id: "comm",
    title: "ระบบสื่อสาร",
    english: "Communication (COMM)",
    summary: "ระบบสื่อสารกับพื้นโลก รับคำสั่งและส่งข้อมูลกลับลงมา",
    body: [
      "COMM รับคำสั่งจากพื้นโลก ([[uplink|uplink]]) และส่งข้อมูลกลับลงมา ([[downlink|downlink]])",
      "ดาวเทียมคุยกับโลกได้แค่ตอนบินผ่าน [[ground-station|สถานีภาคพื้นดิน]] เท่านั้น ใน [[leo|LEO]] หน้าต่างเวลาอาจสั้นแค่ไม่กี่นาทีต่อรอบ",
      "เหมือนวิทยุสื่อสารที่ใช้คุยได้เฉพาะตอนอยู่ในระยะสัญญาณ พอออกนอกระยะก็ติดต่อไม่ได้จนกว่าจะวนกลับมา",
    ],
  },
  {
    id: "payload",
    title: "เพย์โหลด",
    english: "Payload",
    summary:
      "อุปกรณ์ที่ทำภารกิจจริงของดาวเทียม เช่น กล้อง เซนเซอร์ หรืออุปกรณ์ทดลอง",
    body: [
      "Payload คือส่วนที่ทำงานจริงตามเป้าหมายของภารกิจ อาจเป็นกล้องถ่ายภาพ เซนเซอร์วัดค่า หรือทดลองเทคโนโลยีใหม่",
      "OBC EPS และ COMM มักออกแบบคล้ายกันในหลายภารกิจเหมือนแชสซีมาตรฐาน ส่วน payload ต่างหากที่บอกว่าดาวเทียมดวงนี้เกิดมาทำอะไร",
      "ข้อมูลภารกิจจาก payload มักถูกส่งกลับผ่าน [[obc|OBC]] แล้วไป [[comm|COMM]] เพื่อ [[downlink|downlink]] ไม่ใช่ส่งตรงเอง",
    ],
  },
  {
    id: "uplink",
    title: "อัปลิงก์",
    english: "Uplink",
    summary: "การส่งสัญญาณหรือคำสั่งจากพื้นโลกขึ้นไปหาดาวเทียม",
    body: [
      "Uplink คือทิศทางจากพื้นขึ้นอวกาศ เช่น สั่งให้ถ่ายภาพ เปลี่ยนโหมด หรือรีเซ็ตระบบ",
      "สัญญาณ uplink เข้าดาวเทียมผ่าน [[comm|COMM]] ก่อน แล้วค่อยถูกส่งต่อไปยัง [[obc|OBC]]",
      "ทำได้เฉพาะตอนดาวเทียมอยู่ในระยะของ [[ground-station|สถานีภาคพื้นดิน]]",
    ],
  },
  {
    id: "downlink",
    title: "ดาวน์ลิงก์",
    english: "Downlink",
    summary: "การส่งข้อมูลจากดาวเทียมลงมายังพื้นโลก",
    body: [
      "Downlink คือทิศทางจากอวกาศลงพื้น เช่น ส่งภาพถ่าย ส่งผลการวัด หรือรายงานสถานะ",
      "[[obc|OBC]] จัดข้อมูลแล้วให้ [[comm|COMM]] ส่งลงผ่านคลื่นวิทยุ",
      "เช่นเดียวกับ uplink ทำได้เฉพาะตอนผ่านสถานีภาคพื้นดิน",
    ],
  },
  {
    id: "telemetry",
    title: "เทเลเมทรี",
    english: "Telemetry",
    summary:
      "ข้อมูลสถานะของดาวเทียมเอง เช่น แบตเหลือเท่าไหร่ อุณหภูมิเท่าไหร่",
    body: [
      "Telemetry แยกจากข้อมูลภารกิจ เช่น ภาพถ่ายจาก [[payload|Payload]] เป็นรายงานว่าดาวเทียมสบายดีไหม",
      "ทีมภาคพื้นใช้ telemetry เพื่อตัดสินใจว่าจะสั่งงานต่อ ลดภารกิจ หรือเข้าเซฟโหมด",
      "มักไหลจากระบบต่างๆ เช่น [[eps|EPS]] ไปยัง [[obc|OBC]] แล้วลงพื้นผ่าน [[comm|COMM]]",
    ],
  },
  {
    id: "ground-station",
    title: "สถานีภาคพื้นดิน",
    english: "Ground Station",
    summary: "จุดบนโลกที่ใช้ติดต่อสื่อสารกับดาวเทียม",
    body: [
      "สถานีภาคพื้นดินมีเสาอากาศและอุปกรณ์วิทยุสำหรับ [[uplink|uplink]] และ [[downlink|downlink]]",
      "ดาวเทียมใน [[leo|LEO]] บินผ่านสถานีแต่ละแห่งได้ไม่นาน จึงต้องวางแผนหน้าต่างติดต่อล่วงหน้า",
      "ถ้าอยู่นอกระยะสัญญาณ จะคุยกับดาวเทียมไม่ได้จนกว่าจะวนกลับมาในระยะอีกครั้ง",
    ],
  },
  {
    id: "tick",
    title: "รอบจำลอง (tick)",
    english: "Simulation Tick",
    summary:
      "หนึ่งรอบที่ OBC อ่านค่า ตัดสินใจ และสั่งงาน ใน Mission 01 มี 10 tick",
    body: [
      "tick ไม่ใช่เวลาจริงเป็นวินาที แต่เป็นรอบจำลองที่วิศวกรกำหนด OBC วนซ้ำ Main Loop ทุก tick",
      "Mission 01 ใช้ 10 tick tick 8 มี [[radiation-glitch|radiation glitch]] และ tick 10 เป็น Comms Check",
      "บล็อก wait 1 tick หมายถึงจบรอบปัจจุบันทันที แล้วไป tick ถัดไป",
    ],
  },
  {
    id: "safe-mode",
    title: "Safe Mode",
    english: "Safe Mode",
    summary:
      "โหมดประหยัดพลังงานสูงสุด ปิด payload และ heater เพื่อให้ดาวเทียมอยู่รอด",
    body: [
      "เมื่อแบตต่ำมาก glitch จากรังสี หรือเหตุฉุกเฉินอื่น OBC จะ enter safe mode",
      "ใน safe mode ดาวเทียมลดการใช้พลังงานสูงสุด payload และ heater ถูกปิด",
      "เมื่อแบตฟื้นหรือสถานการณ์ปลอดภัย ใช้ exit safe mode เพื่อกลับโหมดปกติ (มีผล tick ถัดไป)",
    ],
  },
  {
    id: "flight-software",
    title: "Flight Software",
    english: "Flight Software",
    summary:
      "โปรแกรมที่ OBC รันในวงโคจร เป็นกฎที่มนุษย์เขียนไว้ล่วงหน้า",
    body: [
      "Flight software คือชุดกฎที่บอก [[obc|OBC]] ว่าเมื่ออ่านค่าจาก sensor แล้วต้องสั่งอะไร",
      "ใน LUNAR ใช้บล็อกแทนโค้ด โครงสร้างหลักคือ Setup → [[main-loop|Main Loop]] → Check",
      "ไม่ใช่ AI OBC ทำตามที่เขียนไว้เท่านั้น เปลี่ยนพฤติกรรมได้เมื่ออัปโหลดโปรแกรมใหม่",
    ],
  },
  {
    id: "setup-threshold",
    title: "Threshold (Setup)",
    english: "Threshold",
    summary:
      "ค่าเส้นที่ตั้งไว้ล่วงหน้าใน Setup เช่น แบตต่ำกี่ % ถือว่าอันตราย",
    body: [
      "threshold ตั้งใน Setup block ก่อน tick แรก รันครั้งเดียวตอนเริ่มภารกิจ",
      "ตัวอย่าง: battery threshold low = 20% ถ้าแบตต่ำกว่านี้ ระบบ trigger event battery_low",
      "temp min/max และ heater power ก็ตั้งใน Setup เช่นกัน",
    ],
  },
  {
    id: "main-loop",
    title: "Main Loop",
    english: "Main Loop",
    summary:
      "บล็อกที่ OBC วนซ้ำทุก tick ใส่ if/when และสั่ง actuator ที่นี่",
    body: [
      "Main Loop รันซ้ำทุก [[tick|tick]] อ่าน sensor ตัดสินใจ แล้วสั่ง heater/payload",
      "when events (battery_low, glitch_tick) ประมวลผลก่อน body ของ loop ในแต่ละ tick",
      "wait 1 tick อยู่ท้าย loop เพื่อไม่ให้ spin หลาย action ใน tick เดียว",
    ],
  },
  {
    id: "radiation-glitch",
    title: "Radiation Glitch",
    english: "Radiation Glitch",
    summary:
      "เหตุการณ์จำลองที่ tick 8 แบตลด 25% ทันทีจากรังสีในอวกาศ",
    body: [
      "ใน Mission 01 glitch เกิดที่ tick 8 แน่นอน ต้องเตรียม when glitch_tick do enter [[safe-mode|safe mode]]",
      "glitch ไม่ใช่ bug ของโค้ด แต่เป็นเหตุการณ์ที่จำลองให้ผู้เรียนฝึกรับมือฉุกเฉิน",
      "when ต่างจาก if ตอบสนอง event ทันทีใน tick ที่เกิด",
    ],
  },
  {
    id: "space-debris",
    title: "ขยะอวกาศ",
    english: "Space Debris",
    summary: "วัตถุที่ลอยในวงโคจรโดยไม่ทำงาน อาจชนกับดาวเทียมที่ใช้งานอยู่",
    body: [
      "ดาวเทียมที่หยุดทำงานแต่ยังอยู่ในวงโคจรกลายเป็นขยะอวกาศ",
      "ถ้า OBC ว่างและไม่มีการควบคุม ดาวเทียมอาจกลายเป็นขยะแทนที่จะทำภารกิจ",
    ],
  },
  {
    id: "subsolar",
    title: "Subsolar point",
    english: "Subsolar Point",
    summary:
      "จุดบนวงโคจรที่ดาวเทียมโดนแสงอาทิตย์เต็มที่ เป็นจุดเริ่มภารกิจ v3.1",
    body: [
      "ภารกิจ orbit-based เริ่มที่ sim_sec = 0 ซึ่งเป็น subsolar ตอนนั้น is_in_sunlight = true",
      "หลังจากนั้น phase เพิ่มขึ้นตาม sim_sec / orbitPeriodSec",
    ],
  },
  {
    id: "eclipse",
    title: "Eclipse (เงาโลก)",
    english: "Orbital Eclipse",
    summary:
      "ช่วงที่ดาวเทียมอยู่ในเงาโลก ไม่มีแสงอาทิตย์ชาร์จ (~35% ของวงโคจร LEO)",
    body: [
      "ในโมเดลสอน eclipseFraction ≈ 0.35 ลำดับคือ แดด → eclipse → แดด",
      "ใช้ when eclipse_enter / eclipse_exit ตอบสนองทันทีเมื่อข้ามขอบเขต",
    ],
  },
  {
    id: "orbit-phase",
    title: "Orbit phase",
    english: "Orbit Phase",
    summary:
      "ตำแหน่งบนวงโคจร 0..1 คำนวณจาก sim_sec / orbitPeriodSec",
    body: [
      "phase = 0 ที่ subsolar แล้ว phase เพิ่มเรื่อยๆ จนครบ 1 รอบ",
      "ใช้กำหนด is_in_sunlight และ eclipse_enter/exit",
    ],
  },
  {
    id: "sim-sec",
    title: "sim_sec",
    english: "Simulation Second",
    summary:
      "วินาทีจำลองบนวงโคจร โดย 1 sim_sec = 1 รอบควบคุม OBC",
    body: [
      "ใน lesson demo ใช้ 120 sim_sec (compressed) ส่วนภารกิจจริงประมาณ 5550 sim_sec",
      "obc_sim_sec อ่านค่าปัจจุบันเพื่อจับเวลา comm pass",
    ],
  },
  {
    id: "mission-config",
    title: "Mission config",
    english: "Mission Configuration",
    summary:
      "การตั้งค่าภารกิจในแท็บ EPS/Payload/COMM ไม่ใช่บล็อก Blockly",
    body: [
      "threshold แบต/อุณหภูมิ heater power payload module pass_sim_sec ตั้งก่อนรัน",
      "แยกจาก flight software วิศวกรตั้ง config นักเรียนเขียน logic ใน OBC",
    ],
  },
  {
    id: "flight-software-lib",
    title: "Flight software lib",
    english: "Flight Software Library",
    summary:
      "ชุดบล็อกตาม subsystem: OBC EPS Payload COMM",
    body: [
      "OBC คือโครงโปรแกรมและ control flow EPS คือพลังงานและแสง Payload คือเครื่องมือ",
      "เรียกใช้ใน OBC program เหมือน import จาก subsystem",
    ],
  },
];

const MAP = new Map(ENTRIES.map((e) => [e.id, e]));

/** Normalize free-form marker text (e.g. "Van Allen belts") toward entry ids. */
export function slugifyKnowledgeKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Resolve `[[id|label]]` left side to a catalog id.
 * Accepts kebab ids, spaced English titles, and close matches on `english` / `title`.
 */
export function resolveKnowledgeId(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (MAP.has(trimmed)) return trimmed;

  const slug = slugifyKnowledgeKey(trimmed);
  if (slug && MAP.has(slug)) return slug;

  const lower = trimmed.toLowerCase();
  for (const entry of ENTRIES) {
    if (entry.english.toLowerCase() === lower) return entry.id;
    if (entry.title === trimmed || entry.title.toLowerCase() === lower) return entry.id;
    if (slugifyKnowledgeKey(entry.english) === slug) return entry.id;
    if (slugifyKnowledgeKey(entry.title) === slug) return entry.id;
  }

  // Soft match: marker is a subset of english title (e.g. "Van Allen belts"
  // vs "Van Allen Radiation Belts") or the reverse.
  let best: { id: string; score: number } | undefined;
  for (const entry of ENTRIES) {
    const eng = entry.english.toLowerCase();
    const engSlug = slugifyKnowledgeKey(entry.english);
    if (eng.includes(lower) || lower.includes(eng)) {
      const score = Math.min(eng.length, lower.length);
      if (!best || score > best.score) best = { id: entry.id, score };
      continue;
    }
    if (slug && (engSlug.includes(slug) || slug.includes(engSlug))) {
      const score = Math.min(engSlug.length, slug.length);
      if (!best || score > best.score) best = { id: entry.id, score };
    }
  }
  return best?.id;
}

export function getKnowledge(id: string): KnowledgeEntry | undefined {
  return MAP.get(id);
}

export function getAllKnowledge(): KnowledgeEntry[] {
  return ENTRIES;
}
