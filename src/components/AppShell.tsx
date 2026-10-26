// src/components/AppShell.tsx
'use client';

import React from 'react';
import { useCase } from '@/context/CaseContext';
import { StepId } from '@/types/clinicalCase';
import { Check, Sparkles } from 'lucide-react';

const CLINICAL_STEPS: { stepId: StepId; number: number; label: string }[] = [
  { stepId: 'S4', number: 1, label: 'ซักประวัติ' },
  { stepId: 'S5', number: 2, label: 'วิเคราะห์สมุฏฐาน' },
  { stepId: 'S6', number: 3, label: 'ตำรับยา / รสยา' },
  { stepId: 'S7', number: 4, label: 'ตรวจความปลอดภัย' },
  { stepId: 'S8', number: 5, label: 'รหัสโรค' },
  { stepId: 'S9', number: 6, label: 'สรุปเคส' },
];

const STEP_ORDER: StepId[] = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9'];

export default function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { currentStep, setCurrentStep, patientCase, loadDemoCase } = useCase();

  if (currentStep === 'S1') {
    return <div className="min-h-screen flex">{children}</div>;
  }

  const currentIdx = STEP_ORDER.indexOf(currentStep);
  const isClinicalFlow = currentIdx >= STEP_ORDER.indexOf('S4') && currentStep !== 'S9';

  return (
    <div className="min-h-screen flex bg-[#F9F8F4] text-[#1A2E25]">
      {/* Left Sidebar */}
      <aside className="w-60 bg-[#123123] text-white flex flex-col justify-between p-5 shrink-0 select-none">
        <div>
          <div className="mb-8 px-2 cursor-pointer" onClick={() => setCurrentStep('S2')}>
            <h1 className="text-xl font-bold text-[#E5C483] tracking-tight hover:opacity-90 transition">TTM Copilot</h1>
            <p className="text-xs text-[#9AB3A6] mt-0.5">ผู้ช่วยเวชกรรมไทย CDSS</p>
          </div>

          <nav className="space-y-1.5 text-sm">
            {/* เมนู 1: ผู้ป่วยวันนี้ */}
            <button
              onClick={() => setCurrentStep('S2')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all duration-150 cursor-pointer ${
                currentStep === 'S2' || currentStep === 'S3'
                  ? 'bg-[#1E4635] font-bold text-white shadow-xs ring-1 ring-[#E5C483]/30'
                  : 'text-[#B2C5BB] hover:bg-[#193B2C] hover:text-white'
              }`}
            >
              <span>ผู้ป่วยวันนี้</span>
              {(currentStep === 'S2' || currentStep === 'S3') && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5C483] shrink-0" />
              )}
            </button>

            {/* เมนู 2: ตรวจรักษา (เคสปัจจุบัน) */}
            <button
              onClick={() => setCurrentStep('S4')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all duration-150 cursor-pointer ${
                isClinicalFlow
                  ? 'bg-[#1E4635] font-bold text-white shadow-xs ring-1 ring-[#E5C483]/30'
                  : 'text-[#B2C5BB] hover:bg-[#193B2C] hover:text-white'
              }`}
            >
              <span>ตรวจรักษา (เคสปัจจุบัน)</span>
              {isClinicalFlow && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5C483] shrink-0" />
              )}
            </button>

            {/* เมนู 3: ฐานความรู้ตำรา */}
            <button className="w-full text-left px-3.5 py-2.5 rounded-xl text-[#B2C5BB] hover:bg-[#193B2C] hover:text-white transition-all duration-150 cursor-pointer">
              ฐานความรู้ตำรา
            </button>

            {/* เมนู 4: รายงาน / ส่งออก */}
            <button
              onClick={() => setCurrentStep('S9')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all duration-150 cursor-pointer ${
                currentStep === 'S9'
                  ? 'bg-[#1E4635] font-bold text-white shadow-xs ring-1 ring-[#E5C483]/30'
                  : 'text-[#B2C5BB] hover:bg-[#193B2C] hover:text-white'
              }`}
            >
              <span>รายงาน / ส่งออก HDC</span>
              {currentStep === 'S9' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5C483] shrink-0" />
              )}
            </button>
          </nav>
        </div>

        {/* การ์ดผู้ใช้งานด้านล่าง */}
        <div className="bg-[#1B3F30] rounded-xl p-3.5 text-xs border border-teal-900/40">
          <p className="font-semibold text-white">พท.ว. ชำนาญการ (ประจำห้องตรวจ)</p>
          <p className="text-[#9AB3A6] mt-0.5">รพ.สต. ปฐมภูมิสาธิต</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header Bar */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#14261D]">{title}</h2>
              <p className="text-sm text-[#5C7065] mt-0.5">{subtitle}</p>
            </div>
          </div>

          {/* แถบข้อมูลผู้ป่วย (Patient Banner) & 6-Step Stepper */}
          {(isClinicalFlow || currentStep === 'S9') && (
            <>
              <div className="bg-[#F2F6F3] border border-[#DCE5DF] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 mb-4 text-xs shadow-xs">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-bold text-sm text-[#14261D]">
                    {patientCase.name || 'คุณสมศรี ใจดี'}
                  </span>
                  <span className="text-[#5C7065]">
                    {patientCase.gender === 'M' ? 'ชาย' : 'หญิง'} {patientCase.age || 58} ปี · HN{' '}
                    {patientCase.hn || 'HN-982341'}
                  </span>
                  <span className="bg-[#FCECD2] text-[#9A6B1F] font-bold px-2.5 py-0.5 rounded-full">
                    {patientCase.underlyingDiseases[0] || 'เบาหวานชนิดที่ 2'}
                  </span>
                  <span className="bg-white border border-[#DCE5DF] text-[#3A4F43] font-medium px-2.5 py-0.5 rounded-full">
                    ยาประจำ: {patientCase.currentMeds.length > 0 ? patientCase.currentMeds.join(', ') : 'Metformin 500mg, Aspirin 81mg'}
                  </span>
                </div>
                <span className="text-[#6E8277] text-[11px] font-medium">เวชระเบียนผู้ป่วยนอก (OPD Case)</span>
              </div>

              {/* 6-Step Clinical Stepper */}
              <div className="flex items-center justify-between mb-6 px-1">
                {CLINICAL_STEPS.map((item, idx) => {
                  const itemOrder = STEP_ORDER.indexOf(item.stepId);
                  const isCompleted = currentIdx > itemOrder;
                  const isCurrent = currentStep === item.stepId;

                  return (
                    <React.Fragment key={item.stepId}>
                      <button
                        onClick={() => setCurrentStep(item.stepId)}
                        className="flex items-center gap-2 text-xs font-medium focus:outline-none cursor-pointer group"
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-150 ${
                            isCompleted
                              ? 'bg-[#1E4D38] text-white group-hover:bg-[#163B2B]'
                              : isCurrent
                              ? 'bg-[#1E4D38] text-white shadow ring-2 ring-[#E5C483]'
                              : 'bg-[#D5DFD9] text-[#5C7065] group-hover:bg-[#C2D0C8]'
                          }`}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : item.number}
                        </span>
                        <span
                          className={`transition-colors duration-150 ${
                            isCurrent
                              ? 'font-bold text-[#14261D]'
                              : isCompleted
                              ? 'text-[#1E4D38] group-hover:underline'
                              : 'text-[#6E8277] group-hover:text-[#14261D]'
                          }`}
                        >
                          {item.label}
                        </span>
                      </button>

                      {idx < CLINICAL_STEPS.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-3 transition-colors duration-150 ${
                            currentIdx > itemOrder ? 'bg-[#1E4D38]' : 'bg-[#D5DFD9]'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </>
          )}

          {/* พื้นที่แสดงหน้าจอของแต่ละ Step */}
          <div>{children}</div>
        </div>
      </main>
    </div>
  );
}
