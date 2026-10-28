// src/context/CaseContext.tsx
'use client';

import React, { createContext, useContext, useState } from 'react';
import {
  PatientCase,
  PatientQueueItem,
  StepId,
  DEMO_SOMSRI_CASE,
  DEMO_SOMCHAI_CASE,
} from '@/types/clinicalCase';

interface CaseContextType {
  currentStep: StepId;
  setCurrentStep: (step: StepId) => void;
  patientCase: PatientCase;
  updateCase: (partial: Partial<PatientCase>) => void;
  loadDemoCase: (caseType?: 'somsri' | 'somchai') => void;
  loadCase: (customCase: PatientCase) => void;
  startNewCase: () => void;
  patientQueue: PatientQueueItem[];
  upsertPatientInQueue: (caseData: PatientCase, status?: 'รอตรวจ' | 'ตรวจแล้ว') => void;
  completeCurrentCase: () => void;
}

const INITIAL_QUEUE: PatientQueueItem[] = [
  {
    id: 'DEMO-PT-001',
    hn: 'HN-982341',
    time: '10:30',
    name: 'คุณสมศรี ใจดี',
    age: 58,
    gender: 'หญิง',
    symptoms: 'ท้องอืด แน่นท้อง ปวดเมื่อยตามตัว 4 วัน',
    status: 'รอตรวจ',
    demoType: 'somsri',
    caseSnapshot: DEMO_SOMSRI_CASE,
  },
  {
    id: 'DEMO-PT-002',
    hn: 'HN-445892',
    time: '10:50',
    name: 'นายสมชาย รักไทย',
    age: 65,
    gender: 'ชาย',
    symptoms: 'ปวดขัดข้อเข่าเรื้อรัง 2 ข้าง ลุกยืนลำบาก',
    status: 'รอตรวจ',
    demoType: 'somchai',
    caseSnapshot: DEMO_SOMCHAI_CASE,
  },
  {
    id: 'DEMO-PT-003',
    hn: 'HN-312905',
    time: '09:15',
    name: 'นางมาลี สุขเกษม',
    age: 49,
    gender: 'หญิง',
    symptoms: 'ปวดตึงคอบ่าสะบัก ปวดศีรษะข้างเดียว',
    status: 'ตรวจแล้ว',
    historyDetail: {
      chiefComplaint: 'ปวดตึงคอบ่าสะบักร้าวขึ้นศีรษะข้างขวา ตาพร่า มึนศีรษะ 5 วัน',
      underlyingDiseases: ['ไมเกรน', 'ความดันโลหิตสูง'],
      currentMeds: ['Enalapril 5mg 1 tab od pc', 'Paracetamol 500mg prn'],
      smutthan: 'วาโยธาตุ (อุทธังคมาวาตา) กำเริบ',
      prescriptions: [
        {
          name: 'ยาหอมนวโกฐ',
          dosage: '2 แคปซูล วันละ 3 ครั้ง ก่อนอาหาร 5 วัน',
          rasa: 'รสสุขุม / หอมร้อน',
        },
        {
          name: 'หัตถการ: นวดราชสำนักและประคบสมุนไพร',
          dosage: 'นวดจุดสัญญาณศีรษะและคอบ่า 45 นาที สัปดาห์ละ 1 ครั้ง',
          rasa: 'หัตถการภายนอก',
        },
      ],
      icdCodes: ['U50.1 (G44.2) ลมปะกัง', 'U60.2 นวดรักษาทางการแพทย์แผนไทย'],
      examTime: '09:15 น.',
    },
  },
  {
    id: 'DEMO-PT-004',
    hn: 'HN-772183',
    time: '09:45',
    name: 'นายประสิทธิ์ มั่นคง',
    age: 52,
    gender: 'ชาย',
    symptoms: 'ไข้หวัด ครั่นเนื้อครั่นตัว มีน้ำมูก ไอมีเสมหะ',
    status: 'ตรวจแล้ว',
    historyDetail: {
      chiefComplaint: 'มีไข้ ตัวร้อน ไอมีเสมหะขาวขุ่น เจ็บคอ 2 วัน',
      underlyingDiseases: ['ภูมิแพ้อากาศ'],
      currentMeds: ['Cetirizine 10mg 1 tab hs'],
      smutthan: 'เตโชธาตุ (สันตัปปัคคี) ร่วมกับ อาโปธาตุ',
      prescriptions: [
        {
          name: 'ยาจันทน์ลีลา',
          dosage: '2 แคปซูล วันละ 3 ครั้ง ก่อนอาหาร ทุก 4–6 ชม. 3 วัน',
          rasa: 'รสขม / เย็น',
        },
        {
          name: 'ยาประสะมะแว้ง',
          dosage: 'อมครั้งละ 1–2 เม็ด วันละ 4 ครั้ง',
          rasa: 'รสเปรี้ยว / ขมฝาด',
        },
      ],
      icdCodes: ['U51.0 (R50.9) ไข้เพื่อเตโชธาตุกำเริบ', 'U52.1 (R05) อาการไอจากเสมหะ'],
      examTime: '09:45 น.',
    },
  },
];

