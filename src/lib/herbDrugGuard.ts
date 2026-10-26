import interactions from '@/data/interactions.json';

export interface InteractionCheckResult {
  hasConflict: boolean;
  riskLevel: 'NONE' | 'MODERATE' | 'CRITICAL';
  matchedHerb: string;
  matchedDrug: string;
  effect: string;
  recommendedAction: string;
}

export function checkHerbDrugInteraction(
  selectedHerbName: string,
  currentMeds: string[]
): InteractionCheckResult {
  const medsJoined = currentMeds.join(' ').toLowerCase();

  for (const rule of interactions) {
    const herbMatched = selectedHerbName.includes(rule.herb);
    const drugMatched = medsJoined.includes(rule.drug.toLowerCase());

    if (herbMatched && drugMatched) {
      return {
        hasConflict: true,
        riskLevel: rule.severity === 'CRITICAL' ? 'CRITICAL' : 'MODERATE',
        matchedHerb: selectedHerbName,
        matchedDrug: rule.drug,
        effect: rule.effect,
        recommendedAction: rule.action,
      };
    }
  }

  return {
    hasConflict: false,
    riskLevel: 'NONE',
    matchedHerb: selectedHerbName,
    matchedDrug: '-',
    effect: 'ไม่พบอันตรกิริยาระหว่างสมุนไพรที่เลือกกับยาประจำตัวของผู้ป่วยในฐานข้อมูลมาตรฐาน',
    recommendedAction: 'สามารถสั่งจ่ายได้ตามขนาดมาตรฐานทางการแพทย์แผนไทย',
  };
}