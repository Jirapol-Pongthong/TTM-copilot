// src/lib/symptomExtractor.ts

export interface ExtractedSymptomPayload {
  chiefComplaint: string[];
  duration: string;
  affectedDhatu: string[];
  bowelMovement: string;
  source?: string;
}

export function extractThaiSymptomsDeterministic(textPrompt: string): ExtractedSymptomPayload {
  const raw = (textPrompt || '').trim();
  const lower = raw.toLowerCase();

  const symptoms: string[] = [];
  const dhatus = new Set<string>();

  // 1. กลุ่มไข้ / ตัวร้อน / ความร้อน (เตโชธาตุ)
  if (lower.includes('ตัวร้อน') || lower.includes('มีไข้') || lower.includes('เป็นไข้') || lower.includes('ไข้ขึ้น')) {
    symptoms.push('ตัวร้อน มีไข้');
    dhatus.add('เตโชธาตุ (สันตัปปัคคี)');
  }
  if (lower.includes('ร้อนใน') || lower.includes('กระหายน้ำ') || lower.includes('คอแห้ง')) {
    symptoms.push('ร้อนใน กระหายน้ำ');
    dhatus.add('เตโชธาตุ (ปริทัยหัคคี)');
  }

  // 2. กลุ่มปวดศีรษะ / เวียนศีรษะ (ลมอุทธังคมาวาตา)
  if (
    lower.includes('ปวดหัว') ||
    lower.includes('ปวดศีรษะ') ||
    lower.includes('ปวดขมับ') ||
    /ปวด\s*หัว/.test(lower)
  ) {
    symptoms.push('ปวดศีรษะ');
    dhatus.add('วาโยธาตุ (อุทธังคมาวาตา)');
  }
  if (lower.includes('เวียนหัว') || lower.includes('เวียนศีรษะ') || lower.includes('มึนหัว') || lower.includes('หน้ามืด')) {
    symptoms.push('มึนงง เวียนศีรษะ');
    dhatus.add('วาโยธาตุ (อุทธังคมาวาตา)');
  }

  // 3. กลุ่มไอ / เจ็บคอ / เสมหะ / น้ำมูก (อาโปธาตุ)
  if (lower.includes('เจ็บคอ') || lower.includes('ระคายคอ')) {
    symptoms.push('เจ็บคอ ระคายคอ');
    dhatus.add('อาโปธาตุ (ศอเสมหะ)');
  }
  if (lower.includes('ไอ') || lower.includes('เสมหะ') || lower.includes('น้ำมูก') || lower.includes('เป็นหวัด')) {
    symptoms.push('ไอ มีเสมหะ');
    dhatus.add('อาโปธาตุ (ศอเสมหะ & อุระเสมหะ)');
  }

  // 4. กลุ่มทางเดินอาหาร / ปวดท้อง / ท้องอืด / แน่นท้อง / กรดไหลย้อน (ลมกุจฉิสยาวาตา / โกฏฐาสยาวาตา)
  if (
    lower.includes('ปวดท้อง') ||
    lower.includes('ปวดมวนท้อง') ||
    /ปวด\s*ท้อง/.test(lower)
  ) {
    symptoms.push('ปวดท้อง (ลมกุจฉิสยาวาตา)');
    dhatus.add('วาโยธาตุ (กุจฉิสยาวาตา)');
  }
  if (
    lower.includes('ท้องอืด') ||
    lower.includes('แน่นท้อง') ||
    lower.includes('แน่นเฟ้อ') ||
    lower.includes('จุกเสียด') ||
    /แน่น\s*ท้อง/.test(lower)
  ) {
    symptoms.push('ท้องอืด แน่นท้อง');
    dhatus.add('วาโยธาตุ (กุจฉิสยาวาตา)');
  }
  if (lower.includes('เรอเปรี้ยว') || lower.includes('กรดไหลย้อน') || lower.includes('แสบร้อนกลางอก') || lower.includes('ลมดัน')) {
    symptoms.push('เรอเปรี้ยว มีลมดันขึ้น');
    dhatus.add('วาโยธาตุ (อุทธังคมาวาตา)');
    dhatus.add('เตโชธาตุ (ปริณามัคคี)');
  }

  // 5. กลุ่มกล้ามเนื้อและเส้นเอ็น (ลมอังคมังคานุสารีวาตา / ปถวีธาตุ)
  if (lower.includes('คอบ่า') || lower.includes('สะบัก') || lower.includes('ปวดหลัง') || lower.includes('ปวดตึง') || lower.includes('ปวดเมื่อย')) {
    symptoms.push('ปวดตึงกล้ามเนื้อคอบ่าหลัง');
    dhatus.add('วาโยธาตุ (อังคมังคานุสารีวาตา)');
  }
  if (lower.includes('ปวดก้น') || lower.includes('สะโพก') || lower.includes('สลักเพชร') || lower.includes('ร้าวลงขา') || lower.includes('เอว')) {
    symptoms.push('ปวดสะโพกและก้น (ลมแล่นในเส้น)');
    dhatus.add('วาโยธาตุ (อังคมังคานุสารีวาตา)');
  }
  if (lower.includes('ปวดเข่า') || lower.includes('ข้อเข่า') || lower.includes('เข่าเสื่อม')) {
    symptoms.push('ปวดขัดข้อเข่า (ลมจับโปง)');
    dhatus.add('วาโยธาตุ (อังคมังคานุสารีวาตา)');
    dhatus.add('ปถวีธาตุ (อัฏฐิ/อัฏฐิมิญชัง)');
  }

  // 6. กลุ่มขับถ่าย
  let bowelMovement = 'ปกติ';
  if (lower.includes('ท้องผูก') || lower.includes('ถ่ายไม่สะดวก') || lower.includes('ถ่ายยาก')) {
    symptoms.push('ขับถ่ายไม่สะดวก (ท้องผูก)');
    dhatus.add('วาโยธาตุ (อโธคมาวาตา)');
    bowelMovement = 'ขับถ่ายไม่สะดวก';
  } else if (lower.includes('ท้องเสีย') || lower.includes('ถ่ายเหลว') || lower.includes('ท้องร่วง')) {
    symptoms.push('ถ่ายเหลว ท้องเสีย');
    dhatus.add('อาโปธาตุ (กรีสัง)');
    bowelMovement = 'ถ่ายเหลว';
  }

  // 7. สกัดระยะเวลาที่เป็น (Duration)
  let duration = 'ไม่ระบุระยะเวลา';
  const durationMatch = raw.match(/(\d+)\s*(วัน|สัปดาห์|อาทิตย์|เดือน|ปี|ชั่วโมง)/);
  if (durationMatch) {
    duration = `${durationMatch[1]} ${durationMatch[2]}`;
  } else if (raw.includes('เมื่อวาน')) {
    duration = '1 วัน';
  } else if (raw.includes('วันนี้')) {
    duration = '1 วัน';
  }

  // 8. หากผู้ใช้พิมพ์ข้อความอื่นที่ไม่อยู่ใน Keyword ด้านบน ให้ดึงข้อความจริงของผู้ใช้ ห้ามยัดคำว่า "ท้องอืด" เด็ดขาด
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
    source: 'Deterministic Thai Clinical NLP Parser',
  };
}
