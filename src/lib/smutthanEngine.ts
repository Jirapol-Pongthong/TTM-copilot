// src/lib/smutthanEngine.ts
import { PatientCase, TextbookCitation } from '@/types/clinicalCase';
import smutthanRules from '@/data/smutthan_rules.json';

export interface SmutthanDimensionCard {
  dimension: string;
  badge: string;
  weightBadge: string;
  weightValue: number;
  targetDosha: 'วาตะ (ลม)' | 'ปิตตะ (ไฟ)' | 'เสมหะ (น้ำ)' | 'ปิตตะ + วาตะ (พหุอุตุ)';
  isMatch: boolean;
  title: string;
  detail: string;
  citationText: string;
  healthScienceRationale: string;
}

export interface ScoringRuleSummaryRow {
  factor: string;
  scriptureRef: string;
  targetDosha: string;
  weight: string;
  rationale: string;
}

export interface FullSmutthanEvaluation {
  primaryElement: 'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ';
  confidence: number;
  concordanceLevel: string;
  concordanceDescription: string;
  matchedCount: number;
  vasScore: number;
  symptomWeight: number;
  utuAnomalyDetected: boolean;
  utuWeatherSummary: string;
  doshaScores: {
    vata: number;
    pitta: number;
    semha: number;
    maxPossible: number;
    totalAccumulated: number;
  };
  doshaPercentages: {
    vata: number;
    pitta: number;
    semha: number;
  };
  scoringSummaryTable: ScoringRuleSummaryRow[];
  reasons: string[];
  citations: TextbookCitation[];
  cards: SmutthanDimensionCard[];
}

