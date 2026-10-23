// src/components/pages/Step7InteractionAlert.tsx
'use client';

import React from 'react';
import { useCase } from '@/context/CaseContext';
import AppShell from '@/components/AppShell';
import { checkHerbDrugInteraction } from '@/lib/herbDrugGuard';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Step7InteractionAlert() {
  const { setCurrentStep, patientCase, updateCase } = useCase();

  const currentRx = patientCase.prescriptions[0] || {
    herbName: 'ยาขมิ้นชัน (แคปซูล)',
    dosage: '2 แคปซูล วันละ 4 ครั้ง หลังอาหารและก่อนนอน',
  };

  const medsToCheck =
    patientCase.currentMeds.length > 0
      ? patientCase.currentMeds
      : ['Metformin 500mg', 'Warfarin 3mg', 'Aspirin 81mg'];

  const checkResult = checkHerbDrugInteraction(currentRx.herbName, medsToCheck);

  // ฟังก์ชันสลับเป็นทางเลือกที่ปลอดภัยทันที (หัตถการประคบสมุนไพร)
  const handleSwitchToSafeAlternative = () => {
    updateCase({
      prescriptions: [
        {
          herbName: 'หัตถการ: ประคบสมุนไพรบริเวณท้องและคอบ่าหลัง',
          rasa: 'หัตถการภายนอก (ไม่ใช้ยากิน)',
          dosage: 'ประคบสมุนไพร 45 นาที สัปดาห์ละ 2 ครั้ง',
          interactionRisk: 'NONE',
          interactionDetail: 'ปลอดภัย ไม่เกิดอันตรกิริยากับยาต้านการแข็งตัวของเลือด',
        },
      ],
    });
    setCurrentStep('S8');
  };

  return (
    <AppShell
      title="ตรวจความปลอดภัยของยา"
      subtitle="Herb-Drug Guard · ตรวจสมุนไพรที่เลือกเทียบกับยาแผนปัจจุบันที่ผู้ป่วยใช้อยู่จากฐานข้อมูลที่ผ่านการตรวจสอบ"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                คำแนะนำทางคลินิก: {checkResult.recommendedAction}
              </p>
              <p className="text-[10px] text-[#991B1B]/80 mt-4">
                การแจ้งเตือนนี้มาจากการตรวจด้วยฐานข้อมูลและกฎ (Deterministic Check) ไม่ใช่การคาดเดาของ LLM · แพทย์เป็นผู้ตัดสินใจสุดท้าย
              </p>
            </div>
          ) : (
            <div className="bg-[#EAF3EE] border-2 border-[#1E4D38] p-6 rounded-2xl">
              <div className="flex items-center gap-2 text-[#1E4D38] font-bold text-base">
                <CheckCircle2 className="w-5 h-5" />
                ไม่พบความเสี่ยงอันตรกิริยาระดับรุนแรง (PASSED)
              </div>
              <p className="text-xs text-gray-700 mt-3 leading-relaxed">
                รายการที่เลือก: <strong>{currentRx.herbName}</strong> มีความปลอดภัยเมื่อใช้ร่วมกับยาประจำตัวของผู้ป่วยรายนี้
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-xs text-[#14261D]">ทางเลือกที่แนะนำ</h4>
          <button
            onClick={handleSwitchToSafeAlternative}
            className="w-full text-left bg-[#F4F8F5] border-2 border-[#1E4D38] p-4 rounded-xl hover:bg-[#EAF3EE] cursor-pointer transition"
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-[#14261D]">เปลี่ยนเป็นหัตถการประคบสมุนไพร</span>
              <span className="bg-[#1E4D38] text-white text-[10px] font-bold px-2 py-0.5 rounded">แนะนำ</span>
            </div>
            <p className="text-[11px] text-gray-600 mt-1">
              บรรเทาท้องอืดและปวดตึงโดยไม่ใช้ยากิน ไม่เกิดอันตรกิริยากับ Warfarin / Aspirin
            </p>
          </button>

          <button
            onClick={() => setCurrentStep('S6')}
            className="w-full text-left bg-white border border-gray-200 p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition"
          >
            <span className="font-bold text-xs text-gray-800">กลับไปปรับเป็นตำรับอื่น (หน้า S6)</span>
            <p className="text-[11px] text-gray-500 mt-1">
              กลับไปเลือกตำรับอื่น เช่น ยาธาตุบรรจบ หรือปรับแผนการรักษาเอง
            </p>
          </button>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep('S6')}
          className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold cursor-pointer transition"
        >
          ← กลับไปปรับตำรับ
        </button>
        <button
          onClick={checkResult.hasConflict ? handleSwitchToSafeAlternative : () => setCurrentStep('S8')}
          className="px-5 py-2.5 bg-[#1E4D38] hover:bg-[#163B2B] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
        >
          {checkResult.hasConflict ? 'ใช้ทางเลือก: ประคบสมุนไพร →' : 'ยืนยันแผนการรักษา →'}
        </button>
      </div>
    </AppShell>
  );
}