// src/components/page/InteractionAlert.tsx
'use client';

import React from 'react';
import { useCase } from '@/context/CaseContext';
import AppShell from '@/components/AppShell';
import { checkHerbDrugInteraction } from '@/lib/herbDrugGuard';
import { AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function Step7InteractionAlert() {
  const { setCurrentStep, patientCase, updateCase } = useCase();

  const currentRx = patientCase.prescriptions[0] || {
    herbName: 'ยาขมิ้นชัน (แคปซูล)',
    dosage: '2 แคปซูล วันละ 4 ครั้ง หลังอาหารและก่อนนอน',
    rasa: 'ฝาด เผ็ดร้อน',
  };

  const medsToCheck = patientCase.currentMeds || [];

  const checkResult = checkHerbDrugInteraction(currentRx.herbName, medsToCheck);

  const handleSwitchToSafeAlternative = () => {
    updateCase({
      prescriptions: [
        {
          herbName: 'หัตถการ: ประคบสมุนไพรบริเวณท้องและคอบ่าหลัง',
          rasa: 'หัตถการภายนอก',
          dosage: 'ประคบสมุนไพร 45 นาที สัปดาห์ละ 2 ครั้ง',
          interactionRisk: 'NONE',
          interactionDetail: 'ปลอดภัย ไม่เกิดอันตรกิริยากับยาต้านการแข็งตัวของเลือด',
        },
      ],
    });
    setCurrentStep('S8');
  };

  const handleProceedOriginal = () => {
    setCurrentStep('S8');
  };

  return (
    <AppShell title="ตรวจความปลอดภัยของยา">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* คอลัมน์ซ้าย (2 ส่วน): ผลการตรวจสอบ */}
        <div className="md:col-span-2">
          {checkResult.hasConflict ? (
            <div className="bg-[#FEE2E2]/60 border-2 border-[#EF4444] p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#B91C1C] font-bold text-base">
                  <AlertTriangle className="w-5 h-5 text-[#B91C1C]" />
                  พบความเสี่ยงอันตรกิริยา ({checkResult.riskLevel})
                </div>
                <span className="bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  ควรระวัง / ห้ามจ่ายร่วม
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#FECACA] mt-4 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-500 text-[10px]">สมุนไพรที่เลือก</span>
                  <p className="font-bold text-[#14261D] text-sm mt-0.5">{checkResult.matchedHerb}</p>
                </div>
                <span className="text-[#B91C1C] font-bold text-base">✕</span>
                <div>
                  <span className="text-gray-500 text-[10px]">ยาประจำตัวของผู้ป่วย</span>
                  <p className="font-bold text-[#B91C1C] text-sm mt-0.5">{checkResult.matchedDrug}</p>
                </div>
              </div>

              <p className="text-xs text-[#7F1D1D] mt-4 leading-relaxed font-semibold">
                ผลที่อาจเกิดขึ้น: {checkResult.effect}
              </p>
              <p className="text-xs text-[#991B1B] mt-2 leading-relaxed">
                คำแนะนำ: {checkResult.recommendedAction}
              </p>
            </div>
          ) : (
            <div className="bg-[#EAF3EE] border-2 border-[#1E4D38] p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#1E4D38] font-bold text-base">
                  <CheckCircle2 className="w-5 h-5 text-[#1E4D38]" />
                  ไม่พบความเสี่ยงอันตรกิริยาระดับรุนแรง
                </div>
                <span className="bg-[#1E4D38] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  ปลอดภัย
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#CBD5E1] mt-4 space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-500">ตำรับยา / หัตถการ:</span>
                  <span className="font-bold text-[#14261D] text-sm">{currentRx.herbName}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-500">ขนาดและวิธีใช้:</span>
                  <span className="font-semibold text-gray-800">{currentRx.dosage}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">ยาประจำตัวที่ตรวจ:</span>
                  <span className="font-medium text-gray-700">
                    {medsToCheck.length > 0 ? medsToCheck.join(', ') : 'ไม่มียาประจำตัวที่มีความเสี่ยง'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#1E4D38] mt-4 leading-relaxed font-semibold">
                ไม่พบอันตรกิริยาระหว่างสมุนไพรที่เลือกกับยาประจำตัวของผู้ป่วย
              </p>
            </div>
          )}
        </div>

        {/* คอลัมน์ขวา (1 ส่วน): ทางเลือกและการตัดสินใจของแพทย์ */}
        <div className="space-y-3">
          {checkResult.hasConflict ? (
            <>
              <h4 className="font-bold text-xs text-[#14261D]">ทางเลือกเพื่อความปลอดภัย</h4>
              <button
                type="button"
                onClick={handleSwitchToSafeAlternative}
                className="w-full text-left bg-[#F4F8F5] border-2 border-[#1E4D38] p-4 rounded-xl hover:bg-[#EAF3EE] cursor-pointer transition shadow-2xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-[#14261D]">เปลี่ยนเป็นหัตถการประคบสมุนไพร</span>
                  <span className="bg-[#1E4D38] text-white text-[10px] font-bold px-2 py-0.5 rounded">แนะนำ</span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1.5 leading-relaxed">
                  ไม่เกิดอันตรกิริยากับ {checkResult.matchedDrug}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep('S6')}
                className="w-full text-left bg-white border border-gray-200 p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition"
              >
                <span className="font-bold text-xs text-gray-800">เลือกตำรับยาอื่น</span>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  กลับไปเปลี่ยนตำรับยาหรือปรับแผนการรักษา
                </p>
              </button>
            </>
          ) : (
            <>
              <h4 className="font-bold text-xs text-[#14261D]">สถานะความปลอดภัย</h4>
              <div className="bg-white border border-gray-200 p-4 rounded-xl space-y-2 text-xs shadow-xs">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>ผ่านเกณฑ์ความปลอดภัย</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  สามารถสั่งจ่าย <strong>{currentRx.herbName}</strong> ได้ตามปกติ
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep('S6')}
                className="w-full text-left bg-white border border-gray-200 p-3.5 rounded-xl hover:bg-gray-50 cursor-pointer transition text-xs"
              >
                <span className="font-bold text-gray-700 block">เปลี่ยนตำรับยา</span>
                <span className="text-[11px] text-gray-500">ย้อนกลับไปเปลี่ยนตำรับหรือขนาดยา</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200/60">
        <button
          type="button"
          onClick={() => setCurrentStep('S6')}
          className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold cursor-pointer transition"
        >
          ← ย้อนกลับ
        </button>

        {checkResult.hasConflict ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleProceedOriginal}
              className="px-4 py-2 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold cursor-pointer transition"
            >
              ยืนยันจ่ายยาเดิม
            </button>
            <button
              type="button"
              onClick={handleSwitchToSafeAlternative}
              className="px-5 py-2.5 bg-[#1E4D38] hover:bg-[#163B2B] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
            >
              ใช้ทางเลือก: ประคบสมุนไพร <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleProceedOriginal}
            className="px-5 py-2.5 bg-[#1E4D38] hover:bg-[#163B2B] active:scale-98 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
          >
            ยืนยันแผนการรักษา <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </AppShell>
  );
}
