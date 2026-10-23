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

  // 1. ประเมินธาตุสมุฏฐานจากอาการสำคัญ
  const symptomsText = [
    ...caseData.extractedSymptoms.chiefComplaint,
    caseData.rawNote || '',
  ].join(' ');

  const hasBloating =
    symptomsText.includes('ท้องอืด') ||
    symptomsText.includes('แน่น') ||
    symptomsText.includes('เรอ') ||
    symptomsText.includes('จุก');
  const hasBodyAche =
    symptomsText.includes('ปวด') ||
    symptomsText.includes('เมื่อย') ||
    symptomsText.includes('ตึง');

  let dhatuTitle = 'วาโยธาตุ · กุจฉิสยาวาตา';
  let dhatuDetail = 'อาการทางเดินอาหารและกล้ามเนื้อสัมพันธ์กับธาตุลม';

  if (hasBloating && hasBodyAche) {
    vayoScore += 32;
    dhatuTitle = 'วาโยธาตุ · กุจฉิสยาวาตา & องคมังคานุสารีวาตา';
    dhatuDetail = 'ท้องอืด แน่นท้อง ร่วมกับปวดเมื่อยตามตัว สัมพันธ์กับลมในช่องท้องและลมพัดทั่วกาย';
    reasons.push('อาการท้องอืด แน่นเฟ้อ และปวดตึงคอบ่าหลัง สัมพันธ์กับลมกุจฉิสยาวาตะและองคมังคานุสารีวาตะ');
    citations.push({ book: 'คัมภีร์ธาตุบรรจบ', page: 12 });
  } else if (hasBloating) {
    vayoScore += 27;
    dhatuTitle = 'วาโยธาตุ · กุจฉิสยาวาตา';
    dhatuDetail = 'อาการท้องอืด แน่นท้อง สัมพันธ์กับลมในช่องท้อง';
    reasons.push('อาการท้องอืด แน่นเฟ้อ สัมพันธ์กับลมกุจฉิสยาวาตะ');
    citations.push({ book: 'คัมภีร์ธาตุบรรจบ', page: 12 });
  } else {
    vayoScore += 20;
    reasons.push('อาการระบบกล้ามเนื้อและเส้นเอ็นสัมพันธ์กับวาโยธาตุ');
    citations.push({ book: 'คัมภีร์ชวดาร', page: 19 });
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
    citations.push({ book: 'สมุฏฐานวินิจฉัย', page: 45 });
  }

  const confidence = Math.min(Math.max(vayoScore, techoScore, apoScore), 92);
  const matchedCount = [true, utuMatch, ayuMatch, kalaMatch].filter(Boolean).length;

  const cards: SmutthanDimensionCard[] = [
    {
      dimension: 'ธาตุสมุฏฐาน',
      badge: 'ตรงกับอาการ',
      isMatch: true,
      title: dhatuTitle,
      detail: dhatuDetail,
      citationText: 'อ้างอิง: คัมภีร์ธาตุบรรจบ (น.12)',
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
      citationText: 'อ้างอิง: สมุฏฐานวินิจฉัย (น.45)',
    },
  ];

  return {
    primaryElement: 'ลม',
    confidence,
    matchedCount,
    reasons,
    citations,
    cards,
  };
}