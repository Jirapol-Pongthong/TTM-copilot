// src/components/page/FormulaRasa.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useCase } from '@/context/CaseContext';
import AppShell from '@/components/AppShell';
import formulas from '@/data/formulas.json';
import { checkHerbDrugInteraction } from '@/lib/herbDrugGuard';
import { getCitationDetails, KnowledgeChunk } from '@/lib/ragService';
import { Search, Sparkles, Check, Info, BookOpen, X, CheckCircle2 } from 'lucide-react';

interface TasteInfo {
  name: string;
  properties: string;
  targetElement: 'ลม' | 'ไฟ' | 'น้ำ' | 'ดิน';
  isPrimary?: boolean;
}

const ALL_TASTES: TasteInfo[] = [
  { name: 'ฝาด', properties: 'สมานแผล คุมธาตุ แก้ท้องร่วง', targetElement: 'ดิน' },
  { name: 'หวาน', properties: 'ซึมซาบผิวหนัง บำรุงเนื้อ บำรุงกำลัง', targetElement: 'ดิน' },
  { name: 'เมาเบื่อ', properties: 'แก้พิษโลหิต แก้ปวดเมื่อยเส้นเอ็นและข้อ', targetElement: 'ลม' },
  { name: 'ขม', properties: 'แก้ไข้ ดับพิษร้อน บำรุงน้ำดี เจริญอาหาร', targetElement: 'ไฟ' },
  { name: 'เผ็ดร้อน', properties: 'ขับลม กระจายลม แก้อืดเฟ้อ แน่นจุกเสียด บำรุงไฟย่อย', targetElement: 'ลม' },
  { name: 'มัน', properties: 'บำรุงเส้นเอ็น บำรุงไขข้อ คลายอาการขัดยอก', targetElement: 'ดิน' },
  { name: 'หอมเย็น', properties: 'บำรุงหัวใจ ชูกำลัง ดับพิษร้อน แก้กระหาย', targetElement: 'ไฟ' },
  { name: 'เค็ม', properties: 'ฟอกโลหิต ละลายเมือกมัน ขับเสมหะ', targetElement: 'น้ำ' },
  { name: 'เปรี้ยว', properties: 'กัดเสมหะ ฟอกโลหิต แก้ไอ ระบายอุจจาระ', targetElement: 'น้ำ' },
];

