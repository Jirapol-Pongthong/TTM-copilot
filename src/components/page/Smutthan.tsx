// src/components/page/Smutthan.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { useCase } from '@/context/CaseContext';
import AppShell from '@/components/AppShell';
import { evaluateSmutthan } from '@/lib/smutthanEngine';
import { getCitationDetails, KnowledgeChunk } from '@/lib/ragService';
import { BookOpen, Sparkles, X, CheckCircle2, Eye, Activity, Calculator } from 'lucide-react';

export default function Step5Smutthan() {
  const { setCurrentStep, patientCase, updateCase } = useCase();

  // คำนวณสมุฏฐาน 4 เชิงปริมาณแบบ Real-time จากข้อมูลใน patientCase
  const evaluation = useMemo(() => evaluateSmutthan(patientCase), [patientCase]);

  // State สำหรับเปิด Modal ดูภาพและเนื้อหาตำราอ้างอิงจริง
  const [selectedChunk, setSelectedChunk] = useState<KnowledgeChunk | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ปรับระดับความปวด VAS (1–10) แบบ Real-time จากหน้าวิเคราะห์สมุฏฐานได้ทันที
  const handleChangeVasScore = (newScore: number) => {
    updateCase({
      extractedSymptoms: {
        ...patientCase.extractedSymptoms,
        painScore: newScore,
      },
    });
  };

  const handleOpenCitation = (bookName: string, pageNumber?: number) => {
    let cleanBook = bookName.replace(/^อ้างอิง:\s*/, '').trim();
    let parsedPage = pageNumber;
    const pageMatch = cleanBook.match(/\(น\.(\d+)\)/);
    if (!parsedPage && pageMatch) {
      parsedPage = parseInt(pageMatch[1], 10);
    }
    cleanBook = cleanBook.replace(/\(น\.\d+\).*/, '').trim();

    const chunk = getCitationDetails(cleanBook, parsedPage);
    if (chunk) {
      setSelectedChunk(chunk);
    } else {
      setSelectedChunk({
        id: 'REF_GENERAL',
        book: cleanBook,
        page: parsedPage || 1,
        image: parsedPage ? `/scans/page_${parsedPage}.jpg` : undefined,
        chapter: 'บทอ้างอิงตำราเวชกรรมไทย',
        content: `ข้อมูลอ้างอิงจาก ${cleanBook} หน้า ${parsedPage || '–'} รองรับการประเมินสมุฏฐานตามหลักเกณฑ์การแพทย์แผนไทยกระทรวงสาธารณสุข`,
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
        concordanceLevel: evaluation.concordanceLevel,
        matchedCount: evaluation.matchedCount,
        vasScore: evaluation.vasScore,
        symptomWeight: evaluation.symptomWeight,
        doshaScores: {
          vata: evaluation.doshaScores.vata,
          pitta: evaluation.doshaScores.pitta,
          semha: evaluation.doshaScores.semha,
          maxPossible: evaluation.doshaScores.maxPossible,
        },
        reasons: evaluation.reasons,
        citations: evaluation.citations,
      },
    });
    setCurrentStep('S6');
  };

  const elementFullLabel =
    evaluation.primaryElement === 'ลม'
      ? 'วาโยธาตุ (วาตะสมุฏฐาน)'
      : evaluation.primaryElement === 'ไฟ'
      ? 'เตโชธาตุ (ปิตตะสมุฏฐาน)'
      : evaluation.primaryElement === 'น้ำ'
      ? 'อาโปธาตุ (เสมหะสมุฏฐาน)'
      : 'ปถวีธาตุ (ธาตุดิน)';

  return (
    <AppShell
      title="วิเคราะห์สมุฏฐาน 4 เชิงปริมาณ (Dosha Quantification Model)"
      subtitle="ขั้นตอนที่ 3–5 ตามตำรา: ประเมินดัชนีตรีโทษเชิงปริมาณด้วยโมเดลถ่วงน้ำหนัก AHP & Delphi Method ร่วมกับสเกลความรุนแรง VAS (1–10)"
    >
      {/* แถบควบคุมสเกลวัดระดับความปวด/ความรุนแรง (VAS 1–10) เพื่อจำลองและคำนวณน้ำหนักอาการ (+1.0 ถึง +5.0) แบบ Real-time */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-[#EAF3EE] text-[#1E4D38] rounded-xl">
            <Activity className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#14261D]">
                สเกลวัดระดับความปวด / ความรุนแรงของผู้ป่วย (VAS Scale 1–10):
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#1E4D38] text-[#E5C483]">
                VAS {evaluation.vasScore}/10 → น้ำหนักอาการสำคัญ +{evaluation.symptomWeight.toFixed(1)} คะแนน
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              คลิกปรับระดับความปวด (1–10) เพื่อดูการเปลี่ยนแปลงของค่าน้ำหนักอาการ (+1.0 ถึง +5.0) และดัชนีสมุฏฐานแบบ Real-time
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const active = evaluation.vasScore === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => handleChangeVasScore(num)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer flex flex-col items-center justify-center border ${
                  active
                    ? 'bg-[#1E4D38] text-[#E5C483] border-[#1E4D38] ring-2 ring-[#E5C483]/50 shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-[#EAF3EE] hover:text-[#1E4D38]'
                }`}
                title={`ระดับความปวด ${num}/10 (น้ำหนัก +${Math.max(1.0, Number((num * 0.5).toFixed(1))).toFixed(1)})`}
              >
                <span>{num}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* คอลัมน์ซ้าย (2 ส่วน): การ์ดสมุฏฐาน 4 ด้าน + ตารางสรุปโครงสร้างการให้คะแนน */}
        <div className="md:col-span-2 space-y-5">
          {/* การ์ดสมุฏฐาน 4 ด้าน */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {evaluation.cards.map((card) => (
              <div
                key={card.dimension}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-[#1E4D38]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[11px] text-gray-500 font-semibold">{card.dimension}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-extrabold bg-[#1E4D38] text-[#E5C483]">
                        {card.weightBadge}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          card.isMatch
                            ? 'bg-[#EAF3EE] text-[#1E4D38]'
                            : 'bg-[#FDF0D5] text-[#9A6B1F]'
                        }`}
                      >
                        {card.badge}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-extrabold text-base text-[#14261D] mt-2">{card.title}</h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{card.detail}</p>
                  <p className="text-[11px] text-[#5C7065] bg-[#F4F7F5] px-2.5 py-1.5 rounded-lg mt-2.5 border border-[#DCE5DF]">
                    <strong className="text-[#1E4D38]">เหตุผลเชิงวิทยาสุขภาพ:</strong> {card.healthScienceRationale}
                  </p>
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

          {/* ตารางสรุปโครงสร้างการให้คะแนน (Scoring Rule Summary Table) */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1.5 bg-[#EAF3EE] text-[#1E4D38] rounded-lg">
                <Calculator className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-bold text-sm text-[#14261D]">
                  สรุปโครงสร้างการให้คะแนนเชิงปริมาณ (Scoring Rule Summary)
                </h4>
                <p className="text-[11px] text-gray-500">
                  อ้างอิงกระบวนการแปลงทฤษฎีการแพทย์แผนไทยด้วยเทคนิค AHP (Analytic Hierarchy Process) และ Delphi Method
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600 bg-gray-50/80">
                    <th className="py-2.5 px-3 font-bold">ปัจจัยสมุฏฐาน</th>
                    <th className="py-2.5 px-3 font-bold">ที่มาในคัมภีร์ / ทฤษฎี</th>
                    <th className="py-2.5 px-3 font-bold">ธาตุที่ได้รับผล</th>
                    <th className="py-2.5 px-3 font-bold">น้ำหนักที่กำหนด (Weight)</th>
                    <th className="py-2.5 px-3 font-bold">เหตุผลเชิงวิทยาสุขภาพ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {evaluation.scoringSummaryTable.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/60">
                      <td className="py-2.5 px-3 font-bold text-[#14261D] whitespace-nowrap">{row.factor}</td>
                      <td className="py-2.5 px-3 text-gray-600">{row.scriptureRef}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF3EE] text-[#1E4D38] whitespace-nowrap">
                          {row.targetDosha}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-extrabold text-[#1E4D38] whitespace-nowrap">{row.weight}</td>
                      <td className="py-2.5 px-3 text-gray-600">{row.rationale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3.5 bg-[#FFFDF7] border border-[#E8DFC9] rounded-xl p-3 text-[11px] text-[#5C4922] leading-relaxed">
              💡 <strong>หลักการโมเดลคณิตศาสตร์:</strong> ตัวเลข <strong>+2.0</strong> (Primary Factor ~40%) และ{' '}
              <strong>+1.5</strong> (Secondary Factors ~30%) คือ <em>&ldquo;ตัวคูณน้ำหนัก (Weights)&rdquo;</em>{' '}
              ที่ถอดสัดส่วนความสำคัญตามลำดับขั้นของคัมภีร์เวชศึกษาและสมุฏฐานวินิจฉัย เมื่อนำมารวมกับสเกลความรุนแรงของอาการจริง{' '}
              <strong>VAS 1–10 (+1.0 ถึง +5.0)</strong> จะได้ฐานคะแนนเต็ม <strong>10.0 คะแนน</strong>{' '}
              โดยไม่เอนเอียงไปที่ปัจจัยใดปัจจัยหนึ่งมากเกินไป (Normalized Weighted Scoring)
            </div>
          </div>
        </div>

        {/* คอลัมน์ขวา (1 ส่วน): การ์ดสรุปผลการประเมินดัชนีตรีโทษเชิงปริมาณ */}
        <div className="space-y-4">
          <div className="bg-[#1E4D38] text-white p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-[#B2C5BB] font-medium tracking-wide">
                ดัชนีสมุฏฐานเชิงปริมาณ
              </span>
              <span className="text-[11px] font-extrabold bg-[#E5C483] text-[#14261D] px-2.5 py-0.5 rounded-full shadow-xs">
                {evaluation.concordanceLevel}
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#E5C483] mt-2">
              แนวโน้ม{elementFullLabel}เด่นชัด
            </h3>
            <p className="text-xs text-gray-200 mt-1 leading-relaxed">
              {evaluation.concordanceDescription}
            </p>

            {/* หลอดคะแนนดัชนีตรีโทษ (วาตะ / ปิตตะ / เสมหะ) เต็ม 10.0 คะแนน */}
            <div className="mt-4 pt-3.5 border-t border-teal-800/60 space-y-2.5">
              <div className="text-[11px] font-bold text-[#E5C483] flex justify-between">
                <span>คะแนนสะสมรายธาตุ (เต็ม 10.0 คะแนน):</span>
                <span>รวม {evaluation.doshaScores.totalAccumulated.toFixed(1)} แต้ม</span>
              </div>

              {/* วาตะ (ลม) */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-gray-200 font-medium">วาตะสมุฏฐาน (ธาตุลม)</span>
                  <span className="font-bold text-[#E5C483]">
                    {evaluation.doshaScores.vata.toFixed(1)} / 10.0 ({evaluation.doshaPercentages.vata}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-teal-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#E5C483] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (evaluation.doshaScores.vata / 10) * 100)}%` }}
                  />
                </div>
              </div>

              {/* ปิตตะ (ไฟ) */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-gray-200 font-medium">ปิตตะสมุฏฐาน (ธาตุไฟ)</span>
                  <span className="font-bold text-amber-300">
                    {evaluation.doshaScores.pitta.toFixed(1)} / 10.0 ({evaluation.doshaPercentages.pitta}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-teal-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (evaluation.doshaScores.pitta / 10) * 100)}%` }}
                  />
                </div>
              </div>

              {/* เสมหะ (น้ำ) */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-gray-200 font-medium">เสมหะสมุฏฐาน (ธาตุน้ำ)</span>
                  <span className="font-bold text-sky-300">
                    {evaluation.doshaScores.semha.toFixed(1)} / 10.0 ({evaluation.doshaPercentages.semha}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-teal-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (evaluation.doshaScores.semha / 10) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* แสดงสถานะ 4 มิติสมุฏฐานตามแนวทางเวชกรรมปฐมภูมิ พ.ศ. 2564 */}
            <div className="mt-4 pt-3 border-t border-teal-800/60">
              <div className="flex items-center justify-between text-[11px] text-gray-300 mb-2">
                <span>ความสอดคล้อง 4 มิติสมุฏฐาน:</span>
                <span className="font-bold text-[#E5C483]">{evaluation.matchedCount} / 4 มิติ</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {evaluation.cards.map((c, i) => (
                  <div
                    key={i}
                    className={`text-center py-1.5 px-1 rounded-lg text-[10px] font-medium transition-all ${
                      c.isMatch
                        ? 'bg-[#E5C483] text-[#14261D] font-bold shadow-xs'
                        : 'bg-teal-900/80 text-gray-300 border border-teal-700/50'
                    }`}
                  >
                    <div className="truncate">{c.dimension.split(' ')[0].replace('สมุฏฐาน', '')}</div>
                    <div className="text-[9px] opacity-90 mt-0.5">
                      +{c.weightValue.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2.5 border-t border-teal-800/60 flex items-center justify-between gap-2">
                <div className="text-[10px] text-[#B2C5BB] flex items-center gap-1.5 opacity-90 truncate">
                  <BookOpen className="w-3.5 h-3.5 text-[#E5C483] shrink-0" />
                  <span className="truncate">อ้างอิง: แนวทางเวชกรรมปฐมภูมิ 2564 (น. 89–91)</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenCitation(
                      'แนวทางปฏิบัติเวชกรรมไทยในการดูแลผู้ป่วยในหน่วยบริการปฐมภูมิ',
                      90
                    )
                  }
                  className="px-2 py-1 bg-[#E5C483] hover:bg-[#d8b56f] text-[#14261D] rounded-md font-bold text-[10px] flex items-center gap-1 cursor-pointer transition shadow-xs shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" /> เปิดดูเอกสาร
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 text-xs shadow-xs">
            <h4 className="font-bold text-[#7A5214] flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5" /> รายละเอียดการคำนวณคะแนนตามคัมภีร์
            </h4>
            <ul className="list-disc pl-4 space-y-1.5 text-gray-700 leading-relaxed">
              {evaluation.reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
            <p className="text-[10px] text-gray-400 mt-3 pt-2 border-t border-gray-100">
              * อ้างอิง: คู่มือแนวทางการตรวจวินิจฉัยด้วยสมุฏฐานวินิจฉัย สภาการแพทย์แผนไทย และโมเดล Dosha Quantification
            </p>
            <button
              type="button"
              onClick={() =>
                handleOpenCitation(
                  evaluation.citations[0]?.book || 'คัมภีร์ธาตุบรรจบ',
                  evaluation.citations[0]?.page || 12
                )
              }
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

            {evaluation.citations.length > 1 && (
              <div className="flex flex-wrap gap-1.5 mt-3 pb-2 border-b border-gray-100">
                {evaluation.citations.map((cit, idx) => {
                  const isActive =
                    selectedChunk.book.includes(cit.book) && selectedChunk.page === cit.page;
                  return (
                    <button
                      key={`${cit.book}-${cit.page}-${idx}`}
                      type="button"
                      onClick={() => handleOpenCitation(cit.book, cit.page)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition ${
                        isActive
                          ? 'bg-[#1E4D38] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cit.book} (น.{cit.page})
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="bg-[#E0F2FE] text-[#0369A1] px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                    เลขหน้าอ้างอิง: หน้า {selectedChunk.page}
                  </span>
                  {selectedChunk.book.includes('ปฐมภูมิ') && (
                    <div className="flex gap-1 ml-1">
                      {[89, 90, 91].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() =>
                            handleOpenCitation(
                              'แนวทางปฏิบัติเวชกรรมไทยในการดูแลผู้ป่วยในหน่วยบริการปฐมภูมิ',
                              p
                            )
                          }
                          className={`text-[9px] px-2 py-0.5 rounded font-semibold cursor-pointer transition ${
                            selectedChunk.page === p
                              ? 'bg-[#0369A1] text-white font-bold'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          น.{p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-green-700 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ตรวจสอบเทียบเคียงแล้ว
                </span>
              </div>

              {selectedChunk.image && (
                <div className="bg-gray-900 rounded-xl p-2 border border-gray-200 max-h-64 overflow-y-auto flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedChunk.image}
                    alt={`${selectedChunk.book} หน้า ${selectedChunk.page}`}
                    className="max-h-60 w-auto object-contain rounded shadow-sm bg-white"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/scans/page_12.jpg';
                    }}
                  />
                </div>
              )}

              <div className="bg-[#FAF8F5] border border-[#E8DFC9] p-3.5 rounded-xl text-gray-700 leading-relaxed">
                <p className="font-semibold text-[#14261D] mb-1">ข้อความอ้างอิงจากคัมภีร์:</p>
                <p>&ldquo;{selectedChunk.content}&rdquo;</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-[#1E4D38] text-white rounded-lg text-xs font-bold hover:bg-[#163B2B] cursor-pointer transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
