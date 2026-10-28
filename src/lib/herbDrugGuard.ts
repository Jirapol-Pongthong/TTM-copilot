// src/lib/herbDrugGuard.ts
import rawInteractions from '@/data/interactions.json';

export interface InteractionRule {
  id: string;
  herb: string;
  herbKeywords?: string[];
  drug: string;
  drugKeywords?: string[];
  severity: 'CRITICAL' | 'MODERATE' | 'SAFE';
  riskLabel?: string;
  effect: string;
  action: string;
}

const interactions = rawInteractions as InteractionRule[];

export interface InteractionCheckResult {
  hasConflict: boolean;
  riskLevel: 'NONE' | 'MODERATE' | 'CRITICAL';
  matchedHerb: string;
  matchedDrug: string;
  effect: string;
  recommendedAction: string;
  isSafeAlternative?: boolean;
}

// ฐานข้อมูลคำพ้องชื่อยาแผนปัจจุบัน (รองรับตัวพิมพ์เล็ก/ใหญ่, ไม่มีจุด, ไม่มี mg, และชื่อภาษาไทย)
export const DRUG_ALIASES: Record<string, string[]> = {
  warfarin: ['warfarin', 'wafarin', 'วาร์ฟาริน', 'วาฟาริน', 'coumadin', 'คูมาดิน', 'ละลายลิ่มเลือด', 'ต้านการแข็งตัว'],
  aspirin: ['aspirin', 'asa', 'แอสไพริน', 'ต้านเกล็ดเลือด', 'cardiprin', 'คาร์ดิพริน'],
  clopidogrel: ['clopidogrel', 'โคลพิโดเกรล', 'plavix', 'พลาวิกซ์'],
  metformin: ['metformin', 'เมทฟอร์มิน', 'เมตฟอร์มิน', 'glucophage', 'กลูโคฟาจ', 'ยาลดน้ำตาล'],
  glipizide: ['glipizide', 'กลิพิไซด์', 'กริพิไซด์', 'minidiab'],
  insulin: ['insulin', 'อินซูลิน', 'ยาฉีดเบาหวาน'],
  enalapril: ['enalapril', 'อีนาลาพริล', 'losartan', 'โลซาร์แทน', 'ยาลดความดัน'],
  paracetamol: ['paracetamol', 'พาราเซตามอล', 'พารา', 'tylenol', 'ไทลินอล'],
  statin: ['atorvastatin', 'simvastatin', 'สแตติน', 'ยาลดไขมัน', 'lipitor', 'zocor'],
  betablocker: ['propranolol', 'atenolol', 'โพรพราโนลอล', 'อะทีโนลอล', 'เบต้าบล็อกเกอร์'],
  nsaid: ['nsaid', 'ibuprofen', 'ไอบูโพรเฟน', 'diclofenac', 'ไดโคลฟีแนค', 'naproxen', 'นาพรอกเซน', 'celecoxib', 'arcoxia'],
};

