// src/components/pages/Step6FormulaRasa.tsx
'use client';

import React, { useState } from 'react';
import { useCase } from '@/context/CaseContext';
import AppShell from '@/components/AppShell';
import formulas from '@/data/formulas.json';
import { checkHerbDrugInteraction } from '@/lib/herbDrugGuard';

export default function Step6FormulaRasa() {
  const { setCurrentStep, patientCase, updateCase } = useCase();
  const [selectedId, setSelectedId] = useState<string>(formulas[0].id);
  const selectedFormula = formulas.find((f) => f.id === selectedId) || formulas[0];
  const [dosage, setDosage] = useState<string>(selectedFormula.defaultDosage);

  const handleSelectFormula = (id: string) => {
    setSelectedId(id);
    const found = formulas.find((f) => f.id === id);
    if (found) setDosage(found.defaultDosage);
  };

  const handleCheckDrugSafety = () => {
    // ตรวจสอบกับฐานข้อมูล interactions.json จริง
    const medsToCheck =
      patientCase.currentMeds.length > 0
        ? patientCase.currentMeds
        : ['Metformin 500mg', 'Warfarin 3mg', 'Aspirin 81mg'];

    const checkResult = checkHerbDrugInteraction(selectedFormula.herbName, medsToCheck);

    updateCase({
      prescriptions: [
        {
          herbName: selectedFormula.herbName,
          rasa: selectedFormula.rasa,
          dosage,
          interactionRisk: checkResult.riskLevel,
          interactionDetail: checkResult.effect,
          alternativeAction: checkResult.recommendedAction,
          citation: selectedFormula.citation,
        },
      ],
    });

    // ตาม SOP-TTM-003 หัวข้อ 2: หากพบ CRITICAL/MODERATE ให้แสดงหน้าแจ้งเตือน S7 ทันที
    setCurrentStep('S7');
  };

  return (
    <AppShell
      title="เลือกตำรับยา / รสยา"
      subtitle="ขั้นตอนที่ 6 ตามตำรา: เลือกตำรับยาที่เหมาะสมกับสมุฏฐานและผู้ป่วยรายนี้ · แพทย์เป็นผู้เลือกและปรับเอง"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* การ์ดรสยา 9 รส */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200">
            <h4 className="font-bold text-xs text-[#14261D] mb-3">รสยา 9 รส ที่สัมพันธ์กับสมุฏฐาน</h4>
            <div className="grid grid-cols-3 gap-1.5 text-xs text-center">
              {['ฝาด', 'หวาน', 'เมาเบื่อ', 'ขม', '★ เผ็ดร้อน', 'มัน', 'หอมเย็น', 'เค็ม', 'เปรี้ยว'].map((r) => (
                <span
                  key={r}
                  className={`p-2 rounded-lg border text-[11px] font-semibold ${
                    r.includes('เผ็ดร้อน') || r.includes('เมาเบื่อ')
                      ? 'bg-[#FDF0D5] border-[#E5C483] text-[#7A5214]'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  {r}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-gray-600 mt-3 leading-relaxed">
              รสร้อน/เผ็ดร้อน และรสสุขุม แก้โรคทางวาโยธาตุ (ลมกำเริบ)
            </p>
          </div>

          <div className="bg-[#FFFBF2] border border-[#F3E2BD] p-4 rounded-2xl text-xs">
            <h4 className="font-bold text-[#7A5214] mb-1">✦ เหตุผลที่ระบบแนะนำ</h4>
            <p className="text-gray-700 leading-relaxed">
              ผลประเมินพบวาโยธาตุแปรปรวน จึงแนะนำตำรับรสร้อน/เผ็ดร้อนเพื่อขับลม หรือตำรับคลายเส้นและหัตถการประคบสมุนไพร
            </p>
          </div>
        </div>

        {/* รายการตำรับยาจาก src/data/formulas.json */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200">
            <h4 className="font-bold text-xs text-[#14261D] mb-3">
              ตัวเลือกตำรับยาและหัตถการ (คลิกเลือกเพื่อทดสอบระบบตรวจยาตีกัน)
            </h4>
            <div className="space-y-3">
              {formulas.map((item) => {
                const isSelected = item.id === selectedId;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectFormula(item.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#1E4D38] bg-[#F4F8F5] shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#1E4D38] bg-[#1E4D38]' : 'border-gray-400'
                          }`}
                        />
                        <span className="font-bold text-sm text-[#14261D]">{item.herbName}</span>
                        <span className="bg-[#EAF3EE] text-[#1E4D38] text-[10px] px-2 py-0.5 rounded font-bold">
                          {item.category}
                        </span>
                      </div>
                      <span className="bg-[#FDF0D5] text-[#9A6B1F] text-[11px] font-bold px-2.5 py-0.5 rounded-lg shrink-0">
                        {item.rasa}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1.5 pl-6">{item.indication}</p>
                    <p className="text-[10px] text-gray-400 mt-1 pl-6">
                      อ้างอิง: [{item.citation.book} หน้า {item.citation.page}]
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 text-xs">
              <label className="font-bold text-[#14261D]">ขนาดและวิธีใช้ (แพทย์ปรับแก้ได้)</label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5 text-slate-900 font-medium bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep('S5')}
          className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold cursor-pointer transition"
        >
          ← ย้อนกลับ
        </button>
        <button
          onClick={handleCheckDrugSafety}
          className="px-5 py-2.5 bg-[#1E4D38] hover:bg-[#163B2B] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
        >
          ตรวจความปลอดภัยของยา →
        </button>
      </div>
    </AppShell>
  );
}