export function evaluateSmutthan(caseData: PatientCase): FullSmutthanEvaluation {
  const reasons: string[] = [];
  const citations: TextbookCitation[] = [];

  // ตัวแปรสะสมคะแนนตรีโทษเชิงปริมาณ (Ayurvedic/TTM Dosha Quantification Model)
  // ฐานคะแนนสูงสุดต่อธาตุ = 2.0 (อายุ) + 1.5 (กาล) + 1.5 (อุตุ) + 5.0 (อาการ VAS 10/10) = 10.0 คะแนน
  let vataScore = 0;  // วาตะ / วาโยธาตุ (ลม)
  let pittaScore = 0; // ปิตตะ / เตโชธาตุ (ไฟ)
  let semhaScore = 0; // เสมหะ / อาโป-ปถวีธาตุ (น้ำ)

  // สเกลวัดระดับความปวดและความรุนแรงของอาการ (VAS 1–10)
  const rawVas = caseData.extractedSymptoms?.painScore ?? 7;
  const vasScore = Math.max(1, Math.min(10, Math.round(rawVas)));
  // Normalization: แปลง VAS (1–10) เป็นค่าน้ำหนักอาการสำคัญ (+1.0 ถึง +5.0)
  const symptomWeight = Number(Math.max(1.0, Math.min(5.0, vasScore * 0.5)).toFixed(1));

  // ============================================================================
  // 1. กลไกพยาธิสภาพของอาการสำคัญ (Symptom Weighting Matrix: +1.0 ถึง +5.0)
  // อ้างอิง: คัมภีร์ธาตุวิภังค์, คัมภีร์ธาตุบรรจบ, คัมภีร์เชวตสาร, คัมภีร์โรคนิจฉัย
  // ============================================================================
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
    symptomsText.includes('เข่า') ||
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
  let symptomTargetDosha: 'วาตะ (ลม)' | 'ปิตตะ (ไฟ)' | 'เสมหะ (น้ำ)' = 'วาตะ (ลม)';

  // ค้นหากฎอาการสำคัญ 100 ข้อจาก smutthan_rules.json ที่ตรงกับอาการของผู้ป่วย
  const normSymptoms = symptomsText.replace(/\s+/g, '');
  const scoredRules: { rule: (typeof smutthanRules)[0]; score: number }[] = [];

  for (const rule of smutthanRules) {
    if (!rule.dimension.startsWith('อาการสำคัญ')) continue;
    const cond = rule.condition;
    const tokens = cond
      .split(/[\s+,/]+/)
      .map((t) => t.replace(/\s+/g, ''))
      .filter((t) => t.length >= 2);

    let score = 0;
    for (const t of tokens) {
      if (normSymptoms.includes(t)) {
        score += t.length * 2;
      } else {
        for (let sz = t.length - 1; sz >= 3; sz--) {
          const sub1 = t.slice(0, sz);
          const sub2 = t.slice(-sz);
          if (normSymptoms.includes(sub1) || normSymptoms.includes(sub2)) {
            score += sz;
            break;
          }
        }
      }
    }

    if (score >= 6) {
      scoredRules.push({ rule, score });
    }
  }

  scoredRules.sort((a, b) => b.score - a.score);
  const topMatched = scoredRules.slice(0, 3);

  if (topMatched.length > 0) {
    const titles: string[] = [];
    const details: string[] = [];
    const citTexts: string[] = [];

    let matchedVata = 0;
    let matchedPitta = 0;
    let matchedSemha = 0;

    for (const { rule } of topMatched) {
      const outDhatu = rule.outputDhatu;
      if (outDhatu.includes('วาตะ') || outDhatu.includes('วาโย') || outDhatu.includes('ลม')) {
        matchedVata += 1;
      }
      if (
        outDhatu.includes('ปิตตะ') ||
        outDhatu.includes('เตโช') ||
        outDhatu.includes('สันตัปปัคคี') ||
        outDhatu.includes('อพัทธปิตตะ') ||
        outDhatu.includes('ไฟ')
      ) {
        matchedPitta += 1;
      }
      if (outDhatu.includes('เสมหะ') || outDhatu.includes('อาโป') || outDhatu.includes('อัฏฐิ') || outDhatu.includes('ปถวี')) {
        matchedSemha += 1;
      }

      const recText =
        (rule as any).recommendedFormula && (rule as any).recommendedFormula !== 'ปรึกษาแพทย์แผนไทย'
          ? ` (ตำรับยาที่แนะนำ: ${(rule as any).recommendedFormula})`
          : '';
      titles.push(outDhatu);
      details.push(`${rule.pathologyAndCitation}${recText}`);
      citTexts.push(`${rule.book}${rule.page ? ` (น.${rule.page})` : ''}`);
      reasons.push(
        `[อาการสำคัญ +${symptomWeight.toFixed(1)} | VAS ${vasScore}/10] ${rule.condition}: ${rule.pathologyAndCitation}${recText}`
      );
      if (!citations.some((c) => c.book === rule.book && c.page === rule.page)) {
        citations.push({
          book: rule.book,
          page: rule.page || 1,
        });
      }
    }

    if (matchedVata >= matchedPitta && matchedVata >= matchedSemha) {
      vataScore += symptomWeight;
      symptomTargetDosha = 'วาตะ (ลม)';
      if (matchedPitta > 0) pittaScore += Number((symptomWeight * 0.3).toFixed(1));
      if (matchedSemha > 0) semhaScore += Number((symptomWeight * 0.3).toFixed(1));
    } else if (matchedPitta >= matchedVata && matchedPitta >= matchedSemha) {
      pittaScore += symptomWeight;
      symptomTargetDosha = 'ปิตตะ (ไฟ)';
      if (matchedVata > 0) vataScore += Number((symptomWeight * 0.3).toFixed(1));
      if (matchedSemha > 0) semhaScore += Number((symptomWeight * 0.3).toFixed(1));
    } else {
      semhaScore += symptomWeight;
      symptomTargetDosha = 'เสมหะ (น้ำ)';
      if (matchedVata > 0) vataScore += Number((symptomWeight * 0.3).toFixed(1));
      if (matchedPitta > 0) pittaScore += Number((symptomWeight * 0.3).toFixed(1));
    }

    dhatuTitle = titles.join(' · ');
    dhatuDetail = details.join(' | ');
    dhatuCitation = `อ้างอิง: ${citTexts.join(' & ')}`;
  } else if (hasFeverHeat && hasHeadache) {
    pittaScore += symptomWeight;
    vataScore += Number((symptomWeight * 0.4).toFixed(1));
    symptomTargetDosha = 'ปิตตะ (ไฟ)';
    dhatuTitle = 'เตโชธาตุ · สันตัปปัคคี & ลมอุทธังคมาวาตา';
    dhatuDetail = 'พิษไข้ความร้อน (สันตัปปัคคี) กำเริบหนุนให้ลมพัดขึ้นเบื้องบน ทำให้ตัวร้อนและปวดตึงศีรษะ';
    reasons.push(
      `[อาการสำคัญ +${symptomWeight.toFixed(1)} | VAS ${vasScore}/10] อาการตัวร้อนมีไข้ร่วมกับปวดศีรษะ เกิดจากเตโชธาตุ (สันตัปปัคคี) กำเริบหนุนลมอุทธังคมาวาตา`
    );
    citations.push({ book: 'คัมภีร์ฉันทศาสตร์', page: 11 });
    citations.push({ book: 'คัมภีร์เชวตสาร', page: 35 });
    dhatuCitation = 'อ้างอิง: คัมภีร์ฉันทศาสตร์ (น.11) & คัมภีร์เชวตสาร (น.35)';
  } else if (hasFeverHeat) {
    pittaScore += symptomWeight;
    symptomTargetDosha = 'ปิตตะ (ไฟ)';
    dhatuTitle = 'เตโชธาตุ · สันตัปปัคคี & พัทธปิตตะ';
    dhatuDetail = 'ไฟในกายกำเริบ เกิดความร้อนรุม มีไข้ตัวร้อน หรือกระหายน้ำ';
    reasons.push(
      `[อาการสำคัญ +${symptomWeight.toFixed(1)} | VAS ${vasScore}/10] อาการตัวร้อนและไข้ สัมพันธ์กับเตโชธาตุ (สันตัปปัคคี) กำเริบหนุนด้วยปิตตะสมุฏฐาน`
    );
    citations.push({ book: 'คัมภีร์ฉันทศาสตร์', page: 11 });
    dhatuCitation = 'อ้างอิง: คัมภีร์ฉันทศาสตร์ (น.11)';
  } else if (hasCoughCold) {
    semhaScore += symptomWeight;
    symptomTargetDosha = 'เสมหะ (น้ำ)';
    dhatuTitle = 'อาโปธาตุ · ศอเสมหะ & อุระเสมหะ';
    dhatuDetail = 'เสมหะในลำคอและช่องอกกำเริบ ส่งผลให้ไอ ระคายคอ เจ็บคอ หรือมีน้ำมูก';
    reasons.push(
      `[อาการสำคัญ +${symptomWeight.toFixed(1)} | VAS ${vasScore}/10] อาการไอ เจ็บคอ หรือมีเสมหะ สัมพันธ์กับอาโปธาตุ (ศอเสมหะและอุระเสมหะ) พิการแปรปรวน`
    );
    citations.push({ book: 'คัมภีร์ธาตุวิภังค์', page: 22 });
    dhatuCitation = 'อ้างอิง: คัมภีร์ธาตุวิภังค์ (น.22)';
  } else if (hasHeadache && hasHipOrButtock) {
    vataScore += symptomWeight;
    symptomTargetDosha = 'วาตะ (ลม)';
    dhatuTitle = 'วาโยธาตุ · ลมอุทธังคมาวาตา & กะฏิทาราวาตา';
    dhatuDetail = 'มีลมพัดขึ้นเบื้องบนทำให้ปวดตึงศีรษะขมับ ร่วมกับลมแล่นทั่วกายติดขัดตามแนวก้น สะโพก และขา';
    reasons.push(
      `[อาการสำคัญ +${symptomWeight.toFixed(1)} | VAS ${vasScore}/10] อาการปวดศีรษะสัมพันธ์กับลมอุทธังคมาวาตา และอาการปวดสะโพก/ขาสัมพันธ์กับลมอังคมังคานุสารีวาตา`
    );
    citations.push({ book: 'คัมภีร์เชวตสาร', page: 35 });
    citations.push({ book: 'คัมภีร์แผนนวดไทย', page: 14 });
    dhatuCitation = 'อ้างอิง: คัมภีร์เชวตสาร (น.35) & คัมภีร์แผนนวดไทย (น.14)';
  } else if (hasHeadache) {
    vataScore += symptomWeight;
    symptomTargetDosha = 'วาตะ (ลม)';
    dhatuTitle = 'วาโยธาตุ · ลมสุมนาวาตา & อุทธังคมาวาตา';
    dhatuDetail = 'ลมกำเริบแล่นขึ้นสู่เบื้องสูงผ่านเส้นสุมนา ทำให้เลือดไปเลี้ยงศีรษะไม่สะดวก เกิดอาการวิงเวียนและปวดขมับ';
    reasons.push(
      `[อาการสำคัญ +${symptomWeight.toFixed(1)} | VAS ${vasScore}/10] อาการปวดศีรษะและมึนตึงขมับ เกิดจากลมอุทธังคมาวาตาและลมสุมนาวาตากำเริบพัดขึ้นเบื้องบน`
    );
    citations.push({ book: 'คัมภีร์เชวตสาร', page: 35 });
    dhatuCitation = 'อ้างอิง: คัมภีร์เชวตสาร (น.35)';
  } else if (hasHipOrButtock || hasNeckShoulderBack) {
    vataScore += symptomWeight;
    symptomTargetDosha = 'วาตะ (ลม)';
    if (hasBloating) {
      dhatuTitle = 'วาโยธาตุ · กุจฉิสยาวาตะ & อังคมังคานุสารีวาตา';
      dhatuDetail = 'ท้องอืด แน่นเฟ้อ ร่วมกับปวดเมื่อยคอบ่าไหล่ ลมอั้นในกระเพาะอาหารและลมพัดซ่านทั่วร่างกายทำให้กล้ามเนื้อตึงตัว';
      reasons.push(
        `[อาการสำคัญ +${symptomWeight.toFixed(1)} | VAS ${vasScore}/10] อาการท้องอืด แน่นเฟ้อ และปวดตึงกล้ามเนื้อ สัมพันธ์กับลมกุจฉิสยาวาตะและอังคมังคานุสารีวาตะ`
      );
      citations.push({ book: 'คัมภีร์โรคนิจฉัย', page: 19 });
      dhatuCitation = 'อ้างอิง: คัมภีร์โรคนิจฉัย (น.19)';
    } else {
      dhatuTitle = 'วาโยธาตุ · ลมอังคมังคานุสารีวาตา (ลมแล่นในเส้น)';
      dhatuDetail = 'ลมแล่นตามสรรพางค์กายติดขัดตามแนวขา สะโพก เส้นเอ็น และกล้ามเนื้อ';
      reasons.push(
        `[อาการสำคัญ +${symptomWeight.toFixed(1)} | VAS ${vasScore}/10] อาการปวดกล้ามเนื้อ ขา และเส้นเอ็น สัมพันธ์กับลมอังคมังคานุสารีวาตาคั่งค้างในแนวเส้นเอ็น`
      );
      citations.push({ book: 'คัมภีร์แผนนวดไทย', page: 14 });
      dhatuCitation = 'อ้างอิง: คัมภีร์แผนนวดไทย (น.14)';
    }
  } else if (hasBloating) {
    vataScore += symptomWeight;
    symptomTargetDosha = 'วาตะ (ลม)';
    dhatuTitle = 'วาโยธาตุ · กุจฉิสยาวาตา';
    dhatuDetail = 'อาการท้องอืด แน่นเฟ้อ ลมอั้นในกระเพาะอาหารและลำไส้';
    reasons.push(
      `[อาการสำคัญ +${symptomWeight.toFixed(1)} | VAS ${vasScore}/10] อาการท้องอืด แน่นเฟ้อ สัมพันธ์กับลมกุจฉิสยาวาตะ`
    );
    citations.push({ book: 'คัมภีร์ธาตุบรรจบ', page: 12 });
    dhatuCitation = 'อ้างอิง: คัมภีร์ธาตุบรรจบ (น.12)';
  } else {
    vataScore += symptomWeight;
    symptomTargetDosha = 'วาตะ (ลม)';
    reasons.push(
      `[อาการสำคัญ +${symptomWeight.toFixed(1)} | VAS ${vasScore}/10] อาการระบบกล้ามเนื้อและเส้นเอ็นสัมพันธ์กับวาโยธาตุ`
    );
    citations.push({ book: 'คัมภีร์แผนนวดไทย', page: 14 });
    dhatuCitation = 'อ้างอิง: คัมภีร์แผนนวดไทย (น.14)';
  }

  // ============================================================================
  // 2. อายุสมุฏฐาน (Primary Factor: +2.0 — คิดเป็น ~40% ของปัจจัยฐาน)
  // อ้างอิง: คัมภีร์เวชศึกษา (พระยาพิษณุประสาทเวช) หน้า 18, 24, 34
  // ============================================================================
  const age = caseData.age || 58;
  let ayuTitle = 'ปัจฉิมวัย (32 ปีขึ้นไป)';
  let ayuDetail = `อายุ ${age} ปี · ธาตุเจ้าเรือนหลัก: วาตะเจ้าเรือน (+2.0 คะแนน)`;
  let ayuElement: 'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ' = 'ลม';
  let ayuTargetDosha: 'วาตะ (ลม)' | 'ปิตตะ (ไฟ)' | 'เสมหะ (น้ำ)' = 'วาตะ (ลม)';
  let ayuCitation = 'อ้างอิง: คัมภีร์เวชศึกษา (น.34)';

  if (age >= 32) {
    vataScore += 2.0;
    ayuElement = 'ลม';
    ayuTargetDosha = 'วาตะ (ลม)';
    reasons.push(
      `[อายุสมุฏฐาน +2.0] อายุ ${age} ปี (ปัจฉิมวัย > 32 ปี): วาตะเจ้าเรือนเป็นปัจจัยระดับประธานควบคุมโครงสร้างร่างกายระยะยาว (คัมภีร์เวชศึกษา น.34)`
    );
    citations.push({ book: 'คัมภีร์เวชศึกษา', page: 34 });
  } else if (age > 16) {
    pittaScore += 2.0;
    ayuElement = 'ไฟ';
    ayuTargetDosha = 'ปิตตะ (ไฟ)';
    ayuTitle = 'มัชฌิมวัย (16–32 ปี)';
    ayuDetail = `อายุ ${age} ปี · ธาตุเจ้าเรือนหลัก: ปิตตะเจ้าเรือน (+2.0 คะแนน)`;
    ayuCitation = 'อ้างอิง: คัมภีร์เวชศึกษา (น.24)';
    reasons.push(
      `[อายุสมุฏฐาน +2.0] อายุ ${age} ปี (มัชฌิมวัย 16–32 ปี): ปิตตะเจ้าเรือนเป็นปัจจัยระดับประธานตามวัย (คัมภีร์เวชศึกษา น.24)`
    );
    citations.push({ book: 'คัมภีร์เวชศึกษา', page: 24 });
  } else {
    semhaScore += 2.0;
    ayuElement = 'น้ำ';
    ayuTargetDosha = 'เสมหะ (น้ำ)';
    ayuTitle = 'ปฐมวัย (0–16 ปี)';
    ayuDetail = `อายุ ${age} ปี · ธาตุเจ้าเรือนหลัก: เสมหะเจ้าเรือน (+2.0 คะแนน)`;
    ayuCitation = 'อ้างอิง: คัมภีร์เวชศึกษา (น.18)';
    reasons.push(
      `[อายุสมุฏฐาน +2.0] อายุ ${age} ปี (ปฐมวัย 0–16 ปี): เสมหะเจ้าเรือนเป็นปัจจัยระดับประธานตามวัยเด็ก (คัมภีร์เวชศึกษา น.18)`
    );
    citations.push({ book: 'คัมภีร์เวชศึกษา', page: 18 });
  }

  // ============================================================================
  // 3. กาลสมุฏฐาน (Secondary Factor: +1.5 — คิดเป็น ~30% ของปัจจัยฐาน)
  // อ้างอิง: คัมภีร์สมุฏฐานวินิจฉัย หน้า 30, 45, 52
  // ============================================================================
  const visitTime = caseData.visitTime || '10:30';
  const hour = parseInt(visitTime.split(':')[0] || '10', 10);
  let kalaTitle = `${visitTime} น. (ยาม 2: 10.00–14.00 น.)`;
  let kalaDetail = 'ปัจจัยกระตุ้นตามนาฬิกาชีวภาพ: ปิตตะสมุฏฐาน (+1.5 คะแนน)';
  let kalaElement: 'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ' = 'ไฟ';
  let kalaTargetDosha: 'วาตะ (ลม)' | 'ปิตตะ (ไฟ)' | 'เสมหะ (น้ำ)' = 'ปิตตะ (ไฟ)';
  let kalaCitation = 'อ้างอิง: คัมภีร์สมุฏฐานวินิจฉัย (น.45)';

  if ((hour >= 14 && hour < 18) || (hour >= 2 && hour < 6)) {
    vataScore += 1.5;
    kalaElement = 'ลม';
    kalaTargetDosha = 'วาตะ (ลม)';
    kalaTitle = `${visitTime} น. (ยาม 3: 14.00–18.00 / 02.00–06.00 น.)`;
    kalaDetail = 'ปัจจัยกระตุ้นตามนาฬิกาชีวภาพ: วาตะสมุฏฐาน (+1.5 คะแนน · ลมเคลื่อนไหวมาก)';
    kalaCitation = 'อ้างอิง: คัมภีร์สมุฏฐานวินิจฉัย (น.52)';
    reasons.push(
      `[กาลสมุฏฐาน +1.5] เวลา ${visitTime} น. (ยาม 3): ช่วงเวลาวาตะกำเริบ (+1.5) ตามนาฬิกาชีวภาพ (คัมภีร์สมุฏฐานวินิจฉัย น.52)`
    );
    citations.push({ book: 'คัมภีร์สมุฏฐานวินิจฉัย', page: 52 });
  } else if ((hour >= 10 && hour < 14) || hour >= 22 || hour < 2) {
    pittaScore += 1.5;
    kalaElement = 'ไฟ';
    kalaTargetDosha = 'ปิตตะ (ไฟ)';
    kalaTitle = `${visitTime} น. (ยาม 2: 10.00–14.00 / 22.00–02.00 น.)`;
    kalaDetail = 'ปัจจัยกระตุ้นตามนาฬิกาชีวภาพ: ปิตตะสมุฏฐาน (+1.5 คะแนน · ไฟย่อยและไฟความร้อนทำงานสูงสุด)';
    kalaCitation = 'อ้างอิง: คัมภีร์สมุฏฐานวินิจฉัย (น.45)';
    reasons.push(
      `[กาลสมุฏฐาน +1.5] เวลา ${visitTime} น. (ยาม 2): ช่วงเวลาปิตตะกำเริบ (+1.5) ตามนาฬิกาชีวภาพ (คัมภีร์สมุฏฐานวินิจฉัย น.45)`
    );
    citations.push({ book: 'คัมภีร์สมุฏฐานวินิจฉัย', page: 45 });
  } else {
    semhaScore += 1.5;
    kalaElement = 'น้ำ';
    kalaTargetDosha = 'เสมหะ (น้ำ)';
    kalaTitle = `${visitTime} น. (ยาม 1: 06.00–10.00 / 18.00–22.00 น.)`;
    kalaDetail = 'ปัจจัยกระตุ้นตามนาฬิกาชีวภาพ: เสมหะสมุฏฐาน (+1.5 คะแนน · กระตุ้นธาตุน้ำและเสมหะ)';
    kalaCitation = 'อ้างอิง: คัมภีร์สมุฏฐานวินิจฉัย (น.30)';
    reasons.push(
      `[กาลสมุฏฐาน +1.5] เวลา ${visitTime} น. (ยาม 1): ช่วงเวลาเสมหะกำเริบ (+1.5) ตามนาฬิกาชีวภาพ (คัมภีร์สมุฏฐานวินิจฉัย น.30)`
    );
    citations.push({ book: 'คัมภีร์สมุฏฐานวินิจฉัย', page: 30 });
  }

  // ============================================================================
  // 4. อุตุสมุฏฐานเชิงพลวัต (Dynamic Weather-Utu Matrix: +1.5 คะแนน)
  // ผสานข้อมูลฤดูกาลตามปฏิทิน ร่วมกับสภาพอากาศจริงจาก Weather API (อุณหภูมิ + ความชื้น + ฝน)
  // เพื่อป้องกันความผิดพลาดกรณี "อุตุแปรปรวน" เช่น ฤดูฝนแต่แดดออกจัดและความชื้นต่ำ
  // อ้างอิง: คัมภีร์เวชกรรมไทย 1 (สภาการแพทย์แผนไทย) หน้า 40, 58, 66
  // ============================================================================
  const tempC = caseData.weather?.tempC ?? 29;
  const humidityPct = caseData.weather?.humidityPct ?? 78;
  const conditionLabel = caseData.weather?.conditionLabel || '';
  const seasonCalendarName =
    caseData.season === 'rainy'
      ? 'วสันตฤดู (ฤดูฝน)'
      : caseData.season === 'summer'
      ? 'คิมหันตฤดู (ฤดูร้อน)'
      : 'เหมันตฤดู (ฤดูหนาว)';

  let utuTitle = `${seasonCalendarName} · ${tempC}°C ชื้น ${humidityPct}%`;
  let utuDetail = 'ปัจจัยกระตุ้นจากอุณหภูมิและความชื้นภายนอก (+1.5 คะแนน)';
  let utuElement: 'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ' = 'ลม';
  let utuTargetDosha: 'วาตะ (ลม)' | 'ปิตตะ (ไฟ)' | 'เสมหะ (น้ำ)' | 'ปิตตะ + วาตะ (พหุอุตุ)' = 'วาตะ (ลม)';
  let utuCitation = 'อ้างอิง: คัมภีร์เวชกรรมไทย 1 (น.58)';
  let utuWeightText = '+1.5';
  let utuRationale = `ประเมินจากสภาพอากาศจริง ณ จุดตรวจ (${tempC}°C, ความชื้น ${humidityPct}%) ร่วมกับฤดูกาล`;
  let utuAnomalyDetected = false;

  // กรณีที่ 1: แดดออกจัด / ร้อนแล้ง (อุณหภูมิ >= 33°C และความชื้น < 65%)
  // เช่น อยู่ในฤดูฝน (วสันตฤดู) แต่วันนั้นแดดจัดและไม่ชื้น -> ต้องคิดเป็น ปิตตะสมุฏฐาน (+1.5)!
  if (tempC >= 33 && humidityPct < 65) {
    pittaScore += 1.5;
    utuElement = 'ไฟ';
    utuTargetDosha = 'ปิตตะ (ไฟ)';
    utuCitation = 'อ้างอิง: คัมภีร์เวชกรรมไทย 1 (น.40)';

    if (caseData.season !== 'summer') {
      utuAnomalyDetected = true;
      utuTitle = `${seasonCalendarName} · แต่อากาศจริงแดดจัดร้อนแล้ง (${tempC}°C, ชื้น ${humidityPct}%)`;
      utuDetail = `อุตุแปรปรวน (ร้อนแทรกใน${seasonCalendarName}): แสงแดดจัดและความชื้นต่ำกระตุ้นปิตตะสมุฏฐาน (+1.5 คะแนน) แทนธาตุประจำฤดู`;
      utuRationale = `ตรวจพบอุตุแปรปรวนจาก Weather API (${tempC}°C, ชื้น ${humidityPct}%): แม้อยู่ใน${seasonCalendarName}แต่แดดออกจัด ไม่มีความชื้นสูง จึงส่งผลกระตุ้นธาตุไฟโดยตรง`;
      reasons.push(
        `[อุตุสมุฏฐาน +1.5 | อุตุแปรปรวน] ปฏิทินเป็น${seasonCalendarName} แต่สภาพอากาศจริงแดดจัดร้อนแล้ง (${tempC}°C, ชื้น ${humidityPct}%) จึงกระตุ้นปิตตะสมุฏฐาน (+1.5) แทนวาตะ (คัมภีร์เวชกรรมไทย 1 น.40)`
      );
    } else {
      utuTitle = `${seasonCalendarName} · แดดจัดร้อนอบอ้าว (${tempC}°C, ชื้น ${humidityPct}%)`;
      utuDetail = 'ความร้อนและแสงแดดภายนอกกระตุ้นปิตตะสมุฏฐาน (+1.5 คะแนน · สันตัปปัคคี)';
      reasons.push(
        `[อุตุสมุฏฐาน +1.5] คิมหันตฤดูและอากาศร้อนจัด (${tempC}°C, ชื้น ${humidityPct}%) กระตุ้นให้ปิตตะสมุฏฐานกำเริบ (+1.5) (คัมภีร์เวชกรรมไทย 1 น.40)`
      );
    }
    citations.push({ book: 'คัมภีร์เวชกรรมไทย เล่ม 1', page: 40 });
  }
  // กรณีที่ 2: ร้อนชื้นอบอ้าว (พหุอุตุ: อุณหภูมิ >= 32°C และความชื้น >= 65%)
  // ทั้งไอร้อนและความชื้นสูงทำงานร่วมกัน -> แบ่งน้ำหนัก ปิตตะ +0.8 และ วาตะ +0.7 (รวม +1.5)
  else if (tempC >= 32 && humidityPct >= 65) {
    pittaScore += 0.8;
    vataScore += 0.7;
    utuElement = vataScore >= pittaScore ? 'ลม' : 'ไฟ';
    utuTargetDosha = 'ปิตตะ + วาตะ (พหุอุตุ)';
    utuWeightText = '+0.8 ปิตตะ / +0.7 วาตะ';
    utuAnomalyDetected = true;
    utuTitle = `${seasonCalendarName} · อากาศร้อนชื้นอบอ้าว (${tempC}°C, ชื้น ${humidityPct}%)`;
    utuDetail = 'พหุอุตุ (ความร้อนสูงผสมความชื้นอับ): กระตุ้นทั้งปิตตะสมุฏฐาน (+0.8) และวาตะสมุฏฐาน (+0.7)';
    utuCitation = 'อ้างอิง: คัมภีร์เวชกรรมไทย 1 (น.40 & น.58)';
    utuRationale = `สภาพอากาศจริงทั้งร้อน (${tempC}°C) และชื้นสูง (${humidityPct}%) จึงกระจายค่าน้ำหนัก +1.5 เข้าสู่ปิตตะ (+0.8) และวาตะ (+0.7)`;
    reasons.push(
      `[อุตุสมุฏฐาน +1.5 | พหุอุตุ] สภาพอากาศจริงร้อนชื้นอบอ้าว (${tempC}°C, ชื้น ${humidityPct}%) กระตุ้นทั้งปิตตะสมุฏฐาน (+0.8) และวาตะสมุฏฐาน (+0.7) (คัมภีร์เวชกรรมไทย 1 น.40, 58)`
    );
    citations.push({ book: 'คัมภีร์เวชกรรมไทย เล่ม 1', page: 40 });
    citations.push({ book: 'คัมภีร์เวชกรรมไทย เล่ม 1', page: 58 });
  }
  // กรณีที่ 3: อากาศเย็น / หนาว (< 25°C)
  else if (tempC < 25) {
    semhaScore += 1.5;
    utuElement = 'น้ำ';
    utuTargetDosha = 'เสมหะ (น้ำ)';
    utuCitation = 'อ้างอิง: คัมภีร์เวชกรรมไทย 1 (น.66)';
    if (caseData.season !== 'winter') {
      utuAnomalyDetected = true;
    }
    utuTitle = `${seasonCalendarName} · อากาศเย็น (${tempC}°C, ชื้น ${humidityPct}%)`;
    utuDetail = 'ความเย็นภายนอกกระตุ้นเสมหะสมุฏฐาน (+1.5 คะแนน · ธาตุน้ำและเสมหะกำเริบ)';
    reasons.push(
      `[อุตุสมุฏฐาน +1.5] อุณหภูมิอากาศเย็น (${tempC}°C, ชื้น ${humidityPct}%) กระตุ้นให้เสมหะสมุฏฐานกำเริบ (+1.5) (คัมภีร์เวชกรรมไทย 1 น.66)`
    );
    citations.push({ book: 'คัมภีร์เวชกรรมไทย เล่ม 1', page: 66 });
  }
  // กรณีที่ 4: ความชื้นสูง / มีฝนตก / วสันตอุตุปกติ
  else {
    vataScore += 1.5;
    utuElement = 'ลม';
    utuTargetDosha = 'วาตะ (ลม)';
    utuCitation = 'อ้างอิง: คัมภีร์เวชกรรมไทย 1 (น.58)';
    utuTitle = `${seasonCalendarName} · อากาศชื้น/ไอฝน (${tempC}°C, ชื้น ${humidityPct}%)`;
    utuDetail = `สภาพอากาศชื้นสัมพัทธ์สูง (${humidityPct}%) กระตุ้นวาตะสมุฏฐาน (+1.5 คะแนน · ลมกำเริบ)`;
    reasons.push(
      `[อุตุสมุฏฐาน +1.5] ${seasonCalendarName} สภาพอากาศชื้น (${tempC}°C, ชื้น ${humidityPct}%) กระตุ้นให้วาตะสมุฏฐานกำเริบ (+1.5) (คัมภีร์เวชกรรมไทย 1 น.58)`
    );
    citations.push({ book: 'คัมภีร์เวชกรรมไทย เล่ม 1', page: 58 });
  }

  // ปัดเศษทศนิยม 1 ตำแหน่งเพื่อความแม่นยำ
  vataScore = Number(vataScore.toFixed(1));
  pittaScore = Number(pittaScore.toFixed(1));
  semhaScore = Number(semhaScore.toFixed(1));
  const totalAccumulated = Number((vataScore + pittaScore + semhaScore).toFixed(1)) || 1;

  // คำนวณสัดส่วนร้อยละของตรีโทษ (Dosha Quantification Percentage)
  const vataPct = Math.round((vataScore / totalAccumulated) * 100);
  const pittaPct = Math.round((pittaScore / totalAccumulated) * 100);
  const semhaPct = Math.max(0, 100 - vataPct - pittaPct);

  // ค้นหาธาตุหลักที่ได้คะแนนสูงสุด
  let primaryElement: 'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ' = 'ลม';
  let maxDoshaScore = vataScore;
  let confidence = vataPct;

  if (pittaScore > maxDoshaScore) {
    primaryElement = 'ไฟ';
    maxDoshaScore = pittaScore;
    confidence = pittaPct;
  }
  if (semhaScore > maxDoshaScore) {
    primaryElement = 'น้ำ';
    maxDoshaScore = semhaScore;
    confidence = semhaPct;
  }

  const dhatuMatch =
    (primaryElement === 'ลม' && symptomTargetDosha === 'วาตะ (ลม)') ||
    (primaryElement === 'ไฟ' && symptomTargetDosha === 'ปิตตะ (ไฟ)') ||
    (primaryElement === 'น้ำ' && symptomTargetDosha === 'เสมหะ (น้ำ)');
  const utuMatch =
    utuElement === primaryElement ||
    (utuTargetDosha === 'ปิตตะ + วาตะ (พหุอุตุ)' && (primaryElement === 'ลม' || primaryElement === 'ไฟ'));
  const ayuMatch = ayuElement === primaryElement;
  const kalaMatch = kalaElement === primaryElement;

  const matchedCount = [dhatuMatch, utuMatch, ayuMatch, kalaMatch].filter(Boolean).length;

  const concordanceLevel = `${maxDoshaScore.toFixed(1)} / 10.0 คะแนน (${confidence}%)`;
  const concordanceDescription = `ประเมินด้วยโมเดลคณิตศาสตร์ถ่วงน้ำหนัก (AHP & Delphi): อายุ (+2.0) + กาล (+1.5) + อุตุจากสภาพอากาศจริง ${tempC}°C/ชื้น ${humidityPct}% (+1.5) + อาการสำคัญ VAS ${vasScore}/10 (+${symptomWeight.toFixed(1)}) สอดคล้องกัน ${matchedCount}/4 มิติ`;

  const cards: SmutthanDimensionCard[] = [
    {
      dimension: 'อาการสำคัญ (ธาตุสมุฏฐาน)',
      badge: dhatuMatch ? 'ตรงกับธาตุหลัก' : 'ปัจจัยร่วม',
      weightBadge: `+${symptomWeight.toFixed(1)} (VAS ${vasScore}/10)`,
      weightValue: symptomWeight,
      targetDosha: symptomTargetDosha,
      isMatch: dhatuMatch,
      title: dhatuTitle,
      detail: dhatuDetail,
      citationText: dhatuCitation,
      healthScienceRationale: `ปรับตามระดับความรุนแรงจริงที่ผู้ป่วยเป็น (VAS Scale ${vasScore}/10 → น้ำหนัก +${symptomWeight.toFixed(1)} จากฐาน +1.0 ถึง +5.0)`,
    },
    {
      dimension: 'อายุสมุฏฐาน (Primary Factor)',
      badge: ayuMatch ? 'ตรงกับธาตุหลัก' : 'ปัจจัยร่วม',
      weightBadge: '+2.0 (น้ำหนัก ~40%)',
      weightValue: 2.0,
      targetDosha: ayuTargetDosha,
      isMatch: ayuMatch,
      title: ayuTitle,
      detail: ayuDetail,
      citationText: ayuCitation,
      healthScienceRationale: 'เป็นฐานธาตุเจ้าเรือนหลักตามพันธุกรรมและช่วงวัยที่ควบคุมโครงสร้างร่างกายระยะยาว',
    },
    {
      dimension: 'กาลสมุฏฐาน (Secondary Factor)',
      badge: kalaMatch ? 'ตรงกับธาตุหลัก' : 'ปัจจัยร่วม',
      weightBadge: '+1.5 (น้ำหนัก ~30%)',
      weightValue: 1.5,
      targetDosha: kalaTargetDosha,
      isMatch: kalaMatch,
      title: kalaTitle,
      detail: kalaDetail,
      citationText: kalaCitation,
      healthScienceRationale: 'เป็นปัจจัยกระตุ้นชั่วคราวตามนาฬิกาชีวภาพในรอบวัน (Circadian Rhythm ช่วงละ 4 ชม.)',
    },
    {
      dimension: 'อุตุสมุฏฐาน (Live Weather API)',
      badge: utuAnomalyDetected ? 'อุตุแปรปรวน' : utuMatch ? 'ตรงกับธาตุหลัก' : 'ปัจจัยร่วม',
      weightBadge: `${utuWeightText} (อากาศจริง)`,
      weightValue: 1.5,
      targetDosha: utuTargetDosha,
      isMatch: utuMatch,
      title: utuTitle,
      detail: utuDetail,
      citationText: utuCitation,
      healthScienceRationale: utuRationale,
    },
  ];

  const scoringSummaryTable: ScoringRuleSummaryRow[] = [
    {
      factor: 'อายุสมุฏฐาน',
      scriptureRef: 'คัมภีร์เวชศึกษา (ปฐม/มัชฌิม/ปัจฉิมวัย) น.18, 24, 34',
      targetDosha: ayuTargetDosha,
      weight: '+2.0',
      rationale: 'เป็นฐานธาตุเจ้าเรือนหลักตามพันธุกรรมและวัย (Primary Factor ~40%)',
    },
    {
      factor: 'กาลสมุฏฐาน',
      scriptureRef: 'คัมภีร์สมุฏฐานวินิจฉัย (ยาม 1, 2, 3) น.30, 45, 52',
      targetDosha: kalaTargetDosha,
      weight: '+1.5',
      rationale: 'เป็นปัจจัยกระตุ้นตามนาฬิกาชีวภาพ (Circadian Rhythm ~30%)',
    },
    {
      factor: 'อุตุสมุฏฐาน (Weather API)',
      scriptureRef: 'คัมภีร์เวชกรรมไทย 1 (คิมหันต/วสันต/เหมันต) น.40, 58, 66',
      targetDosha: utuTargetDosha,
      weight: utuWeightText,
      rationale: utuRationale,
    },
    {
      factor: 'อาการสำคัญ',
      scriptureRef: 'คัมภีร์ธาตุวิภังค์ / ธาตุบรรจบ / โรคนิจฉัย / เชวตสาร',
      targetDosha: symptomTargetDosha,
      weight: `+${symptomWeight.toFixed(1)} (จากเกณฑ์ +1.0 ถึง +5.0)`,
      rationale: `ปรับตามระดับความรุนแรงจริงที่ผู้ป่วยเป็น (VAS Scale ${vasScore}/10)`,
    },
  ];

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
    vasScore,
    symptomWeight,
    utuAnomalyDetected,
    utuWeatherSummary: `${tempC}°C · ความชื้น ${humidityPct}%${conditionLabel ? ` (${conditionLabel})` : ''}`,
    doshaScores: {
      vata: vataScore,
      pitta: pittaScore,
      semha: semhaScore,
      maxPossible: 10.0,
      totalAccumulated,
    },
    doshaPercentages: {
      vata: vataPct,
      pitta: pittaPct,
      semha: semhaPct,
    },
    scoringSummaryTable,
    reasons,
    citations,
    cards,
  };
}
