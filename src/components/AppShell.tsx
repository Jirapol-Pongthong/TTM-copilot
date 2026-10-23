
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

  // หน้า S1 (เข้าสู่ระบบ) แสดงแบบ Split Screen เต็มจอตาม Figma S1
  if (currentStep === 'S1') {
    return <div className="min-h-screen flex">{children}</div>;
  }

  const currentIdx = STEP_ORDER.indexOf(currentStep);
  const isClinicalFlow = currentIdx >= STEP_ORDER.indexOf('S4');

  return (
    <div className="min-h-screen flex bg-[#F9F8F4] text-[#1A2E25]">
      {/* Left Sidebar ตาม Figma S2 - S9 */}
      <aside className="w-60 bg-[#123123] text-white flex flex-col justify-between p-5 shrink-0">
        <div>
          <div className="mb-8 px-2">
            <h1 className="text-xl font-bold text-[#E5C483]">TTM Copilot</h1>
            <p className="text-xs text-[#9AB3A6] mt-0.5">ผู้ช่วยเวชกรรมไทย</p>
          </div>

          <nav className="space-y-1.5 text-sm">
            <button
              onClick={() => setCurrentStep('S2')}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg flex items-center gap-2 transition ${
                currentStep === 'S2' || currentStep === 'S3'
                  ? 'bg-[#1E4635] font-semibold text-white border-l-4 border-[#E5C483]'
                  : 'text-[#B2C5BB] hover:bg-[#193B2C]'
              }`}
            >
              ผู้ป่วยวันนี้
            </button>

            <button
              onClick={() => setCurrentStep('S4')}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg flex items-center gap-2 transition ${
                isClinicalFlow
                  ? 'bg-[#1E4635] font-semibold text-white border-l-4 border-[#E5C483]'
                  : 'text-[#B2C5BB] hover:bg-[#193B2C]'
              }`}
            >
              ตรวจรักษา (เคสปัจจุบัน)
            </button>

            <button className="w-full text-left px-3.5 py-2.5 rounded-lg text-[#B2C5BB] hover:bg-[#193B2C] transition">
              ฐานความรู้ตำรา
            </button>

            <button
              onClick={() => setCurrentStep('S9')}
              className="w-full text-left px-3.5 py-2.5 rounded-lg text-[#B2C5BB] hover:bg-[#193B2C] transition"
            >
              รายงาน / ส่งออก
            </button>
          </nav>
        </div>

        {/* การ์ดผู้ใช้งานด้านล่างซ้ายตาม Figma */}
        <div className="bg-[#1B3F30] rounded-xl p-3.5 text-xs">
          <p className="font-semibold text-white">แพทย์แผนไทย (ตัวอย่าง)</p>
          <p className="text-[#9AB3A6] mt-0.5">รพ.สต. ตัวอย่าง</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header + ปุ่มลัดโหลดเคสสาธิตตาม SOP-TTM-003 หัวข้อที่ 1 */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#14261D]">{title}</h2>
              <p className="text-sm text-[#5C7065] mt-0.5">{subtitle}</p>
            </div>

            <button
              onClick={loadDemoCase}
              className="flex items-center gap-1.5 bg-[#FDF0D5] hover:bg-[#F9E3B4] border border-[#E5C483] text-[#7A5214] font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              โหลดเคสสาธิต (นางสมศรี 58 ปี)
            </button>
          </div>

          {/* แถบข้อมูลผู้ป่วย (Patient Banner) และ 6-Step Stepper แสดงเฉพาะหน้า S4 - S9 ตาม Figma */}
          {isClinicalFlow && (
            <>
              <div className="bg-[#F2F6F3] border border-[#DCE5DF] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 mb-4 text-xs">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-bold text-sm text-[#14261D]">
                    {patientCase.name || 'คุณสมศรี ใจดี'}
                  </span>
                  <span className="text-[#5C7065]">
                    {patientCase.gender === 'M' ? 'ชาย' : 'หญิง'} {patientCase.age || 58} ปี · HN{' '}
                    {patientCase.hn || '00-12345'}
                  </span>
                  <span className="bg-[#FCECD2] text-[#9A6B1F] font-semibold px-2.5 py-0.5 rounded-full">
                    {patientCase.underlyingDiseases[0] || 'เบาหวานชนิดที่ 2'}
                  </span>
                  <span className="bg-white border border-[#DCE5DF] text-[#3A4F43] px-2.5 py-0.5 rounded-full">
                    ยาประจำ: {patientCase.currentMeds.length > 0 ? patientCase.currentMeds.join(', ') : 'Metformin, Warfarin'}
                  </span>
                </div>
                <span className="text-[#6E8277]">ข้อมูลตัวอย่าง (สมมติ)</span>
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
                        className="flex items-center gap-2 text-xs font-medium focus:outline-none"
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                            isCompleted
                              ? 'bg-[#1E4D38] text-white'
                              : isCurrent
                              ? 'bg-[#B8862D] text-white'
                              : 'bg-[#D5DFD9] text-[#5C7065]'
                          }`}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5" /> : item.number}
                        </span>
                        <span
                          className={
                            isCurrent
                              ? 'font-bold text-[#14261D]'
                              : isCompleted
                              ? 'text-[#1E4D38]'
                              : 'text-[#6E8277]'
                          }
                        >
                          {item.label}
                        </span>
                      </button>

                      {idx < CLINICAL_STEPS.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-3 ${
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

          {/* พื้นที่สำหรับวาง Component ของแต่ละหน้าจอ S2 - S9 */}
          <div>{children}</div>
        </div>
      </main>
    </div>
  );
}