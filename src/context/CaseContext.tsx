// src/context/CaseContext.tsx
'use client';

import React, { createContext, useContext, useState } from 'react';
import { PatientCase, StepId, DEMO_SOMSRI_CASE } from '@/types/clinicalCase';

interface CaseContextType {
  currentStep: StepId;
  setCurrentStep: (step: StepId) => void;
  patientCase: PatientCase;
  updateCase: (partial: Partial<PatientCase>) => void;
  loadDemoCase: () => void;
}

const EMPTY_CASE: PatientCase = {
  id: '',
  hn: '',
  name: '',
  age: 0,
  gender: 'F',
  visitTime: '10:30',
  season: 'rainy',
  underlyingDiseases: [],
  currentMeds: [],
  extractedSymptoms: { chiefComplaint: [], duration: '', affectedDhatu: [] },
  prescriptions: [],
};

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export function CaseProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<StepId>('S1');
  const [patientCase, setPatientCase] = useState<PatientCase>(EMPTY_CASE);

  const updateCase = (partial: Partial<PatientCase>) => {
    setPatientCase((prev) => ({ ...prev, ...partial }));
  };

  // ฟังก์ชันปุ่มลัดสำหรับโหลดเคสนางสมศรี 58 ปี ทันทีตอนซ้อมและตอนขึ้น Pitching
  const loadDemoCase = () => {
    setPatientCase(DEMO_SOMSRI_CASE);
    setCurrentStep('S3'); // กระโดดเข้าหน้าเปิดเคสพร้อมข้อมูลครบทันที
  };

  return (
    <CaseContext.Provider value={{ currentStep, setCurrentStep, patientCase, updateCase, loadDemoCase }}>
      {children}
    </CaseContext.Provider>
  );
}

export function useCase() {
  const context = useContext(CaseContext);
  if (!context) throw new Error('useCase must be used within a CaseProvider');
  return context;
}