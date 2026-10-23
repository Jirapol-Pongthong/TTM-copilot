export type StepId = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'S9';

export interface TextbookCitation {
  book: string;
  page: number;
  image?: string;
  excerpt?: string;
}

export interface PatientCase {
  id: string;
  hn: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  visitTime: string;
  season: 'rainy' | 'summer' | 'winter';
  weather?: {
    tempC: number;
    humidityPct: number;
  };
  vitals?: {
    bp: string;
    pulse: number;
    temp: number;
  };
  underlyingDiseases: string[]; // เช่น ["Type 2 Diabetes", "Dyslipidemia"]
  currentMeds: string[];        // เช่น ["Metformin 500mg", "Aspirin 81mg"]
  rawNote?: string;             // ข้อความซักประวัติที่แพทย์พิมพ์หรือพูดในหน้า S4
  extractedSymptoms: {
    chiefComplaint: string[];
    duration: string;
    affectedDhatu: string[];
  };
  smutthanResult?: {
    primaryElement: 'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ';
    confidence: number;
    reasons: string[];
    citations: TextbookCitation[];
  };
  prescriptions: {
    herbName: string;
    rasa?: string;
    dosage: string;
    interactionRisk?: 'NONE' | 'MODERATE' | 'CRITICAL';
    interactionDetail?: string;
    alternativeAction?: string;
    citation?: TextbookCitation;
  }[];
  confirmedICD?: {
    ttmCode: string;
    icd10tm: string;
    description: string;
  }[];
}

// ข้อมูลเคสสาธิตมาตรฐาน (DEMO-PT-001) เชื่อมตรงกับบทของเพื่อนแพทย์ (SOP-TTM-001 หัวข้อ 4)
export const DEMO_SOMSRI_CASE: PatientCase = {
  id: 'DEMO-PT-001',
  hn: 'HN-982341',
  name: 'นางสมศรี ใจดี',
  age: 58,
  gender: 'F',
  visitTime: '10:30',
  season: 'rainy',
  weather: {
    tempC: 29,
    humidityPct: 78,
  },
  vitals: {
    bp: '132/84 mmHg',
    pulse: 78,
    temp: 36.8,
  },
  underlyingDiseases: ['เบาหวานชนิดที่ 2 (Type 2 DM)', 'ไขมันในเลือดสูง (Dyslipidemia)'],
  currentMeds: ['Metformin 500mg 1 tab bid pc', 'Aspirin 81mg 1 tab od pc'],
  rawNote: 'คนไข้ท้องอืด แน่นเฟ้อหลังอาหาร เรอเปรี้ยว ร่วมกับปวดตึงคอบ่าสะบักและหลังส่วนล่างมา 4 วัน',
  extractedSymptoms: {
    chiefComplaint: ['ท้องอืด แน่นเฟ้อ', 'ปวดตึงคอบ่าหลัง'],
    duration: '4 วัน',
    affectedDhatu: ['วาโยธาตุ'],
  },
  prescriptions: [],
};