export function normalizeDrugString(input: string): string {
  return input
    .toLowerCase()
    .replace(/\./g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * ตรวจสอบว่ายาแผนปัจจุบันที่พิมพ์เข้ามา จัดอยู่ในกลุ่มเสี่ยงตีกับสมุนไพรหรือไม่ (ค้นหาจากฐานข้อมูล 105 คู่ยามาตรฐาน)
 */
export function evaluateSingleDrugRisk(medInput: string): {
  isRisk: boolean;
  level: 'NONE' | 'MODERATE' | 'CRITICAL';
  canonicalDrug: string;
  badgeText: string;
} {
  const norm = normalizeDrugString(medInput);
  if (!norm) {
    return { isRisk: false, level: 'NONE', canonicalDrug: '', badgeText: '' };
  }

  // 1. ค้นหาจากฐานข้อมูล 105 อันตรกิริยาใน interactions.json
  const matchedRules = interactions.filter((rule) => {
    if (rule.severity === 'SAFE') return false;
    const drugKws = rule.drugKeywords && rule.drugKeywords.length > 0
      ? rule.drugKeywords
      : [rule.drug];
    
    return drugKws.some((dkw) => {
      const clean = dkw.toLowerCase().trim();
      return clean.length >= 3 && (norm.includes(clean) || clean.includes(norm));
    });
  });

  if (matchedRules.length > 0) {
    // หาความรุนแรงสูงสุด
    const hasCritical = matchedRules.some((r) => r.severity === 'CRITICAL');
    const topRule = matchedRules.find((r) => hasCritical ? r.severity === 'CRITICAL' : true) || matchedRules[0];

    return {
      isRisk: true,
      level: hasCritical ? 'CRITICAL' : 'MODERATE',
      canonicalDrug: topRule.drug,
      badgeText: `เสี่ยงตีกับสมุนไพร (${topRule.effect.slice(0, 50)}...)`,
    };
  }

  // 2. Fallback ตรวจเทียบผ่าน DRUG_ALIASES
  if (DRUG_ALIASES.warfarin.some((alias) => norm.includes(alias)) || DRUG_ALIASES.clopidogrel.some((alias) => norm.includes(alias))) {
    return {
      isRisk: true,
      level: 'CRITICAL',
      canonicalDrug: 'Warfarin / Clopidogrel',
      badgeText: 'เสี่ยงตีกับสมุนไพร (ต้านการแข็งตัวของเลือด/เกล็ดเลือด)',
    };
  }

  if (DRUG_ALIASES.aspirin.some((alias) => norm.includes(alias)) || DRUG_ALIASES.nsaid.some((alias) => norm.includes(alias))) {
    return {
      isRisk: true,
      level: 'CRITICAL',
      canonicalDrug: 'Aspirin / NSAIDs',
      badgeText: 'เสี่ยงตีกับสมุนไพร (ระวังเลือดออกทางเดินอาหาร)',
    };
  }

  if (DRUG_ALIASES.betablocker.some((alias) => norm.includes(alias))) {
    return {
      isRisk: true,
      level: 'CRITICAL',
      canonicalDrug: 'Propranolol / Atenolol',
      badgeText: 'ระวังสมุนไพรรสเผ็ดร้อนกระตุ้นการเต้นหัวใจ',
    };
  }

  if (DRUG_ALIASES.metformin.some((alias) => norm.includes(alias)) || DRUG_ALIASES.glipizide.some((alias) => norm.includes(alias)) || DRUG_ALIASES.insulin.some((alias) => norm.includes(alias))) {
    return {
      isRisk: true,
      level: 'MODERATE',
      canonicalDrug: 'ยาลดน้ำตาล / Insulin',
      badgeText: 'เฝ้าระวังระดับน้ำตาลเมื่อใช้คู่สมุนไพรรสขมหรือปรับธาตุ',
    };
  }

  return {
    isRisk: false,
    level: 'NONE',
    canonicalDrug: medInput,
    badgeText: '',
  };
}

/**
 * ตรวจสอบอันตรกิริยาระหว่างสมุนไพรที่เลือกกับรายการยาประจำตัวทั้งหมดของผู้ป่วย (ใช้ในหน้า S6 & S7)
 */
export function checkHerbDrugInteraction(
  selectedHerbName: string,
  currentMeds: string[]
): InteractionCheckResult {
  const normSelectedHerb = selectedHerbName.toLowerCase();

  for (const rule of interactions) {
    if (!rule.drug || rule.drug.toLowerCase() === 'none') continue;
    // 1. ตรวจสอบว่าสมุนไพรที่เลือกตรงกับกฎนี้หรือไม่
    const herbKeywords = rule.herbKeywords && rule.herbKeywords.length > 0
      ? rule.herbKeywords
      : [rule.herb];

    const herbMatched = herbKeywords.some((kw) => {
      const cleanKw = kw.toLowerCase().replace(/ยา/g, '').trim();
      return normSelectedHerb.includes(cleanKw) || cleanKw.includes(normSelectedHerb);
    });

    if (!herbMatched) continue;

    // 2. ตรวจสอบว่ายาประจำตัวของผู้ป่วยตรงกับกฎนี้หรือไม่
    const drugKeywords = rule.drugKeywords && rule.drugKeywords.length > 0
      ? rule.drugKeywords
      : [rule.drug];

    for (const userMed of currentMeds) {
      const normUserMed = normalizeDrugString(userMed);

      let drugMatched = drugKeywords.some((dkw) => {
        const cleanDkw = dkw.toLowerCase().trim();
        return normUserMed.includes(cleanDkw);
      });

      // ตรวจเทียบผ่าน DRUG_ALIASES
      if (!drugMatched) {
        for (const [canonical, aliases] of Object.entries(DRUG_ALIASES)) {
          const ruleMentionsAlias = drugKeywords.some((dkw) =>
            dkw.toLowerCase().includes(canonical) || aliases.some((a) => dkw.toLowerCase().includes(a))
          );
          if (ruleMentionsAlias && aliases.some((a) => normUserMed.includes(a))) {
            drugMatched = true;
            break;
          }
        }
      }

      if (drugMatched) {
        if (rule.severity === 'SAFE') {
          return {
            hasConflict: false,
            riskLevel: 'NONE',
            matchedHerb: selectedHerbName,
            matchedDrug: userMed,
            effect: rule.effect,
            recommendedAction: rule.action,
            isSafeAlternative: true,
          };
        }

        return {
          hasConflict: true,
          riskLevel: rule.severity === 'CRITICAL' ? 'CRITICAL' : 'MODERATE',
          matchedHerb: selectedHerbName,
          matchedDrug: userMed, // แสดงชื่อยาจริงตามที่แพทย์คีย์เข้ามา
          effect: rule.effect,
          recommendedAction: rule.action,
          isSafeAlternative: false,
        };
      }
    }
  }

  return {
    hasConflict: false,
    riskLevel: 'NONE',
    matchedHerb: selectedHerbName,
    matchedDrug: '-',
    effect: 'ไม่พบอันตรกิริยาระหว่างสมุนไพรที่เลือกกับยาประจำตัวของผู้ป่วยในฐานข้อมูลมาตรฐาน TTM Clinical',
    recommendedAction: 'สามารถสั่งจ่ายได้ตามขนาดมาตรฐานทางการแพทย์แผนไทย',
    isSafeAlternative: true,
  };
}