const EMPTY_CASE: PatientCase = {
  id: 'NEW-CASE-001',
  hn: 'HN-558291',
  name: '',
  age: 45,
  gender: 'F',
  visitTime: '11:00',
  season: 'rainy',
  weather: {
    tempC: 29,
    humidityPct: 78,
  },
  vitals: {
    bp: '120/80 mmHg',
    pulse: 75,
    temp: 36.5,
  },
  underlyingDiseases: [],
  currentMeds: [],
  rawNote: '',
  extractedSymptoms: { chiefComplaint: [], duration: '', affectedDhatu: [] },
  prescriptions: [],
};

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export function CaseProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<StepId>('S1');
  const [patientCase, setPatientCase] = useState<PatientCase>(DEMO_SOMSRI_CASE);
  const [patientQueue, setPatientQueue] = useState<PatientQueueItem[]>(INITIAL_QUEUE);

  // ซิงค์ข้อมูลเคสเข้าสู่ตารางผู้ป่วยวันนี้ (patientQueue)
  const syncQueueWithCase = (mergedCase: PatientCase, forceStatus?: 'รอตรวจ' | 'ตรวจแล้ว') => {
    if (!mergedCase.name || !mergedCase.name.trim()) return;

    const symptomSummary =
      mergedCase.extractedSymptoms?.chiefComplaint?.length > 0
        ? mergedCase.extractedSymptoms.chiefComplaint.join(', ')
        : mergedCase.rawNote?.trim() || 'เปิดเคสใหม่ (รอซักประวัติอาการสำคัญ)';

    const primaryEl = mergedCase.smutthanResult?.primaryElement || 'ลม';
    const smutthanText = `${
      primaryEl === 'ไฟ'
        ? 'เตโชธาตุ (ไฟ)'
        : primaryEl === 'น้ำ'
        ? 'อาโปธาตุ (น้ำ)'
        : primaryEl === 'ดิน'
        ? 'ปถวีธาตุ (ดิน)'
        : 'วาโยธาตุ (ลม)'
    } แปรปรวน (${mergedCase.smutthanResult?.concordanceLevel || 'สอดคล้อง 3/4 มิติ'})`;

    setPatientQueue((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === mergedCase.id || item.hn === mergedCase.hn);
      const currentStatus = forceStatus || (existingIdx >= 0 ? prev[existingIdx].status : 'รอตรวจ');

      const updatedItem: PatientQueueItem = {
        id: mergedCase.id,
        hn: mergedCase.hn,
        time: mergedCase.visitTime || '11:00',
        name: mergedCase.name,
        age: mergedCase.age,
        gender: mergedCase.gender === 'M' ? 'ชาย' : 'หญิง',
        symptoms: symptomSummary,
        status: currentStatus,
        caseSnapshot: mergedCase,
        historyDetail:
          currentStatus === 'ตรวจแล้ว'
            ? {
                chiefComplaint: symptomSummary,
                underlyingDiseases: mergedCase.underlyingDiseases || [],
                currentMeds: mergedCase.currentMeds || [],
                smutthan: smutthanText,
                prescriptions:
                  mergedCase.prescriptions?.length > 0
                    ? mergedCase.prescriptions.map((rx) => ({
                        name: rx.herbName,
                        dosage: rx.dosage,
                        rasa: rx.rasa || 'รสยาตามสมุฏฐาน',
                      }))
                    : [
                        {
                          name: 'ยาสมุนไพรในบัญชียาหลักแห่งชาติ',
                          dosage: 'ตามแผนการรักษาของแพทย์แผนไทย',
                          rasa: 'รสยาตรงสมุฏฐาน',
                        },
                      ],
                icdCodes:
                  mergedCase.confirmedICD && mergedCase.confirmedICD.length > 0
                    ? mergedCase.confirmedICD.map((c) => `${c.ttmCode} (${c.icd10tm}) ${c.description}`)
                    : ['U50.1 / U51.0 การวินิจฉัยโรคทางการแพทย์แผนไทย'],
                examTime: `${mergedCase.visitTime || '11:00'} น. (เสร็จสมบูรณ์)`,
              }
            : existingIdx >= 0
            ? prev[existingIdx].historyDetail
            : undefined,
      };

      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = updatedItem;
        return next;
      }
      // เพิ่มเคสใหม่ไว้บนสุดของตารางผู้ป่วยวันนี้
      return [updatedItem, ...prev];
    });
  };

  const updateCase = (partial: Partial<PatientCase>) => {
    setPatientCase((prev) => {
      const merged = { ...prev, ...partial };
      syncQueueWithCase(merged);
      return merged;
    });
  };

  const upsertPatientInQueue = (caseData: PatientCase, status?: 'รอตรวจ' | 'ตรวจแล้ว') => {
    setPatientCase(caseData);
    syncQueueWithCase(caseData, status);
  };

  const completeCurrentCase = () => {
    syncQueueWithCase(patientCase, 'ตรวจแล้ว');
  };

  // โหลดเคสกำหนดเองจากตาราง
  const loadCase = (customCase: PatientCase) => {
    setPatientCase(customCase);
    setCurrentStep('S3');
  };

  // โหลดเคสสาธิต (นางสมศรี หรือ นายสมชาย)
  const loadDemoCase = (caseType: 'somsri' | 'somchai' = 'somsri') => {
    if (caseType === 'somchai') {
      setPatientCase(DEMO_SOMCHAI_CASE);
    } else {
      setPatientCase(DEMO_SOMSRI_CASE);
    }
    setCurrentStep('S3');
  };

  // เริ่มเปิดเคสใหม่ (เคลียร์ข้อมูลเก่าและอาการเก่าทั้งหมด)
  const startNewCase = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    setPatientCase({
      ...EMPTY_CASE,
      id: `PT-${Date.now().toString().slice(-4)}`,
      hn: `HN-${Math.floor(100000 + Math.random() * 900000)}`,
      name: '',
      visitTime: `${hh}:${mm}`,
      rawNote: '',
      extractedSymptoms: { chiefComplaint: [], duration: '', affectedDhatu: [] },
      prescriptions: [],
      confirmedICD: [],
    });
    setCurrentStep('S3');
  };

  return (
    <CaseContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        patientCase,
        updateCase,
        loadDemoCase,
        loadCase,
        startNewCase,
        patientQueue,
        upsertPatientInQueue,
        completeCurrentCase,
      }}
    >
      {children}
    </CaseContext.Provider>
  );
}

export function useCase() {
  const context = useContext(CaseContext);
  if (!context) throw new Error('useCase must be used within a CaseProvider');
  return context;
}
