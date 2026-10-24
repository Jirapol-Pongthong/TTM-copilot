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

  // 1. ประเมินธาตุสมุฏฐานจากอาการสำคัญ (ดักจับคำตามคัมภีร์เวชกรรมไทย)
  const symptomsText = [
    ...(caseData.extractedSymptoms?.chiefComplaint || []),
    caseData.rawNote || '',
  ].join(' ');

  const hasHeadache =
    symptomsText.includes('หัว') ||
    symptomsText.includes('ศีรษะ') ||
    symptomsText.includes('ขมับ') ||
    symptomsText.includes('มึน') ||
    symptomsText.includes('เวียน') ||
    symptomsText.includes('อุทธังคมา');

  const hasHipOrButtock =
    symptomsText.includes('ก้น') ||
    symptomsText.includes('สะโพก') ||
    symptomsText.includes('สลักเพชร') ||
    symptomsText.includes('ก้นกบ') ||
    symptomsText.includes('เอว') ||
    symptomsText.includes('บั้นเอว') ||
    symptomsText.includes('ขา');

  const hasNeckShoulderBack =
    symptomsText.includes('คอ') ||
    symptomsText.includes('บ่า') ||
    symptomsText.includes('ไหล่') ||
    symptomsText.includes('สะบัก') ||
    symptomsText.includes('หลัง') ||
    symptomsText.includes('เมื่อย') ||
    symptomsText.includes('ตึง') ||
    symptomsText.includes('ปวด');

  const hasBloating =
    symptomsText.includes('ท้องอืด') ||
    symptomsText.includes('แน่น') ||
    symptomsText.includes('เรอ') ||
    symptomsText.includes('จุก') ||
    symptomsText.includes('กุจฉิสยา');

  const hasFeverHeat =
    symptomsText.includes('ไข้') ||
    symptomsText.includes('ตัวร้อน') ||
    symptomsText.includes('แสบร้อน') ||
    symptomsText.includes('กระหาย') ||
    symptomsText.includes('ปิตตะ');

  const hasCoughCold =
    symptomsText.includes('ไอ') ||
    symptomsText.includes('เสมหะ') ||
    symptomsText.includes('น้ำมูก') ||
    symptomsText.includes('หวัด');

  let dhatuTitle = 'วาโยธาตุ · กุจฉิสยาวาตา';
  let dhatuDetail = 'อาการทางเดินอาหารและกล้ามเนื้อสัมพันธ์กับธาตุลม';
  let dhatuCitation = 'อ้างอิง: คัมภีร์ธาตุบรรจบ (น.12)';

  // กรณี 1: ปวดหัว ร่วมกับ ปวดก้น/สะโพก (ลมอุทธังคมาวาตา & อังคมังคานุสารีวาตา)
  if (hasHeadache && hasHipOrButtock) {
    vayoScore += 35;
    dhatuTitle = 'วาโยธาตุ · ลมอุทธังคมาวาตา & อังคมังคานุสารีวาตา';
    dhatuDetail = 'มีลมพัดขึ้นเบื้องบนทำให้ปวดตึงศีรษะขมับ ร่วมกับลมแล่นทั่วกายติดขัดตามแนวก้น สะโพก และเส้นเอ็น';
    reasons.push('อาการปวดศีรษะสัมพันธ์กับลมอุทธังคมาวาตา (ลมพัดขึ้น) และอาการปวดสะโพก/ก้นสัมพันธ์กับลมอังคมังคานุสารีวาตาในแนวเส้นกาลทารี');
    citations.push({ book: 'คัมภีร์ชวดาร', page: 19 });
    citations.push({ book: 'ตำราเวชกรรมไทย เล่ม 1', page: 42 });
    dhatuCitation = 'อ้างอิง: คัมภีร์ชวดาร (น.19) & ตำราเวชกรรมไทย 1 (น.42)';
  }
  // กรณี 2: ปวดหัวอย่างเดียว
  else if (hasHeadache) {
    vayoScore += 30;
    dhatuTitle = 'วาโยธาตุ · ลมอุทธังคมาวาตา';
    dhatuDetail = 'ลมพัดขึ้นเบื้องบนทำให้แรงดันโลหิตดันขึ้น ปวดตึงบริเวณศีรษะและขมับ';
    reasons.push('อาการปวดศีรษะและมึนตึงขมับ เกิดจากลมอุทธังคมาวาตากำเริบพัดขึ้นเบื้องบน');
    citations.push({ book: 'คัมภีร์ชวดาร', page: 19 });
    dhatuCitation = 'อ้างอิง: คัมภีร์ชวดาร (น.19)';
  }
  // กรณี 3: ปวดก้น/สะโพก หรือ ปวดเมื่อยคอบ่าหลัง
  else if (hasHipOrButtock || hasNeckShoulderBack) {
    if (hasBloating) {
      vayoScore += 32;
      dhatuTitle = 'วาโยธาตุ · กุจฉิสยาวาตา & องคมังคานุสารีวาตา';
      dhatuDetail = 'ท้องอืด แน่นท้อง ร่วมกับปวดเมื่อยตามตัว สัมพันธ์กับลมในช่องท้องและลมพัดทั่วกาย';
      reasons.push('อาการท้องอืด แน่นเฟ้อ และปวดตึงกล้ามเนื้อ สัมพันธ์กับลมกุจฉิสยาวาตะและองคมังคานุสารีวาตะ');
      citations.push({ book: 'คัมภีร์ธาตุบรรจบ', page: 12 });
      dhatuCitation = 'อ้างอิง: คัมภีร์ธาตุบรรจบ (น.12)';
    } else {
      vayoScore += 28;
      dhatuTitle = 'วาโยธาตุ · ลมอังคมังคานุสารีวาตา (ลมแล่นในเส้น)';
      dhatuDetail = 'ลมแล่นตามสรรพางค์กายติดขัดตามแนวก้น สะโพก เส้นเอ็น และกล้ามเนื้อ';
      reasons.push('อาการปวดกล้ามเนื้อและเส้นเอ็น สัมพันธ์กับลมอังคมังคานุสารีวาตาคั่งค้างในแนวเส้นประธานสิบ');
      citations.push({ book: 'ตำราเวชกรรมไทย เล่ม 1', page: 42 });
      dhatuCitation = 'อ้างอิง: ตำราเวชกรรมไทย เล่ม 1 (น.42)';
    }
  }
  // กรณี 4: ท้องอืดอย่างเดียว
  else if (hasBloating) {
    vayoScore += 27;
    dhatuTitle = 'วาโยธาตุ · กุจฉิสยาวาตา';
    dhatuDetail = 'อาการท้องอืด แน่นท้อง สัมพันธ์กับลมในช่องท้องและทางเดินอาหาร';
    reasons.push('อาการท้องอืด แน่นเฟ้อ สัมพันธ์กับลมกุจฉิสยาวาตะ');
    citations.push({ book: 'คัมภีร์ธาตุบรรจบ', page: 12 });
    dhatuCitation = 'อ้างอิง: คัมภีร์ธาตุบรรจบ (น.12)';
  }
  // กรณี 5: ตัวร้อน / มีไข้ (เตโชธาตุ)
  else if (hasFeverHeat) {
    techoScore += 35;
    dhatuTitle = 'เตโชธาตุ · สันตัปปัคคี & ปิตตะสมุฏฐาน';
    dhatuDetail = 'ไฟในกายกำเริบ เกิดความร้อนรุม มีไข้ หรือกระหายน้ำ';
    reasons.push('อาการตัวร้อนและไข้ สัมพันธ์กับเตโชธาตุ (สันตัปปัคคี) กำเริบหนุนด้วยปิตตะสมุฏฐาน');
    citations.push({ book: 'คัมภีร์ธาตุวิภังค์', page: 25 });
    dhatuCitation = 'อ้างอิง: คัมภีร์ธาตุวิภังค์ (น.25)';
  }
  // กรณี 6: ไอ / เสมหะ (อาโปธาตุ)
  else if (hasCoughCold) {
    apoScore += 35;
    dhatuTitle = 'อาโปธาตุ · ศอเสมหะ & อุระเสมหะ';
    dhatuDetail = 'เสมหะในลำคอและช่องอกกำเริบ ส่งผลให้ไอ ระคายคอ หรือมีน้ำมูก';
    reasons.push('อาการไอและมีเสมหะ สัมพันธ์กับอาโปธาตุ (ศอเสมหะและอุระเสมหะ) พิการแปรปรวน');
    citations.push({ book: 'คัมภีร์มุขโรค', page: 30 });
    dhatuCitation = 'อ้างอิง: คัมภีร์มุขโรค (น.30)';
  } else {
    vayoScore += 20;
    reasons.push('อาการระบบกล้ามเนื้อและเส้นเอ็นสัมพันธ์กับวาโยธาตุ');
    citations.push({ book: 'คัมภีร์ชวดาร', page: 19 });
    dhatuCitation = 'อ้างอิง: คัมภีร์ชวดาร (น.19)';
  }

  // 2. ประเมินอุตุสมุฏฐาน (ฤดูกาล)
  let utuTitle = 'วสันตฤดู (ฤดูฝน)';
  let utuDetail = 'ธาตุประจำฤดู: วาโยธาตุ (กุจฉิสยาวาตา)';
  let utuMatch = true;

  if (caseData.season === 'rainy') {
    vayoScore += 30;
    reasons.push('วสันตฤดู (ฤดูฝน) ความชื้นกระตุ้นวาโยสมุฏฐานให้แปรปรวน');
    citations.push({ book: 'ตำราเวชกรรมไทย เล่ม 1', page: 58 });
  } else if (caseData.season === 'summer') {
    techoScore += 30;
    utuTitle = 'คิมหันตฤดู (ฤดูร้อน)';
    utuDetail = 'ธาตุประจำฤดู: เตโชธาตุ (สันตัปปัคคี)';
    utuMatch = false;
  } else {
    apoScore += 30;
    utuTitle = 'เหมันตฤดู (ฤดูหนาว)';
    utuDetail = 'ธาตุประจำฤดู: อาโปธาตุ (เสมหะและโลหิต)';
    utuMatch = false;
  }

  // 3. ประเมินอายุสมุฏฐาน (ช่วงวัย)
  const age = caseData.age || 58;
  let ayuTitle = `ปัจฉิมวัย (32–64+ ปี)`;
  let ayuDetail = `อายุ ${age} ปี · ธาตุประจำวัย: วาโยธาตุ`;
  let ayuMatch = true;

  if (age >= 32) {
    vayoScore += 30;
    reasons.push(`อายุ ${age} ปี (ปัจฉิมวัย) วาโยธาตุเป็นเจ้าเรือนและกำเริบได้ง่าย`);
    citations.push({ book: 'คัมภีร์เวชศึกษา', page: 34 });
  } else if (age > 16) {
    techoScore += 25;
    ayuTitle = 'มัชฌิมวัย (16–32 ปี)';
    ayuDetail = `อายุ ${age} ปี · ธาตุประจำวัย: อาโปธาตุ (โลหิตเด่น)`;
    ayuMatch = false;
  } else {
    apoScore += 25;
    ayuTitle = 'ปฐมวัย (0–16 ปี)';
    ayuDetail = `อายุ ${age} ปี · ธาตุประจำวัย: อาโปธาตุ (เสมหะเด่น)`;
    ayuMatch = false;
  }

  // 4. ประเมินกาลสมุฏฐาน (ช่วงเวลาที่มารับบริการ)
  const visitTime = caseData.visitTime || '10:30';
  const hour = parseInt(visitTime.split(':')[0] || '10', 10);
  let kalaTitle = `${visitTime} น. (09.00–12.00)`;
  let kalaDetail = 'ช่วงเวลา: โลหิตเด่น (ปิตตะ/โลหิตหนุนอาการ)';
  let kalaMatch = false;

  if ((hour >= 15 && hour < 18) || (hour >= 3 && hour < 6)) {
    vayoScore += 15;
    kalaTitle = `${visitTime} น. (15.00–18.00)`;
    kalaDetail = 'ช่วงเวลา: วาโยเด่น (ตรงกับธาตุลม)';
    kalaMatch = true;
  } else {
    citations.push({ book: 'คัมภีร์สมุฏฐานวินิจฉัย', page: 45 });
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

  const confidence = Math.min(maxScore, 92);
  const matchedCount = [true, utuMatch, ayuMatch, kalaMatch].filter(Boolean).length;

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
      citationText: 'อ้างอิง: ตำราเวชกรรมไทย เล่ม 1 (น.58)',
    },
    {
      dimension: 'อายุสมุฏฐาน',
      badge: ayuMatch ? 'ตรงกับธาตุ' : 'ปัจจัยร่วม',
      isMatch: ayuMatch,
      title: ayuTitle,
      detail: ayuDetail,
      citationText: 'อ้างอิง: คัมภีร์เวชศึกษา (น.34)',
    },
    {
      dimension: 'กาลสมุฏฐาน',
      badge: kalaMatch ? 'ตรงกับธาตุ' : 'ปัจจัยร่วม',
      isMatch: kalaMatch,
      title: kalaTitle,
      detail: kalaDetail,
      citationText: 'อ้างอิง: คัมภีร์สมุฏฐานวินิจฉัย (น.45)',
    },
  ];

  return {
    primaryElement,
    confidence,
    matchedCount,
    reasons,
    citations,
    cards,
  };
}