export default function Step6FormulaRasa() {
  const { setCurrentStep, patientCase, updateCase } = useCase();

  // ดึงธาตุหลักที่ได้รับการวินิจฉัยจากหน้า S5 (หรือ default เป็น ลม)
  const primaryElement = patientCase.smutthanResult?.primaryElement || 'ลม';

  const defaultFormulaForElement = useMemo(() => {
    const symptomsStr = [
      ...(patientCase.extractedSymptoms?.chiefComplaint || []),
      patientCase.rawNote || '',
    ].join(' ').toLowerCase();

    let best = formulas[0];
    let bestScore = -1;

    for (const f of formulas) {
      let score = f.targetElement === primaryElement ? 10 : 0;
      const tokens = f.indication.toLowerCase().split(/[\s,+/]+/);
      for (const t of tokens) {
        if (t.length >= 3 && symptomsStr.includes(t)) score += 5;
      }
      if (score > bestScore) {
        bestScore = score;
        best = f;
      }
    }
    return best;
  }, [primaryElement, patientCase]);

  const [selectedId, setSelectedId] = useState<string>(defaultFormulaForElement.id);
  const selectedFormula = formulas.find((f) => f.id === selectedId) || defaultFormulaForElement;
  const [dosage, setDosage] = useState<string>(selectedFormula.defaultDosage);

  useEffect(() => {
    setSelectedId(defaultFormulaForElement.id);
    setDosage(defaultFormulaForElement.defaultDosage);
  }, [defaultFormulaForElement]);

  // Modal สำหรับเปิดดูหลักฐานตำราอ้างอิงจริง (RAG Citation Modal)
  const [selectedChunk, setSelectedChunk] = useState<KnowledgeChunk | null>(null);
  const [isCitationModalOpen, setIsCitationModalOpen] = useState(false);

  const handleOpenCitation = (bookName: string, pageNumber?: number) => {
    const chunk = getCitationDetails(bookName, pageNumber);
    if (chunk) {
      setSelectedChunk(chunk);
    } else {
      setSelectedChunk({
        id: 'REF_GENERAL',
        book: bookName,
        page: pageNumber || 1,
        image: pageNumber ? `/scans/page_${pageNumber}.jpg` : undefined,
        chapter: 'บทอ้างอิงตำรับยาและเภสัชกรรมไทย',
        content: `ข้อมูลอ้างอิงจาก ${bookName} หน้า ${pageNumber || '–'} สอดคล้องตามประกาศบัญชียาหลักแห่งชาติด้านสมุนไพรและคัมภีร์เวชกรรมไทย`,
        tags: ['เภสัชกรรมไทย', 'ตำรับยา', 'รสยา'],
      });
    }
    setIsCitationModalOpen(true);
  };

  // Search & Filter สำหรับรายการตำรับยา
  const [formulaSearch, setFormulaSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'MATCH' | 'ORAL' | 'PROCEDURE'>('ALL');

  // ตรวจหารสยาที่เป็นเป้าหมายตรงกับสมุฏฐานของผู้ป่วยรายนี้
  const highlightedTasteNames = useMemo(() => {
    switch (primaryElement) {
      case 'ลม':
        return ['เผ็ดร้อน', 'เมาเบื่อ'];
      case 'ไฟ':
        return ['ขม', 'หอมเย็น'];
      case 'น้ำ':
        return ['เปรี้ยว', 'เค็ม'];
      case 'ดิน':
        return ['ฝาด', 'มัน'];
      default:
        return ['เผ็ดร้อน', 'เมาเบื่อ'];
    }
  }, [primaryElement]);

  const handleSelectFormula = (id: string) => {
    setSelectedId(id);
    const found = formulas.find((f) => f.id === id);
    if (found) setDosage(found.defaultDosage);
  };

  const handleCheckDrugSafety = () => {
    // ดึงรายการยาประจำตัวผู้ป่วยจาก CaseContext
    const medsToCheck = patientCase.currentMeds || [];

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

    setCurrentStep('S7');
  };

  // กรองรายการยาตามการค้นหาและตัวกรอง พร้อมเรียงลำดับตำรับที่ตรงสมุฏฐานขึ้นก่อนเสมอ
  const filteredFormulas = useMemo(() => {
    const filtered = formulas.filter((item) => {
      // Filter Category
      if (filterCategory === 'MATCH' && item.targetElement !== primaryElement) return false;
      if (filterCategory === 'ORAL' && item.herbName.includes('หัตถการ')) return false;
      if (filterCategory === 'PROCEDURE' && !item.herbName.includes('หัตถการ')) return false;

      // Search Query
      const q = formulaSearch.trim().toLowerCase();
      if (!q) return true;
      return (
        item.herbName.toLowerCase().includes(q) ||
        item.indication.toLowerCase().includes(q) ||
        item.rasa.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });

    const symptomsStr = [
      ...(patientCase.extractedSymptoms?.chiefComplaint || []),
      patientCase.rawNote || '',
    ].join(' ').toLowerCase();

    return [...filtered].sort((a, b) => {
      let scoreA = a.targetElement === primaryElement ? 15 : 0;
      let scoreB = b.targetElement === primaryElement ? 15 : 0;

      const aTokens = a.indication.toLowerCase().split(/[\s,+/]+/);
      const bTokens = b.indication.toLowerCase().split(/[\s,+/]+/);

      for (const t of aTokens) {
        if (t.length >= 3 && symptomsStr.includes(t)) scoreA += 5;
      }
      for (const t of bTokens) {
        if (t.length >= 3 && symptomsStr.includes(t)) scoreB += 5;
      }

      return scoreB - scoreA;
    });
  }, [formulaSearch, filterCategory, primaryElement, patientCase]);

  return (
    <AppShell
      title="เลือกตำรับยา / รสยา"
      subtitle="ขั้นตอนที่ 6 ตามตำรา: เลือกรสยาและตำรับที่ตรงกับสมุฏฐาน · แพทย์แผนไทยเป็นผู้เลือกและปรับขนาดยาเอง"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* คอลัมน์ซ้าย: การ์ดรสยา 9 รส และคำอธิบายความสัมพันธ์กับสมุฏฐาน */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-xs text-[#14261D]">
                รสยา 9 รส ที่สัมพันธ์กับสมุฏฐาน
              </h4>
              <span className="text-[10px] bg-[#EAF3EE] text-[#1E4D38] px-2 py-0.5 rounded-full font-bold">
                {primaryElement === 'ลม'
                  ? 'วาโยธาตุ'
                  : primaryElement === 'ไฟ'
                  ? 'เตโชธาตุ'
                  : primaryElement === 'น้ำ'
                  ? 'อาโปธาตุ'
                  : 'ปถวีธาตุ'}
              </span>
            </div>

            {/* ตาราง 9 รสยา */}
            <div className="grid grid-cols-3 gap-1.5 text-xs text-center">
              {ALL_TASTES.map((taste) => {
                const isHighlight = highlightedTasteNames.includes(taste.name);
                return (
                  <div
                    key={taste.name}
                    title={`${taste.name}: ${taste.properties}`}
                    className={`p-2 rounded-xl border text-[11px] font-semibold transition-all select-none ${
                      isHighlight
                        ? 'bg-[#FDF0D5] border-[#E5C483] text-[#7A5214] ring-1 ring-[#C08A3E] shadow-2xs'
                        : 'bg-gray-50 border-gray-200 text-gray-600 opacity-80'
                    }`}
                  >
                    <div>{isHighlight ? `★ ${taste.name}` : taste.name}</div>
                    <span className="text-[9px] block text-gray-400 font-normal mt-0.5">
                      {taste.targetElement}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* คำอธิบายชัดเจน: ไฮไลต์ (★) คืออะไร */}
            <div className="mt-4 pt-3 border-t border-gray-100 bg-[#FFFDF9] -mx-2 -mb-2 p-3 rounded-xl border border-[#F3E2BD]">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#C08A3E] shrink-0 mt-0.5" />
                <div className="text-[11px] text-[#7A5214] leading-relaxed">
                  <strong className="block font-bold">★ ที่ Highlight สีทอง คืออะไร?</strong>
                  คือ <strong>รสยาเป้าหมาย (Target Rasa)</strong> ที่คัมภีร์สรรพคุณเภสัชระบุว่าใช้บำบัด{' '}
                  <span className="underline font-bold">
                    {primaryElement === 'ลม'
                      ? 'วาโยธาตุ (ขับลม คลายกล้ามเนื้อเส้นเอ็น)'
                      : primaryElement === 'ไฟ'
                      ? 'เตโชธาตุ (แก้ไข้ ดับพิษร้อน)'
                      : primaryElement === 'น้ำ'
                      ? 'อาโปธาตุ (กัดเสมหะ แก้ไอ)'
                      : 'ปถวีธาตุ (สมานแผล บำรุงเอ็นข้อ)'}
                  </span>{' '}
                  ซึ่งเป็นธาตุหลักที่แปรปรวนในเคสนี้
                </div>
              </div>
            </div>
          </div>

          {/* การ์ดทฤษฎีอ้างอิงเภสัชกรรมไทย */}
          <div className="bg-[#FAF9F5] border border-gray-200 p-4 rounded-2xl text-xs space-y-2">
            <h4 className="font-bold text-[#14261D] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#1E4D38]" />
              หลักเภสัชกรรมไทย (สมุฏฐาน 4 → รสยา)
            </h4>
            <p className="text-gray-600 text-[11px] leading-relaxed">
              &quot;รสยาเป็นหัวใจของการปรุงยาไทย ยารสร้อนขับลม ยารสขมแก้ไข้ ยารสเปรี้ยวแก้เสมหะ&quot;
              ระบบช่วยคำนวณรสยาที่สอดคล้องกับพยาธิสภาพเพื่อให้แพทย์พิจารณาจ่ายยาได้อย่างแม่นยำ
            </p>
          </div>
        </div>

        {/* คอลัมน์ขวา: รายการตำรับยาและการค้นหา */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h4 className="font-bold text-xs text-[#14261D]">
                ตัวเลือกตำรับยาและหัตถการ (คลิกเพื่อเลือกและตรวจอันตรกิริยา)
              </h4>
              <span className="text-[11px] text-gray-400">
                พบ {filteredFormulas.length} รายการ
              </span>
            </div>

            {/* ช่องค้นหาตำรับยา & ฟิลเตอร์ */}
            <div className="flex flex-wrap items-center gap-2 mb-3.5">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formulaSearch}
                  onChange={(e) => setFormulaSearch(e.target.value)}
                  placeholder="ค้นหาชื่อยา สรรพคุณ หรือรสยา..."
                  className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E4D38]"
                />
              </div>

              {/* หมวดหมู่ตัวกรอง */}
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setFilterCategory('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    filterCategory === 'ALL'
                      ? 'bg-[#1E4D38] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('MATCH')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    filterCategory === 'MATCH'
                      ? 'bg-[#1E4D38] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  ตรงสมุฏฐาน ({primaryElement})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('PROCEDURE')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    filterCategory === 'PROCEDURE'
                      ? 'bg-[#1E4D38] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  หัตถการภายนอก
                </button>
              </div>
            </div>

            {/* รายการตัวเลือกตำรับยา */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredFormulas.map((item) => {
                const isSelected = item.id === selectedId;
                const isMatchingElement = item.targetElement === primaryElement;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectFormula(item.id)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#1E4D38] bg-[#F4F8F5] shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#1E4D38] bg-[#1E4D38]' : 'border-gray-400'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                        </span>
                        <span className="font-bold text-xs text-[#14261D]">{item.herbName}</span>
                        <span className="bg-[#EAF3EE] text-[#1E4D38] text-[10px] px-2 py-0.5 rounded font-bold">
                          {item.category}
                        </span>
                        {isMatchingElement && (
                          <span className="bg-[#FDF0D5] text-[#9A6B1F] text-[10px] px-1.5 py-0.5 rounded font-semibold whitespace-nowrap shrink-0">
                            ตรงสมุฏฐาน
                          </span>
                        )}
                      </div>
                      <span className="bg-[#FDF0D5] text-[#7A5214] text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0">
                        {item.rasa}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mt-1.5 pl-5.5 leading-relaxed">
                      {item.indication}
                    </p>

                    <div className="flex items-center justify-between mt-2 pl-5.5 text-[10px]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCitation(item.citation.book, item.citation.page);
                        }}
                        className="text-[#1E4D38] hover:text-[#163B2B] hover:underline font-semibold flex items-center gap-1 cursor-pointer transition"
                      >
                        <BookOpen className="w-3 h-3 text-[#1E4D38]" />
                        <span>อ้างอิง: [{item.citation.book} หน้า {item.citation.page}]</span>
                      </button>
                      {item.contraindication && (
                        <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                          {item.contraindication}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ช่องปรับขนาดและวิธีใช้ */}
            <div className="mt-4 pt-3.5 border-t border-gray-100 text-xs">
              <label className="font-bold text-[#14261D] block mb-1">
                ขนาดและวิธีใช้ (แพทย์แผนไทยปรับแก้ได้ตามดุลยพินิจ)
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-slate-900 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#1E4D38]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200/60">
        <button
          type="button"
          onClick={() => setCurrentStep('S5')}
          className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold cursor-pointer transition"
        >
          ← ย้อนกลับไปหน้าสมุฏฐาน
        </button>
        <button
          type="button"
          onClick={handleCheckDrugSafety}
          className="px-5 py-2.5 bg-[#1E4D38] hover:bg-[#163B2B] active:scale-98 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
        >
          ตรวจความปลอดภัยอันตรกิริยาของยา →
        </button>
      </div>

      {/* Modal ภาพสแกนและข้อความตำราจริง (Textbook Citation Modal สำหรับหน้า S6) */}
      {isCitationModalOpen && selectedChunk && (
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
                onClick={() => setIsCitationModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-md transition cursor-pointer"
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
                  <CheckCircle2 className="w-3.5 h-3.5" /> ตรวจสอบเทียบเคียงคลังตำราแล้ว
                </span>
              </div>

              <div className="bg-[#F9F8F4] p-4 rounded-xl border border-[#E5E0D8] text-gray-800 leading-relaxed italic">
                &ldquo;{selectedChunk.content}&rdquo;
              </div>

              {/* ภาพสแกนหน้าตำราจริงจาก public/scans/ */}
              {Boolean(selectedChunk.image || [12, 34, 58, 91, 103].includes(selectedChunk.page)) && (
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <div className="text-[10px] text-gray-600 font-semibold px-3 py-1.5 bg-gray-100 flex items-center justify-between border-b border-gray-200">
                    <span>เอกสารสแกนฉบับทางการ (Digital Archive)</span>
                    <span className="text-[#1E4D38] font-bold">
                      {selectedChunk.image || `/scans/page_${selectedChunk.page}.jpg`}
                    </span>
                  </div>
                  <div className="max-h-56 overflow-y-auto p-2 flex justify-center bg-gray-200/40">
                    <img
                      src={selectedChunk.image || `/scans/page_${selectedChunk.page}.jpg`}
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
                onClick={() => setIsCitationModalOpen(false)}
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
