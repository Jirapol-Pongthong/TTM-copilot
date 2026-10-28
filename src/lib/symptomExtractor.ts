// src/lib/symptomExtractor.ts
import smutthanRules from '@/data/smutthan_rules.json';

export interface ExtractedSymptomPayload {
  chiefComplaint: string[];
  duration: string;
  affectedDhatu: string[];
  bowelMovement: string;
  painScore: number; // สเกลวัดระดับความปวด/ความรุนแรง VAS (1–10)
  source?: string;
}

export function extractThaiSymptomsDeterministic(textPrompt: string): ExtractedSymptomPayload {
  const raw = (textPrompt || '').trim();
  const lower = raw.toLowerCase();
  const normText = lower.replace(/\s+/g, '');

  const symptoms: string[] = [];
  const dhatus = new Set<string>();

  // 1. สกัดระยะเวลาที่เป็น (Duration)
  let duration = 'ไม่ระบุระยะเวลา';
  const durationMatch = raw.match(/(\d+)\s*(วัน|สัปดาห์|อาทิตย์|เดือน|ปี|ชั่วโมง)/);
  if (durationMatch) {
    duration = `${durationMatch[1]} ${durationMatch[2]}`;
  } else if (/หลาย\s*วัน/.test(raw) || normText.includes('หลายวัน')) {
    duration = 'หลายวัน';
  } else if (/หลาย\s*สัปดาห์/.test(raw) || /หลาย\s*อาทิตย์/.test(raw) || normText.includes('หลายสัปดาห์') || normText.includes('หลายอาทิตย์')) {
    duration = 'หลายสัปดาห์';
  } else if (/หลาย\s*เดือน/.test(raw) || normText.includes('หลายเดือน')) {
    duration = 'หลายเดือน';
  } else if (normText.includes('เรื้อรัง')) {
    duration = 'เรื้อรัง';
  } else if (normText.includes('เมื่อวาน')) {
    duration = '1 วัน';
  } else if (normText.includes('วันนี้')) {
    duration = '1 วัน';
  }

  // 2. สกัดระดับความปวด/ความรุนแรง VAS (1–10)
  let painScore = 6; // ค่าเริ่มต้นระดับปานกลาง (VAS 6/10 -> Weight +3.0)
  const explicitScoreMatch =
    raw.match(/(?:ระดับความปวด|ความปวด|ระดับ|คะแนน|สเกล|vas|pain)\s*(?:อยู่ที่|ประมาณ|เท่ากับ|:)?\s*(\d{1,2})/i) ||
    raw.match(/(\d{1,2})\s*(?:\/\s*10|เต็ม\s*10|คะแนน)/);

  if (explicitScoreMatch) {
    const parsed = parseInt(explicitScoreMatch[1], 10);
    if (parsed >= 1 && parsed <= 10) {
      painScore = parsed;
    }
  } else if (
    normText.includes('ปวดมาก') ||
    normText.includes('ปวดรุนแรง') ||
    normText.includes('ทรมาน') ||
    normText.includes('แทบทนไม่ไหว') ||
    normText.includes('เดินไม่ได้') ||
    normText.includes('ลุกยืนลำบาก')
  ) {
    painScore = 8; // รุนแรง (VAS 8/10 -> Weight +4.0)
  } else if (
    normText.includes('ปวดตึง') ||
    normText.includes('ร้าวลง') ||
    normText.includes('แน่นเฟ้อ') ||
    normText.includes('เรื้อรัง')
  ) {
    painScore = 7; // ค่อนข้างมาก (VAS 7/10 -> Weight +3.5)
  } else if (normText.includes('เล็กน้อย') || normText.includes('พอรำคาญ') || normText.includes('นิดหน่อย')) {
    painScore = 3; // เล็กน้อย (VAS 3/10 -> Weight +1.5)
  }

  // 3. ตรวจสอบการขับถ่าย
  let bowelMovement = 'ปกติ';
  if (normText.includes('ท้องผูก') || normText.includes('ถ่ายไม่สะดวก') || normText.includes('ถ่ายยาก') || normText.includes('อุจจาระแข็ง')) {
    bowelMovement = 'ขับถ่ายไม่สะดวก (ท้องผูก)';
  } else if (normText.includes('ท้องเสีย') || normText.includes('ถ่ายเหลว') || normText.includes('มูกเลือด') || normText.includes('ถ่ายบ่อย')) {
    bowelMovement = 'ถ่ายเหลว / มวนท้อง';
  }

  // 4. ค้นหากฎอาการสำคัญ 100 ข้อจาก smutthan_rules.json แบบ Fuzzy Substring Scoring
  let bestRule: any = null;
  let bestScore = 0;

  for (const rule of smutthanRules) {
    if (!rule.dimension.startsWith('อาการสำคัญ')) continue;
    const cond = rule.condition;
    const tokens = cond
      .split(/[\s+,/]+/)
      .map((t) => t.replace(/\s+/g, ''))
      .filter((t) => t.length >= 2);

    let score = 0;
    for (const t of tokens) {
      if (normText.includes(t)) {
        score += t.length * 2;
      } else {
        for (let sz = t.length - 1; sz >= 3; sz--) {
          const sub1 = t.slice(0, sz);
          const sub2 = t.slice(-sz);
          if (normText.includes(sub1) || normText.includes(sub2)) {
            score += sz;
            break;
          }
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestRule = rule;
    }
  }

  // หากเจอกฎอาการสำคัญที่ตรงกับคลัง 100 อาการ (คะแนนความสอดคล้อง >= 6)
  if (bestRule && bestScore >= 6) {
    symptoms.push(bestRule.condition);
    const outDhatu = bestRule.outputDhatu;
    if (outDhatu.includes('วาตะ') || outDhatu.includes('วาโย')) {
      dhatus.add(`วาโยธาตุ (${outDhatu})`);
    } else if (outDhatu.includes('ปิตตะ') || outDhatu.includes('เตโช') || outDhatu.includes('สันตัปปัคคี') || outDhatu.includes('อพัทธปิตตะ')) {
      dhatus.add(`เตโชธาตุ (${outDhatu})`);
    } else if (outDhatu.includes('เสมหะ') || outDhatu.includes('อาโป')) {
      dhatus.add(`อาโปธาตุ (${outDhatu})`);
    } else if (outDhatu.includes('อัฏฐิ') || outDhatu.includes('ปถวี')) {
      dhatus.add(`ปถวีธาตุ (${outDhatu})`);
    } else {
      dhatus.add(outDhatu);
    }
  } else {
    // 5. กรณีทั่วไป (Fallback Heuristics ถ้าไม่ตรงกับ 100 ข้อเฉพาะเจาะจง)
    if (lower.includes('ตัวร้อน') || lower.includes('มีไข้') || lower.includes('เป็นไข้') || lower.includes('ไข้ขึ้น')) {
      symptoms.push('ตัวร้อน มีไข้');
      dhatus.add('เตโชธาตุ (สันตัปปัคคี)');
    }
    if (lower.includes('ร้อนใน') || lower.includes('กระหายน้ำ') || lower.includes('คอแห้ง')) {
      symptoms.push('ร้อนใน กระหายน้ำ');
      dhatus.add('เตโชธาตุ (ปริทัยหัคคี)');
    }
    if (lower.includes('ปวดหัว') || lower.includes('ปวดศีรษะ') || lower.includes('ปวดขมับ') || /ปวด\s*หัว/.test(lower)) {
      symptoms.push('ปวดศีรษะ');
      dhatus.add('วาโยธาตุ (อุทธังคมาวาตา)');
    }
    if (lower.includes('เวียนหัว') || lower.includes('เวียนศีรษะ') || lower.includes('มึนหัว') || lower.includes('หน้ามืด')) {
      symptoms.push('มึนงง เวียนศีรษะ');
      dhatus.add('วาโยธาตุ (อุทธังคมาวาตา)');
    }
    if (lower.includes('เจ็บคอ') || lower.includes('ระคายคอ')) {
      symptoms.push('เจ็บคอ ระคายคอ');
      dhatus.add('อาโปธาตุ (ศอเสมหะ)');
    }
    if (lower.includes('ไอ') || lower.includes('เสมหะ') || lower.includes('น้ำมูก') || lower.includes('เป็นหวัด')) {
      symptoms.push('ไอ มีเสมหะ');
      dhatus.add('อาโปธาตุ (ศอเสมหะ & อุระเสมหะ)');
    }
    if (lower.includes('ปวดท้อง') || lower.includes('ปวดมวนท้อง') || /ปวด\s*ท้อง/.test(lower)) {
      symptoms.push('ปวดท้อง (ลมกุจฉิสยาวาตา)');
      dhatus.add('วาโยธาตุ (กุจฉิสยาวาตา)');
    }
    if (lower.includes('ท้องอืด') || lower.includes('แน่นท้อง') || lower.includes('แน่นเฟ้อ') || lower.includes('จุกเสียด') || /แน่น\s*ท้อง/.test(lower)) {
      symptoms.push('ท้องอืด แน่นท้อง');
      dhatus.add('วาโยธาตุ (กุจฉิสยาวาตา)');
    }
    if (lower.includes('เรอเปรี้ยว') || lower.includes('กรดไหลย้อน') || lower.includes('แสบร้อนกลางอก') || lower.includes('ลมดัน')) {
      symptoms.push('เรอเปรี้ยว มีลมดันขึ้น');
      dhatus.add('วาโยธาตุ (อุทธังคมาวาตา)');
      dhatus.add('เตโชธาตุ (ปริณามัคคี)');
    }
    if (lower.includes('คอบ่า') || lower.includes('สะบัก') || lower.includes('ปวดหลัง') || lower.includes('ปวดตึง') || lower.includes('ปวดเมื่อย')) {
      symptoms.push('ปวดตึงกล้ามเนื้อคอบ่าหลัง');
      dhatus.add('วาโยธาตุ (อังคมังคานุสารีวาตา)');
    }
    if (lower.includes('ปวดก้น') || lower.includes('สะโพก') || lower.includes('สลักเพชร') || lower.includes('ร้าวลงขา') || lower.includes('เอว') || lower.includes('ปวดขา')) {
      symptoms.push('ปวดสะโพกและขา (ลมแล่นในเส้น)');
      dhatus.add('วาโยธาตุ (อังคมังคานุสารีวาตา)');
    }
    if (lower.includes('ปวดเข่า') || lower.includes('ข้อเข่า') || lower.includes('เข่าเสื่อม')) {
      symptoms.push('ปวดขัดข้อเข่า (ลมจับโปง)');
      dhatus.add('วาโยธาตุ (อังคมังคานุสารีวาตา)');
      dhatus.add('ปถวีธาตุ (อัฏฐิ/อัฏฐิมิญชัง)');
    }
  }

  // 6. หากผู้ใช้พิมพ์ข้อความอื่นที่ไม่อยู่ใน Keyword ให้ดึงข้อความจริงของผู้ใช้
  if (symptoms.length === 0 && raw.length > 0) {
    const cleaned = raw
      .replace(/คนไข้มีอาการ|ผู้ป่วยมีอาการ|คนไข้|ผู้ป่วย|มีอาการ/g, '')
      .replace(/มาแล้ว\s*\d+\s*(วัน|สัปดาห์|อาทิตย์|เดือน|ปี|ชั่วโมง)/g, '')
      .replace(/\d+\s*(วัน|สัปดาห์|อาทิตย์|เดือน|ปี|ชั่วโมง)\s*(แล้ว|มาแล้ว)?/g, '')
      .trim();

    const parts = cleaned
      .split(/[,،·•\n]|และ|ร่วมกับ/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (parts.length > 0) {
      symptoms.push(...parts);
    } else {
      symptoms.push(raw);
    }
    dhatus.add('วาโยธาตุ');
  }

  if (dhatus.size === 0 && symptoms.length > 0) {
    dhatus.add('วาโยธาตุ');
  }

  return {
    chiefComplaint: symptoms,
    duration,
    affectedDhatu: Array.from(dhatus),
    bowelMovement,
    painScore,
    source: 'Deterministic Thai Clinical NLP Parser',
  };
}
