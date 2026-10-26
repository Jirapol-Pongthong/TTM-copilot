// src/context/CaseContext.tsx
'use client';

import React, { createContext, useContext, useState } from 'react';
import { PatientCase, StepId, DEMO_SOMSRI_CASE, DEMO_SOMCHAI_CASE } from '@/types/clinicalCase';

interface CaseContextType {
  currentStep: StepId;
  setCurrentStep: (step: StepId) => void;
  patientCase: PatientCase;
  updateCase: (partial: Partial<PatientCase>) => void;
  loadDemoCase: (caseType?: 'somsri' | 'somchai') => void;
  loadCase: (customCase: PatientCase) => void;
  startNewCase: () => void;
}

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

  const updateCase = (partial: Partial<PatientCase>) => {
    setPatientCase((prev) => ({ ...prev, ...partial }));
  };

  // โหลดเคสกำหนดเอง
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

  // เริ่มเปิดเคสใหม่
  const startNewCase = () => {
    setPatientCase({
      ...EMPTY_CASE,
      id: `PT-${Date.now().toString().slice(-4)}`,
      hn: `HN-${Math.floor(100000 + Math.random() * 900000)}`,
      name: '',
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
