// src/components/pages/Step5Smutthan.tsx
'use client';

import React, { useMemo } from 'react';
import { useCase } from '@/context/CaseContext';
import AppShell from '@/components/AppShell';
import { evaluateSmutthan } from '@/lib/smutthanEngine';
import { BookOpen, Sparkles } from 'lucide-react';

export default function Step5Smutthan() {
  const { setCurrentStep, patientCase, updateCase } = useCase();

  // คำนวณสมุฏฐาน 4 แบบ Real-time จากข้อมูลใน patientCase
  const evaluation = useMemo(() => evaluateSmutthan(patientCase), [patientCase]);

  const handleProceedToFormula = () => {
    updateCase({
      smutthanResult: {
        primaryElement: evaluation.primaryElement,
        confidence: evaluation.confidence,
        reasons: evaluation.reasons,
        citations: evaluation.citations,
      },
    });
    setCurrentStep('S6');
  };

  return (
    <AppShell
      title="วิเคราะห์สมุฏฐาน 4"
      subtitle="ขั้นตอนที่ 3–5 ตามตำรา: วิเคราะห์อาการ → หาสาเหตุ → พิจารณาฤดู อายุ และเวลา (คำนวณจริงด้วย Deterministic Rule Engine)"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* การ์ดสมุฏฐาน 4 ด้าน */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {evaluation.cards.map((card) => (
            <div key={card.dimension} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-[11px] text-gray-500 font-semibold">{card.dimension}</span>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                    card.isMatch
                      ? 'bg-[#EAF3EE] text-[#1E4D38]'
                      : 'bg-[#FDF0D5] text-[#9A6B1F]'
                  }`}
                >
                  {card.badge}
                </span>
              </div>
              <h3 className="font-extrabold text-base text-[#14261D] mt-2">{card.title}</h3>
              <p className="text-xs text-gray-600 mt-1">{card.detail}</p>
              <p className="text-[11px] text-[#1E4D38] font-medium mt-4 underline cursor-pointer">
                {card.citationText}
              </p>
            </div>
          ))}
        </div>

        {/* การ์ดสรุปคะแนนความมั่นใจและเหตุผล */}
        <div className="space-y-4">
          <div className="bg-[#1E4D38] text-white p-5 rounded-2xl shadow-sm">
            <span className="text-xs text-[#B2C5BB]">ผลประเมินโดยรวม (Rule Engine)</span>
            <h3 className="text-lg font-bold text-[#E5C483] mt-1">
              แนวโน้ม{evaluation.primaryElement === 'ลม' ? 'วาโยธาตุ' : evaluation.primaryElement}แปรปรวน
            </h3>
            <p className="text-xs text-gray-200 mt-2">
              ความสอดคล้องของปัจจัย {evaluation.matchedCount} จาก 4 ด้าน
            </p>
            <div className="w-full bg-teal-950 rounded-full h-2.5 mt-3 overflow-hidden">
              <div
                className="bg-[#E5C483] h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${evaluation.confidence}%` }}
              />
            </div>
            <p className="text-right text-xs text-[#E5C483] mt-1.5 font-bold">
              ความมั่นใจ {evaluation.confidence}%
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 text-xs">
            <h4 className="font-bold text-[#7A5214] flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> เหตุผลประกอบตามคัมภีร์
            </h4>
            <ul className="list-disc pl-4 space-y-1.5 text-gray-700 leading-relaxed">
              {evaluation.reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
            <p className="text-[10px] text-gray-400 mt-3">
              ข้อมูลสนับสนุนการตัดสินใจ แพทย์เป็นผู้ยืนยันผลขั้นสุดท้าย (Human-in-the-loop)
            </p>
            <button
              onClick={() => alert('เตรียมเชื่อมต่อ Modal ภาพสแกนตำราจริงในหัวข้อที่ 4–5')}
              className="mt-3 w-full py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 flex items-center justify-center gap-1.5 cursor-pointer transition"
            >
              <BookOpen className="w-3.5 h-3.5" /> ดูอ้างอิงตำรา ({evaluation.citations.length} รายการ)
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep('S4')}
          className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold cursor-pointer transition"
        >
          ← ย้อนกลับ
        </button>
        <button
          onClick={handleProceedToFormula}
          className="px-5 py-2.5 bg-[#1E4D38] hover:bg-[#163B2B] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
        >
          เลือกตำรับยา / รสยา →
        </button>
      </div>
    </AppShell>
  );
}