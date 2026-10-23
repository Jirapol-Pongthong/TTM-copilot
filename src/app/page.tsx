// src/app/page.tsx
'use client';

import React from 'react';
import { CaseProvider, useCase } from '@/context/CaseContext';
import Step1Login from '@/components/page/Login';
import Step2PatientList from '@/components/page/PatientList';
import Step3NewCase from '@/components/page/NewCase';
import Step4HistoryExam from '@/components/page/HistoryExam';
import Step5Smutthan from '@/components/page/Smutthan';
import Step6FormulaRasa from '@/components/page/FormulaRasa';
import Step7InteractionAlert from '@/components/page/InteractionAlert';
import Step8IcdCoding from '@/components/page/IcdCoding';
import Step9CaseSummary from '@/components/page/CaseSummary';

function AppRouter() {
  const { currentStep } = useCase();

  switch (currentStep) {
    case 'S1':
      return <Step1Login />;
    case 'S2':
      return <Step2PatientList />;
    case 'S3':
      return <Step3NewCase />;
    case 'S4':
      return <Step4HistoryExam />;
    case 'S5':
      return <Step5Smutthan />;
    case 'S6':
      return <Step6FormulaRasa />;
    case 'S7':
      return <Step7InteractionAlert />;
    case 'S8':
      return <Step8IcdCoding />;
    case 'S9':
      return <Step9CaseSummary />;
    default:
      return <Step1Login />;
  }
}

export default function Page() {
  return (
    <CaseProvider>
      <AppRouter />
    </CaseProvider>
  );
}