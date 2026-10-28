export type StepId = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'S9' | 'KB';

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
  currentMeds: string[];        // เช่น ["Metformin 500mg", "Warfarin 3mg"]
  rawNote?: string;             // ข้อความซักประวัติที่แพทย์พิมพ์หรือพูดในหน้า S4
  extractedSymptoms: {
    chiefComplaint: string[];
    duration: string;
    affectedDhatu: string[];
  };
  smutthanResult?: {
    primaryElement: 'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ';
    confidence: number;
    concordanceLevel?: string;
    matchedCount?: number;
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

export interface PatientHistoryDetail {
  chiefComplaint: string;
  underlyingDiseases: string[];
  currentMeds: string[];
  smutthan: string;
  prescriptions: {
    name: string;
    dosage: string;
    rasa: string;
  }[];
  icdCodes: string[];
  examTime: string;
}

export interface PatientQueueItem {
  id: string;
  hn: string;
  time: string;
  name: string;
  age: number;
  gender: 'ชาย' | 'หญิง';
  symptoms: string;
  status: 'รอตรวจ' | 'ตรวจแล้ว';
  demoType?: 'somsri' | 'somchai';
  caseSnapshot?: PatientCase;
  historyDetail?: PatientHistoryDetail;
}

// ข้อมูลเคสสาธิตมาตรฐาน 1: นางสมศรี ใจดี (DEMO-PT-001) - อาการทางวาโยธาตุ ท้องอืด แน่นเฟ้อ ปวดเมื่อย
export const DEMO_SOMSRI_CASE: PatientCase = {
  id: 'DEMO-PT-001',
  hn: 'HN-982341',
  name: 'คุณสมศรี ใจดี',
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
  currentMeds: ['Metformin 500mg', 'Warfarin 3mg', 'Aspirin 81mg'],
  rawNote: 'คนไข้ท้องอืด แน่นเฟ้อหลังอาหาร เรอเปรี้ยว ร่วมกับปวดตึงคอบ่าสะบักและหลังส่วนล่างมา 4 วัน',
  extractedSymptoms: {
    chiefComplaint: ['ท้องอืด แน่นเฟ้อ', 'ปวดตึงคอบ่าหลัง'],
    duration: '4 วัน',
    affectedDhatu: ['วาโยธาตุ (กุจฉิสยาวาตา)', 'วาโยธาตุ (อังคมังคานุสารีวาตา)'],
  },
  prescriptions: [],
};

// ข้อมูลเคสสาธิตมาตรฐาน 2: นายสมชาย รักไทย (DEMO-PT-002) - อาการปวดข้อเข่าเรื้อรัง ข้อเสื่อม
export const DEMO_SOMCHAI_CASE: PatientCase = {
  id: 'DEMO-PT-002',
  hn: 'HN-445892',
  name: 'นายสมชาย รักไทย',
  age: 65,
  gender: 'M',
  visitTime: '10:50',
  season: 'rainy',
  weather: {
    tempC: 29,
    humidityPct: 78,
  },
  vitals: {
    bp: '138/86 mmHg',
    pulse: 74,
    temp: 36.6,
  },
  underlyingDiseases: ['ข้อเข่าเสื่อม (OA Knee)', 'ความดันโลหิตสูง (Hypertension)'],
  currentMeds: ['Amlodipine 5mg 1 tab od pc'],
  rawNote: 'คนไข้มีอาการปวดขัดข้อเข่าทั้งสองข้างเรื้อรัง นั่งยองไม่ได้ ลุกยืนลำบาก ปวดตึงบั้นเอวและกล้ามเนื้อขา 2 สัปดาห์',
  extractedSymptoms: {
    chiefComplaint: ['ปวดขัดข้อเข่าเรื้อรัง', 'ลุกนั่งลำบาก ปวดตึงกล้ามเนื้อขา'],
    duration: '2 สัปดาห์',
    affectedDhatu: ['วาโยธาตุ (อังคมังคานุสารีวาตา)'],
  },
  prescriptions: [],
};
