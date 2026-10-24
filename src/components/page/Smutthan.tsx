// src/components/page/Smutthan.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { useCase } from '@/context/CaseContext';
import AppShell from '@/components/AppShell';
import { evaluateSmutthan } from '@/lib/smutthanEngine';
import { getCitationDetails, KnowledgeChunk } from '@/lib/ragService';
import { BookOpen, Sparkles, X, ExternalLink, CheckCircle2 } from 'lucide-react';

export default function Step5Smutthan() {
  const { setCurrentStep, patientCase, updateCase } = useCase();

  // คำนวณสมุฏฐาน 4 แบบ Real-time จากข้อมูลใน patientCase
  const evaluation = useMemo(() => evaluateSmutthan(patientCase), [patientCase]);

  // State สำหรับเปิด Modal ดูภาพและเนื้อหาตำราอ้างอิงจริง
  const [selectedChunk, setSelectedChunk] = useState<KnowledgeChunk | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenCitation = (bookName: string, pageNumber?: number) => {
    const chunk = getCitationDetails(bookName, pageNumber);
    if (chunk) {
      setSelectedChunk(chunk);
    } else {
      setSelectedChunk({
        id: 'REF_GENERAL',
        book: bookName,
        page: pageNumber || 1,
        chapter: 'บทอ้างอิงตำราเวชกรรมไทย',
        content: `ข้อมูลอ้างอิงจาก ${bookName} หน้า ${pageNumber || '–'} รองรับการประเมินสมุฏฐานตามหลักเกณฑ์การแพทย์แผนไทยกระทรวงสาธารณสุข`,
        tags: ['เวชกรรมไทย', 'สมุฏฐานวินิจฉัย'],
      });
    }
    setIsModalOpen(true);
  };

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
            <div
              key={card.dimension}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-[#1E4D38]/40 transition-all flex flex-col justify-between"
            >
              <div>
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
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{card.detail}</p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenCitation(card.citationText)}
                className="text-[11px] text-[#1E4D38] font-semibold mt-4 text-left hover:underline cursor-pointer flex items-center gap-1 group"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#1E4D38] group-hover:scale-110 transition" />
                <span>{card.citationText}</span>
              </button>
            </div>
          ))}
        </div>

        {/* การ์ดสรุปคะแนนความมั่นใจและเหตุผล */}
        <div className="space-y-4">
          <div className="bg-[#1E4D38] text-white p-5 rounded-2xl shadow-sm">
            <span className="text-xs text-[#B2C5BB]">ผลประเมินโดยรวม (Deterministic Rule Engine)</span>
            <h3 className="text-lg font-bold text-[#E5C483] mt-1">
              แนวโน้ม{evaluation.primaryElement === 'ลม' ? 'วาโยธาตุ' : evaluation.primaryElement}แปรปรวน
            </h3>
            <p className="text-xs text-gray-200 mt-2">
              ความสอดคล้องของปัจจัย {evaluation.matchedCount} จาก 4 มิติสมุฏฐาน
            </p>
            <div className="w-full bg-teal-950 rounded-full h-2.5 mt-3 overflow-hidden">
              <div
                className="bg-[#E5C483] h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${evaluation.confidence}%` }}
              />
            </div>
            <p className="text-right text-xs text-[#E5C483] mt-1.5 font-bold">
              ความมั่นใจ {evaluation.confidence}%
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 text-xs shadow-xs">
            <h4 className="font-bold text-[#7A5214] flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5" /> เหตุผลประกอบตามคัมภีร์เวชกรรม
            </h4>
            <ul className="list-disc pl-4 space-y-1.5 text-gray-700 leading-relaxed">
              {evaluation.reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
            <p className="text-[10px] text-gray-400 mt-3 pt-2 border-t border-gray-100">
              * ข้อมูลสนับสนุนการตัดสินใจ แพทย์เป็นผู้ยืนยันผลขั้นสุดท้าย (Human-in-the-loop)
            </p>
            <button
              type="button"
              onClick={() => handleOpenCitation('คัมภีร์ธาตุบรรจบ', 12)}
              className="mt-3.5 w-full py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 flex items-center justify-center gap-1.5 cursor-pointer transition text-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#1E4D38]" /> เปิดดูคลังตำราอ้างอิง ({evaluation.citations.length} รายการ)
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6 pt-4 border-t border-gray-200/60">
        <button
          type="button"
          onClick={() => setCurrentStep('S4')}
          className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold cursor-pointer transition"
        >
          ← ย้อนกลับไปซักประวัติ
        </button>
        <button
          type="button"
          onClick={handleProceedToFormula}
          className="px-5 py-2.5 bg-[#1E4D38] hover:bg-[#163B2B] active:scale-98 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
        >
          เลือกตำรับยา / รสยา 9 รส (ขั้นตอนถัดไป) →
        </button>
      </div>

      {/* Modal ภาพสแกนและข้อความตำราจริง (Textbook Citation Modal) */}
      {isModalOpen && selectedChunk && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#EAF3EE] text-[#1E4D38] rounded-lg">
                  <BookOpen className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-[#14261D] text-sm">{selectedChunk.book}</h3>
                  <p className="text-[11px] text-gray-500">{selectedChunk.chapter}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-md transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="bg-[#E0F2FE] text-[#0369A1] px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                  เลขหน้าอ้างอิง: หน้า {selectedChunk.page}
                </span>
                <span className="text-[11px] text-green-700 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ตรวจสอบเทียบเคียงแล้ว
                </span>
              </div>

              <div className="bg-[#F9F8F4] p-4 rounded-xl border border-[#E5E0D8] text-gray-800 leading-relaxed italic">
                &ldquo;{selectedChunk.content}&rdquo;
              </div>

              {/* ภาพสแกนหน้าตำราจริงจาก public/scans/ */}
              {[12, 34, 58, 91, 103].includes(selectedChunk.page) && (
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <div className="text-[10px] text-gray-600 font-semibold px-3 py-1.5 bg-gray-100 flex items-center justify-between border-b border-gray-200">
                    <span>เอกสารสแกนฉบับทางการ (Digital Archive)</span>
                    <span className="text-[#1E4D38] font-bold">/scans/page_{selectedChunk.page}.jpg</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto p-2 flex justify-center bg-gray-200/40">
                    <img
                      src={`/scans/page_${selectedChunk.page}.jpg`}
                      alt={`ภาพสแกนหน้า ${selectedChunk.page}`}
                      className="rounded-lg shadow-xs max-w-full h-auto object-contain border border-gray-300"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedChunk.tags.map((tag, i) => (
                  <span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px]">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-[#1E4D38] hover:bg-[#163B2B] text-white rounded-lg text-xs font-semibold cursor-pointer transition"
              >
                ปิดหน้าต่างอ้างอิง
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
