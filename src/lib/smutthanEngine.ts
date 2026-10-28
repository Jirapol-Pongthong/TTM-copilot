// src/lib/smutthanEngine.ts
import { PatientCase, TextbookCitation } from '@/types/clinicalCase';

export interface SmutthanDimensionCard {
  dimension: string;
  badge: string;
  isMatch: boolean;
  title: string;
  detail: string;
  citationText: string;
}

export interface FullSmutthanEvaluation {
  primaryElement: 'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ';
  confidence: number;
  concordanceLevel: string;
  concordanceDescription: string;
  matchedCount: number;
  reasons: string[];
  citations: TextbookCitation[];
  cards: SmutthanDimensionCard[];
}

export function evaluateSmutthan(caseData: PatientCase): FullSmutthanEvaluation {
  const reasons: string[] = [];
  const citations: TextbookCitation[] = [];
  let vayoScore = 0;
  let techoScore = 0;
  let apoScore = 0;
  let pathaviScore = 0;

  // 1. ประเมินธาตุสมุฏฐานจากอาการสำคัญและอุณหภูมิร่างกาย (เทียบกับ 1_Smutthan_Rules)
  const symptomsText = [
    ...(caseData.extractedSymptoms?.chiefComplaint || []),
    caseData.rawNote || '',
  ].join(' ');

  const bodyTemp = caseData.vitals?.temp || 36.6;

  const hasFeverHeat =
    symptomsText.includes('ไข้') ||
    symptomsText.includes('ตัวร้อน') ||
    symptomsText.includes('ร้อนใน') ||
    symptomsText.includes('แสบร้อน') ||
    symptomsText.includes('กระหาย') ||
    symptomsText.includes('ปิตตะ') ||
    bodyTemp >= 37.5;

  const hasHeadache =
    symptomsText.includes('หัว') ||
    symptomsText.includes('ศีรษะ') ||
    symptomsText.includes('ขมับ') ||
    symptomsText.includes('มึน') ||
    symptomsText.includes('เวียน') ||
    symptomsText.includes('อุทธังคมา') ||
    symptomsText.includes('สุมนา');

  const hasHipOrButtock =
    symptomsText.includes('ก้น') ||
    symptomsText.includes('สะโพก') ||
    symptomsText.includes('สลักเพชร') ||
    symptomsText.includes('ก้นกบ') ||
    symptomsText.includes('เอว') ||
    symptomsText.includes('บั้นเอว') ||
    symptomsText.includes('ขา') ||
    symptomsText.includes('กะฏิทารา');

  const hasNeckShoulderBack =
    symptomsText.includes('คอ') ||
    symptomsText.includes('บ่า') ||
    symptomsText.includes('ไหล่') ||
    symptomsText.includes('สะบัก') ||
    symptomsText.includes('หลัง') ||
    symptomsText.includes('เมื่อย') ||
    symptomsText.includes('ตึง');

  const hasBloating =
    symptomsText.includes('ท้องอืด') ||
    symptomsText.includes('แน่น') ||
    symptomsText.includes('เรอ') ||
    symptomsText.includes('จุก') ||
    symptomsText.includes('กุจฉิ') ||
    symptomsText.includes('ปวดท้อง');

  const hasCoughCold =
    symptomsText.includes('ไอ') ||
    symptomsText.includes('เสมหะ') ||
    symptomsText.includes('น้ำมูก') ||
    symptomsText.includes('หวัด') ||
    symptomsText.includes('เจ็บคอ') ||
    symptomsText.includes('ระคายคอ');

  let dhatuTitle = 'วาโยธาตุ · กุจฉิสยาวาตา';
  let dhatuDetail = 'อาการทางเดินอาหารและกล้ามเนื้อสัมพันธ์กับธาตุลม';
  let dhatuCitation = 'อ้างอิง: คัมภีร์ธาตุบรรจบ (น.12)';

  // กรณี 1: มีไข้ / ตัวร้อน ร่วมกับ ปวดศีรษะ (เช่น "ปวดหัวตัวร้อน")
  if (hasFeverHeat && hasHeadache) {
    techoScore += 45;
    vayoScore += 15;
    dhatuTitle = 'เตโชธาตุ · สันตัปปัคคี & ลมอุทธังคมาวาตา';
    dhatuDetail = 'พิษไข้ความร้อน (สันตัปปัคคี) กำเริบหนุนให้ลมพัดขึ้นเบื้องบน ทำให้ตัวร้อนและปวดตึงศีรษะ';
    reasons.push('อาการตัวร้อนมีไข้ร่วมกับปวดศีรษะ เกิดจากเตโชธาตุ (สันตัปปัคคี) กำเริบหนุนลมอุทธังคมาวาตาพัดขึ้นเบื้องบน');
    citations.push({ book: 'คัมภีร์ฉันทศาสตร์', page: 11 });
    citations.push({ book: 'คัมภีร์เชวตสาร', page: 35 });
    dhatuCitation = 'อ้างอิง: คัมภีร์ฉันทศาสตร์ (น.11) & คัมภีร์เชวตสาร (น.35)';
  }
  // กรณี 2: ตัวร้อน / มีไข้ อย่างเดียว (เตโชธาตุ)
  else if (hasFeverHeat) {
    techoScore += 42;
    dhatuTitle = 'เตโชธาตุ · สันตัปปัคคี & พัทธปิตตะ';
    dhatuDetail = 'ไฟในกายกำเริบ เกิดความร้อนรุม มีไข้ตัวร้อน หรือกระหายน้ำ';
    reasons.push('อาการตัวร้อนและไข้ สัมพันธ์กับเตโชธาตุ (สันตัปปัคคี) กำเริบหนุนด้วยปิตตะสมุฏฐาน');
    citations.push({ book: 'คัมภีร์ฉันทศาสตร์', page: 11 });
    dhatuCitation = 'อ้างอิง: คัมภีร์ฉันทศาสตร์ (น.11)';
  }
  // กรณี 3: ไอ / เสมหะ / เจ็บคอ (อาโปธาตุ)
  else if (hasCoughCold) {
    apoScore += 42;
    dhatuTitle = 'อาโปธาตุ · ศิโรเสมหะ & คีวะเสมหะ';
    dhatuDetail = 'เสมหะในลำคอและช่องอกกำเริบ ส่งผลให้ไอ ระคายคอ เจ็บคอ หรือมีน้ำมูก';
    reasons.push('อาการไอ เจ็บคอ หรือมีเสมหะ สัมพันธ์กับอาโปธาตุ (ศิโรเสมหะและคีวะเสมหะ) พิการแปรปรวน');
    citations.push({ book: 'คัมภีร์ธาตุวิภังค์', page: 22 });
    dhatuCitation = 'อ้างอิง: คัมภีร์ธาตุวิภังค์ (น.22)';
  }
  // กรณี 4: ปวดหัว ร่วมกับ ปวดก้น/สะโพก (ลมอุทธังคมาวาตา & อังคมังคานุสารีวาตา)
  else if (hasHeadache && hasHipOrButtock) {
    vayoScore += 35;
    dhatuTitle = 'วาโยธาตุ · ลมอุทธังคมาวาตา & กะฏิทาราวาตา';
    dhatuDetail = 'มีลมพัดขึ้นเบื้องบนทำให้ปวดตึงศีรษะขมับ ร่วมกับลมแล่นทั่วกายติดขัดตามแนวก้น สะโพก และเส้นเอ็น';
    reasons.push('อาการปวดศีรษะสัมพันธ์กับลมอุทธังคมาวาตา (ลมพัดขึ้น) และอาการปวดสะโพก/ก้นสัมพันธ์กับลมอังคมังคานุสารีวาตาและกะฏิทาราวาตา');
    citations.push({ book: 'คัมภีร์เชวตสาร', page: 35 });
    citations.push({ book: 'คัมภีร์แผนนวดไทย', page: 14 });
    dhatuCitation = 'อ้างอิง: คัมภีร์เชวตสาร (น.35) & คัมภีร์แผนนวดไทย (น.14)';
  }
  // กรณี 5: ปวดหัว / เวียนศีรษะอย่างเดียว
  else if (hasHeadache) {
    vayoScore += 35;
    dhatuTitle = 'วาโยธาตุ · ลมสุมนาวาตา & อุทธังคมาวาตา';
    dhatuDetail = 'ลมกำเริบแล่นขึ้นสู่เบื้องสูงผ่านเส้นสุมนา ทำให้เลือดไปเลี้ยงศีรษะไม่สะดวก เกิดอาการวิงเวียนและปวดขมับ';
    reasons.push('อาการปวดศีรษะและมึนตึงขมับ เกิดจากลมอุทธังคมาวาตาและลมสุมนาวาตากำเริบพัดขึ้นเบื้องบน');
    citations.push({ book: 'คัมภีร์เชวตสาร', page: 35 });
    dhatuCitation = 'อ้างอิง: คัมภีร์เชวตสาร (น.35)';
  }
  // กรณี 6: ปวดก้น/สะโพก หรือ ปวดเมื่อยคอบ่าหลัง
  else if (hasHipOrButtock || hasNeckShoulderBack) {
    if (hasBloating) {
      vayoScore += 35;
      dhatuTitle = 'วาโยธาตุ · กุจฉิสยาวาตะ & อังคมังคานุสารีวาตา';
      dhatuDetail = 'ท้องอืด แน่นเฟ้อ ร่วมกับปวดเมื่อยคอบ่าไหล่ ลมอั้นในกระเพาะอาหารและลมพัดซ่านทั่วร่างกายทำให้กล้ามเนื้อตึงตัว';
      reasons.push('อาการท้องอืด แน่นเฟ้อ และปวดตึงกล้ามเนื้อ สัมพันธ์กับลมกุจฉิสยาวาตะและอังคมังคานุสารีวาตะ');
      citations.push({ book: 'คัมภีร์โรคนิจฉัย', page: 19 });
      dhatuCitation = 'อ้างอิง: คัมภีร์โรคนิจฉัย (น.19)';
    } else {
      vayoScore += 35;
      dhatuTitle = 'วาโยธาตุ · ลมอังคมังคานุสารีวาตา (ลมแล่นในเส้น)';
      dhatuDetail = 'ลมแล่นตามสรรพางค์กายติดขัดตามแนวก้น สะโพก เส้นเอ็น และกล้ามเนื้อ';
      reasons.push('อาการปวดกล้ามเนื้อและเส้นเอ็น สัมพันธ์กับลมอังคมังคานุสารีวาตาคั่งค้างในแนวเส้นเอ็น');
      citations.push({ book: 'คัมภีร์แผนนวดไทย', page: 14 });
      dhatuCitation = 'อ้างอิง: คัมภีร์แผนนวดไทย (น.14)';
    }
  }
  // กรณี 7: ท้องอืดอย่างเดียว
  else if (hasBloating) {
    vayoScore += 35;
    dhatuTitle = 'วาโยธาตุ · กุจฉิสยาวาตา';
    dhatuDetail = 'อาการท้องอืด แน่นเฟ้อ ลมอั้นในกระเพาะอาหารและลำไส้';
    reasons.push('อาการท้องอืด แน่นเฟ้อ สัมพันธ์กับลมกุจฉิสยาวาตะ');
    citations.push({ book: 'คัมภีร์ธาตุบรรจบ', page: 12 });
    dhatuCitation = 'อ้างอิง: คัมภีร์ธาตุบรรจบ (น.12)';
  } else {
    vayoScore += 25;
    reasons.push('อาการระบบกล้ามเนื้อและเส้นเอ็นสัมพันธ์กับวาโยธาตุ');
    citations.push({ book: 'คัมภีร์แผนนวดไทย', page: 14 });
    dhatuCitation = 'อ้างอิง: คัมภีร์แผนนวดไทย (น.14)';
  }

  // 2. ประเมินอุตุสมุฏฐาน (ฤดูกาล) ตาม 1_Smutthan_Rules
  let utuTitle = 'วสันตฤดู (ฤดูฝน: ก.ค.–ต.ค.)';
  let utuDetail = 'ธาตุประจำฤดู: วาโยสมุฏฐาน (ลมกำเริบ/กุจฉิสยาวาตะ)';
  let utuElement: 'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ' = 'ลม';
  let utuCitation = 'อ้างอิง: คัมภีร์เวชกรรมไทย 1 (น.58)';

  if (caseData.season === 'rainy') {
    vayoScore += 25;
    utuElement = 'ลม';
    reasons.push('วสันตฤดู (ฤดูฝน) ความชื้นและไอฝนกระตุ้นให้เกิดลมปั่นป่วนในลำไส้ จุกเสียด แน่นท้อง');
    citations.push({ book: 'คัมภีร์เวชกรรมไทย เล่ม 1', page: 58 });
  } else if (caseData.season === 'summer') {
    techoScore += 25;
    utuElement = 'ไฟ';
    utuTitle = 'คิมหันตฤดู (ฤดูร้อน: มี.ค.–มิ.ย.)';
    utuDetail = 'ธาตุประจำฤดู: ปิตตะสมุฏฐาน (ไฟกำเริบ/สันตัปปัคคี)';
    utuCitation = 'อ้างอิง: คัมภีร์เวชกรรมไทย 1 (น.40)';
    reasons.push('คิมหันตฤดู (ฤดูร้อน) ความร้อนภายนอกกระตุ้นธาตุไฟในร่างกาย เกิดไข้ตัวร้อน คอแห้ง');
    citations.push({ book: 'คัมภีร์เวชกรรมไทย เล่ม 1', page: 40 });
  } else {
    apoScore += 25;
    utuElement = 'น้ำ';
    utuTitle = 'เหมันตฤดู (ฤดูหนาว: พ.ย.–ก.พ.)';
    utuDetail = 'ธาตุประจำฤดู: เสมหะสมุฏฐาน (น้ำไอเย็นกำเริบ)';
    utuCitation = 'อ้างอิง: คัมภีร์เวชกรรมไทย 1 (น.66)';
    reasons.push('เหมันตฤดู (ฤดูหนาว) ความเย็นกระตุ้นให้ธาตุน้ำแข็งตัว เกิดน้ำมูก ไอ เสมหะเหนียวข้น');
    citations.push({ book: 'คัมภีร์เวชกรรมไทย เล่ม 1', page: 66 });
  }

  // 3. ประเมินอายุสมุฏฐาน (ช่วงวัย) ตาม 1_Smutthan_Rules
  const age = caseData.age || 58;
  let ayuTitle = 'ปัจฉิมวัย (32–64+ ปี)';
  let ayuDetail = `อายุ ${age} ปี · ธาตุประจำวัย: วาโยสมุฏฐาน (วาตะกำเริบ/หทัยวาตะ)`;
  let ayuElement: 'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ' = 'ลม';
  let ayuCitation = 'อ้างอิง: คัมภีร์เวชศึกษา (น.34)';

  if (age >= 32) {
    vayoScore += 25;
    ayuElement = 'ลม';
    reasons.push(`อายุ ${age} ปี (ปัจฉิมวัย) วัยชราธาตุลมเป็นเจ้าเรือน ลมในร่างกายกระพือหรือหย่อน ส่งผลต่อกล้ามเนื้อและข้อต่อ`);
    citations.push({ book: 'คัมภีร์เวชศึกษา', page: 34 });
  } else if (age > 16) {
    techoScore += 25;
    ayuElement = 'ไฟ';
    ayuTitle = 'มัชฌิมวัย (16–32 ปี)';
    ayuDetail = `อายุ ${age} ปี · ธาตุประจำวัย: ปิตตะสมุฏฐาน (ปิตตะกำเริบ/พัทธปิตตะ)`;
    ayuCitation = 'อ้างอิง: คัมภีร์เวชศึกษา (น.24)';
    reasons.push(`อายุ ${age} ปี (มัชฌิมวัย) วัยเจริญพันธุ์มีธาตุไฟเป็นเจ้าเรือน เสี่ยงต่อภาวะความร้อนสูง ไข้ และการอักเสบ`);
    citations.push({ book: 'คัมภีร์เวชศึกษา', page: 24 });
  } else {
    apoScore += 25;
    ayuElement = 'น้ำ';
    ayuTitle = 'ปฐมวัย (0–16 ปี)';
    ayuDetail = `อายุ ${age} ปี · ธาตุประจำวัย: เสมหะสมุฏฐาน (เสมหะกำเริบ/พัทธเสมหะ)`;
    ayuCitation = 'อ้างอิง: คัมภีร์เวชศึกษา (น.18)';
    reasons.push(`อายุ ${age} ปี (ปฐมวัย) วัยเด็กมีธาตุน้ำเป็นเจ้าเรือน เกิดภาวะเสมหะและน้ำมูกสะสมง่าย`);
    citations.push({ book: 'คัมภีร์เวชศึกษา', page: 18 });
  }

  // 4. ประเมินกาลสมุฏฐาน (ช่วงเวลาที่มารับบริการ) ตาม 1_Smutthan_Rules
  const visitTime = caseData.visitTime || '10:30';
  const hour = parseInt(visitTime.split(':')[0] || '10', 10);
  let kalaTitle = `${visitTime} น. (10:00–14:00 น.)`;
  let kalaDetail = 'ช่วงเวลา: ปิตตะสมุฏฐาน (ปิตตะกำเริบ · ไฟย่อยและไฟความร้อนทำงานสูงสุด)';
  let kalaElement: 'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ' = 'ไฟ';
  let kalaCitation = 'อ้างอิง: คัมภีร์สมุฏฐานวินิจฉัย (น.45)';

  if ((hour >= 14 && hour < 18) || (hour >= 2 && hour < 6)) {
    vayoScore += 18;
    kalaElement = 'ลม';
    kalaTitle = `${visitTime} น. (14:00–18:00 น. / 02:00–06:00 น.)`;
    kalaDetail = 'ช่วงเวลา: วาโยสมุฏฐาน (วาตะกำเริบ · ลมในร่างกายเคลื่อนไหวมาก ท้องอืด อ่อนเพลีย)';
    kalaCitation = 'อ้างอิง: คัมภีร์สมุฏฐานวินิจฉัย (น.52)';
    citations.push({ book: 'คัมภีร์สมุฏฐานวินิจฉัย', page: 52 });
  } else if ((hour >= 10 && hour < 14) || (hour >= 22 || hour < 2)) {
    techoScore += 18;
    kalaElement = 'ไฟ';
    kalaTitle = `${visitTime} น. (10:00–14:00 น. / 22:00–02:00 น.)`;
    kalaDetail = 'ช่วงเวลา: ปิตตะสมุฏฐาน (ปิตตะกำเริบ · ไฟย่อยและไฟความร้อนทำงานสูงสุด)';
    kalaCitation = 'อ้างอิง: คัมภีร์สมุฏฐานวินิจฉัย (น.45)';
    citations.push({ book: 'คัมภีร์สมุฏฐานวินิจฉัย', page: 45 });
  } else {
    apoScore += 18;
    kalaElement = 'น้ำ';
    kalaTitle = `${visitTime} น. (06:00–10:00 น. / 18:00–22:00 น.)`;
    kalaDetail = 'ช่วงเวลา: เสมหะสมุฏฐาน (เสมหะกำเริบ · อุณหภูมิกายต่ำ กระตุ้นธาตุน้ำและเสมหะ)';
    kalaCitation = 'อ้างอิง: คัมภีร์สมุฏฐานวินิจฉัย (น.30)';
    citations.push({ book: 'คัมภีร์สมุฏฐานวินิจฉัย', page: 30 });
  }

  // คำนวณธาตุหลักแบบไดนามิกตามคะแนนสูงสุดจริง
  let primaryElement: 'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ' = 'ลม';
  let maxScore = vayoScore;

  if (techoScore > maxScore) {
    primaryElement = 'ไฟ';
    maxScore = techoScore;
  }
  if (apoScore > maxScore) {
    primaryElement = 'น้ำ';
    maxScore = apoScore;
  }
  if (pathaviScore > maxScore) {
    primaryElement = 'ดิน';
    maxScore = pathaviScore;
  }

  const utuMatch = utuElement === primaryElement;
  const ayuMatch = ayuElement === primaryElement;
  const kalaMatch = kalaElement === primaryElement;

  const matchedCount = [true, utuMatch, ayuMatch, kalaMatch].filter(Boolean).length;
  const confidence = Math.round((matchedCount / 4) * 100);

  let concordanceLevel = 'สอดคล้องระดับสูง (3/4 มิติ)';
  let concordanceDescription = 'ปัจจัยสมุฏฐาน 3 มิติสนับสนุนธาตุหลักอย่างชัดเจน โดยมี 1 มิติเป็นปัจจัยร่วม';

  if (matchedCount === 4) {
    concordanceLevel = 'สอดคล้องสมบูรณ์ (4/4 มิติ)';
    concordanceDescription = 'ปัจจัยสมุฏฐาน 4 มิติ (ธาตุ-อุตุ-อายุ-กาล) บ่งชี้ไปในทิศทางเดียวกันอย่างสมบูรณ์ตามแนวทางเวชกรรมปฐมภูมิ';
  } else if (matchedCount === 3) {
    concordanceLevel = 'สอดคล้องระดับสูง (3/4 มิติ)';
    concordanceDescription = 'ปัจจัยสมุฏฐาน 3 มิติสนับสนุนธาตุหลักอย่างชัดเจน โดยมี 1 มิติเป็นปัจจัยร่วมตามแนวทางเวชกรรมปฐมภูมิ';
  } else if (matchedCount === 2) {
    concordanceLevel = 'มีปฏิสัมพันธ์พหุธาตุ (2/4 มิติ)';
    concordanceDescription = 'ภาวะทุวันโทษ/พหุธาตุ ปัจจัยสมุฏฐานชี้ร่วม 2 มิติ แพทย์ควรพิจารณาธาตุแทรกซ้อน';
  } else {
    concordanceLevel = 'สอดคล้องเฉพาะธาตุสมุฏฐาน (1/4 มิติ)';
    concordanceDescription = 'อาการทางคลินิกเป็นตัวชี้วัดเดี่ยว แพทย์ควรซักประวัติกาลและอุตุเพิ่มเติม';
  }

  const cards: SmutthanDimensionCard[] = [
    {
      dimension: 'ธาตุสมุฏฐาน',
      badge: 'ตรงกับอาการ',
      isMatch: true,
      title: dhatuTitle,
      detail: dhatuDetail,
      citationText: dhatuCitation,
    },
    {
      dimension: 'อุตุสมุฏฐาน',
      badge: utuMatch ? 'ตรงกับธาตุ' : 'ปัจจัยร่วม',
      isMatch: utuMatch,
      title: utuTitle,
      detail: utuDetail,
      citationText: utuCitation,
    },
    {
      dimension: 'อายุสมุฏฐาน',
      badge: ayuMatch ? 'ตรงกับธาตุ' : 'ปัจจัยร่วม',
      isMatch: ayuMatch,
      title: ayuTitle,
      detail: ayuDetail,
      citationText: ayuCitation,
    },
    {
      dimension: 'กาลสมุฏฐาน',
      badge: kalaMatch ? 'ตรงกับธาตุ' : 'ปัจจัยร่วม',
      isMatch: kalaMatch,
      title: kalaTitle,
      detail: kalaDetail,
      citationText: kalaCitation,
    },
  ];

  // เพิ่มการอ้างอิงแนวทางปฏิบัติเวชกรรมไทยในหน่วยบริการปฐมภูมิ พ.ศ. 2564 (น. 89-91)
  if (!citations.some((c) => c.book.includes('ปฐมภูมิ'))) {
    citations.push({
      book: 'แนวทางปฏิบัติเวชกรรมไทยในการดูแลผู้ป่วยในหน่วยบริการปฐมภูมิ',
      page: 90,
    });
  }

  return {
    primaryElement,
    confidence,
    concordanceLevel,
    concordanceDescription,
    matchedCount,
    reasons,
    citations,
    cards,
  };
}
