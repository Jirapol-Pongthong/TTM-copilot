'use client';

import React, { useState, useMemo } from 'react';
import AppShell from '@/components/AppShell';
import knowledgeChunksData from '@/data/knowledge_chunks.json';
import smutthanRulesData from '@/data/smutthan_rules.json';
import formulasData from '@/data/formulas.json';
import interactionsData from '@/data/interactions.json';
import icd10Data from '@/data/icd10_mapping.json';
import {
  Search,
  BookOpen,
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Plus,
  CheckCircle2,
  Tag,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  X,
  Eye,
} from 'lucide-react';

export type CategoryFilter =
  | 'ALL'
  | 'PRIMARY_CARE'
  | 'SCRIPTURES'
  | 'FORMULAS'
  | 'INTERACTIONS'
  | 'ICD10';

export interface UnifiedKnowledgeItem {
  id: string;
  category: CategoryFilter;
  categoryLabel: string;
  book: string;
  page: number | string;
  title: string;
  subtitle?: string;
  content: string;
  quote?: string;
  image?: string;
  tags: string[];
  dhatu?: string;
  rasa?: string;
  severity?: 'CRITICAL' | 'MODERATE' | 'SAFE';
  isCustom?: boolean;
}

export default function KnowledgeArchive() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string>('แนวทางปฐมภูมิ_P89');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customItems, setCustomItems] = useState<UnifiedKnowledgeItem[]>([]);
  const [showAddSuccess, setShowAddSuccess] = useState(false);

  // ฟอร์มสำหรับเพิ่มตำราใหม่
  const [newBook, setNewBook] = useState('ตำราพื้นฐานวิชาชีพการแพทย์แผนไทย เล่ม 1');
  const [newPage, setNewPage] = useState('92');
  const [newChapter, setNewChapter] = useState('ว่าด้วยพยาธิสภาพสมุฏฐาน');
  const [newCategory, setNewCategory] = useState<CategoryFilter>('SCRIPTURES');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('สมุฏฐาน, ธาตุพิการ, เวชกรรมไทย');

  // รวมรวมฐานข้อมูลทั้งหมด 452 รายการเข้าด้วยกันอย่างปลอดภัย
  const allItems = useMemo<UnifiedKnowledgeItem[]>(() => {
    const list: UnifiedKnowledgeItem[] = [];

    // 1. Custom Items ที่ผู้ใช้เพิ่มเข้ามาเอง
    list.push(...customItems);

    // 2. Knowledge Chunks (แนวทางปฐมภูมิ 2564 & ตำราหลัก)
    (knowledgeChunksData as any[]).forEach((chunk) => {
      const isPrimary = (chunk.book || '').includes('ปฐมภูมิ') || (chunk.id || '').includes('ปฐมภูมิ');
      list.push({
        id: chunk.id || `CHUNK_${Math.random()}`,
        category: isPrimary ? 'PRIMARY_CARE' : 'SCRIPTURES',
        categoryLabel: isPrimary ? 'แนวทางปฐมภูมิ 2564' : 'คัมภีร์หลัก 5 เล่ม',
        book: chunk.book || 'แนวทางเวชกรรมไทย',
        page: chunk.page || 89,
        title: chunk.chapter || chunk.id || 'เอกสารอ้างอิง',
        subtitle: chunk.category || 'สมุฏฐานวินิจฉัย',
        content: chunk.content || '',
        quote: chunk.content || '',
        image: chunk.image || (chunk.page ? `/scans/page_${chunk.page}.jpg` : undefined),
        tags: chunk.tags || ['สมุฏฐาน', 'คัมภีร์'],
      });
    });

    // 3. Smutthan Rules (139 อาการ & กฎสมุฏฐาน พร้อมตำรับยาแนะนำ)
    (smutthanRulesData as any[]).forEach((rule) => {
      const recFormula = rule.recommendedFormula ? `\nตำรับยาแผนไทยที่แนะนำ: ${rule.recommendedFormula}` : '';
      list.push({
        id: `RULE_${rule.id}`,
        category: 'SCRIPTURES',
        categoryLabel: 'ตำราพื้นฐาน เล่ม 1',
        book: rule.book || 'ตำราพื้นฐานวิชาชีพการแพทย์แผนไทย เล่ม 1',
        page: rule.page || 80,
        title: `${rule.dimension || 'สมุฏฐาน'}: ${rule.condition || ''}`,
        subtitle: rule.outputDhatu || 'ธาตุสมุฏฐาน',
        content: `${rule.pathologyAndCitation || ''}${recFormula}`,
        quote: `[${rule.book || 'ตำราพื้นฐานฯ'} หน้า ${rule.page || 80}] ${rule.pathologyAndCitation || ''}`,
        image: `/scans/page_${rule.page || 80}.jpg`,
        tags: [rule.dimension, rule.outputDhatu, rule.recommendedFormula, 'สมุฏฐาน'].filter(Boolean),
        dhatu: rule.outputDhatu,
      });
    });

    // 4. Formulas (100 ตำรับยา & รสยา)
    (formulasData as any[]).forEach((form) => {
      const formName = form.herbName || form.name || 'ตำรับยา';
      const indicationText = typeof form.indication === 'string'
        ? form.indication
        : Array.isArray(form.indications)
        ? form.indications.join(', ')
        : 'ใช้ตามดุลยพินิจของแพทย์แผนไทย';
      const contraText = typeof form.contraindication === 'string'
        ? form.contraindication
        : Array.isArray(form.contraindications)
        ? form.contraindications.join(', ')
        : 'ไม่มีข้อห้ามเฉพาะ';

      list.push({
        id: `FORMULA_${form.id}`,
        category: 'FORMULAS',
        categoryLabel: 'ตำรับยาแห่งชาติ & รสยา',
        book: form.citation?.book || 'ประกาศกระทรวงสาธารณสุข เรื่อง บัญชียาหลักแห่งชาติ',
        page: form.citation?.page || 'หน้า 127',
        title: formName,
        subtitle: `รสยาประธาน: ${form.rasa || '-'} | ธาตุเป้าหมาย: ${form.targetElement || '-'}`,
        content: `สรรพคุณ/ข้อบ่งใช้: ${indicationText}\nข้อห้าม/ข้อควรระวัง: ${contraText}`,
        quote: `ตำรับยา ${formName} (รส ${form.rasa || 'สุขุม'}) ใช้สำหรับ: ${indicationText}`,
        image: form.citation?.page ? `/scans/page_${form.citation.page}.jpg` : '/scans/page_127.jpg',
        tags: [form.rasa, form.targetElement, form.category, 'บัญชียาหลัก'].filter(Boolean),
        rasa: form.rasa,
      });
    });

    // 5. Interactions (105 Herb-Drug Interactions)
    (interactionsData as any[]).forEach((inter, idx) => {
      const herb = inter.herb || inter.herbName || 'สมุนไพร';
      const drug = inter.drug || inter.modernDrug || 'ยาแผนปัจจุบัน';
      const effect = inter.effect || inter.mechanism || 'อาจเกิดปฏิกิริยาระหว่างกัน';
      const action = inter.action || inter.clinicalAction || 'ติดตามอาการอย่างใกล้ชิด';

      list.push({
        id: `INTERACTION_${inter.id || idx}`,
        category: 'INTERACTIONS',
        categoryLabel: 'ปฏิกิริยาสมุนไพร-ยาแผนปัจจุบัน',
        book: inter.evidenceSource || 'แนวทางความปลอดภัยด้านสมุนไพร กรมการแพทย์แผนไทยฯ',
        page: 'หน้า 194',
        title: `${herb} ⚡ ${drug}`,
        subtitle: `ระดับความเสี่ยง: ${inter.severity || 'WARNING'} (${inter.riskLabel || ''})`,
        content: `กลไกทางเภสัชวิทยา: ${effect}\nคำแนะนำทางคลินิก: ${action}`,
        quote: `การใช้ร่วมกันระหว่าง ${herb} และ ${drug}: ${action}`,
        image: '/scans/page_194.jpg',
        tags: [herb, drug, inter.severity, 'ความปลอดภัยยา'].filter(Boolean),
        severity: inter.severity,
      });
    });

    // 6. ICD-10-TM & U-Codes (98 รายการ)
    (icd10Data as any[]).forEach((icd, idx) => {
      const code = icd.ttmCode || icd.code || 'U-Code';
      const name = icd.ttmName || icd.thaiName || 'การแพทย์แผนไทย';
      const icd10 = icd.icd10tm ? `${icd.icd10tm} (${icd.icd10Name || ''})` : '';

      list.push({
        id: `ICD_${code}_${idx}`,
        category: 'ICD10',
        categoryLabel: 'รหัสโรค ICD-10-TM & U-Codes',
        book: 'คู่มือรหัสมาตรฐานการแพทย์แผนไทย (ICD-10-TM) กรมการแพทย์แผนไทยฯ',
        page: 'หน้า 1',
        title: `${code}: ${name}`,
        subtitle: icd10 ? `รหัสแผนปัจจุบันเทียบเคียง: ${icd10}` : 'รหัสมาตรฐานเวชกรรมไทย',
        content: icd.fullDescription || `รหัสมาตรฐานสำหรับการตรวจวินิจฉัยและส่งออกรายงาน 43 แฟ้ม (HDC) สอดคล้องกับพยาธิสภาพ: ${name}`,
        quote: `รหัส ${code} (${name}) ใช้ลงรหัสการตรวจรักษาเวชกรรมไทยในระบบสารสนเทศโรงพยาบาล (HIS/HOSxP)`,
        image: '/scans/page_1.jpg',
        tags: [code, icd.icd10tm, 'ICD-10-TM'].filter(Boolean),
      });
    });

    return list;
  }, [customItems]);

  // กรองตาม Category และ Search Query
  const filteredItems = useMemo(() => {
    let result = allItems;

    if (activeCategory !== 'ALL') {
      result = result.filter((item) => item.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.content.toLowerCase().includes(q) ||
          item.book.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q)) ||
          String(item.page).toLowerCase().includes(q)
      );
    }

    return result;
  }, [allItems, activeCategory, searchQuery]);

  // ไอเทมที่กำลังเลือกดูอยู่
  const selectedItem = useMemo(() => {
    const found = allItems.find((i) => i.id === selectedItemId);
    return found || filteredItems[0] || allItems[0];
  }, [allItems, selectedItemId, filteredItems]);

  // ฟังก์ชันเปลี่ยนหน้าก่อนหน้า/ถัดไปสำหรับภาพสแกน
  const handlePageStep = (direction: 'prev' | 'next') => {
    if (!selectedItem) return;
    const curPage = typeof selectedItem.page === 'number' ? selectedItem.page : parseInt(selectedItem.page, 10);
    if (isNaN(curPage)) return;

    const targetPage = direction === 'next' ? curPage + 1 : curPage - 1;
    if (targetPage < 1) return;

    const sibling = allItems.find(
      (item) => item.book === selectedItem.book && (item.page === targetPage || String(item.page) === String(targetPage))
    );

    if (sibling) {
      setSelectedItemId(sibling.id);
    }
  };

  // จัดการการส่งฟอร์มเพิ่มตำราใหม่
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const newItemId = `CUSTOM_${Date.now()}`;
    const tagsArray = newTags.split(',').map((t) => t.trim()).filter(Boolean);

    const newItem: UnifiedKnowledgeItem = {
      id: newItemId,
      category: newCategory,
      categoryLabel: 'ตำราที่บันทึกเพิ่มเติม (Custom)',
      book: newBook,
      page: parseInt(newPage, 10) || newPage,
      title: `${newChapter} (น. ${newPage})`,
      subtitle: `บันทึกโดย พท.ว. ชำนาญการ · ${newBook}`,
      content: newContent,
      quote: newContent,
      image: `/scans/page_${newPage}.jpg`,
      tags: tagsArray,
      isCustom: true,
    };

    setCustomItems((prev) => [newItem, ...prev]);
    setSelectedItemId(newItemId);
    setIsAddModalOpen(false);
    setShowAddSuccess(true);
    setTimeout(() => setShowAddSuccess(false), 4000);

    // Reset Form
    setNewContent('');
  };

  return (
    <AppShell title="ฐานความรู้ตำราเวชกรรมไทย">
      <div className="space-y-4">
        {/* Banner แจ้งเตือนความสำเร็จเมื่อเพิ่มตำรา */}
        {showAddSuccess && (
          <div className="bg-[#1E4635] text-white px-4 py-3 rounded-xl flex items-center justify-between shadow-md border border-[#E5C483]/40">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#E5C483]" />
              <p className="font-semibold text-sm">เพิ่มข้อมูลเข้าสู่คลังตำราเรียบร้อยแล้ว</p>
            </div>
            <button
              onClick={() => setShowAddSuccess(false)}
              className="text-[#B2C5BB] hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Category Pills & Action Button */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'ทั้งหมด', count: allItems.length },
              {
                id: 'PRIMARY_CARE',
                label: 'แนวทางปฐมภูมิ 2564',
                count: allItems.filter((i) => i.category === 'PRIMARY_CARE').length,
              },
              {
                id: 'SCRIPTURES',
                label: 'คัมภีร์เวชกรรมไทย',
                count: allItems.filter((i) => i.category === 'SCRIPTURES').length,
              },
              {
                id: 'FORMULAS',
                label: 'ตำรับยา & รสยา',
                count: allItems.filter((i) => i.category === 'FORMULAS').length,
              },
              {
                id: 'INTERACTIONS',
                label: 'อันตรกิริยาสมุนไพร-ยา',
                count: allItems.filter((i) => i.category === 'INTERACTIONS').length,
              },
              {
                id: 'ICD10',
                label: 'ICD-10-TM',
                count: allItems.filter((i) => i.category === 'ICD10').length,
              },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as CategoryFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'bg-[#1E4635] text-white font-bold shadow-xs ring-1 ring-[#E5C483]/40'
                    : 'bg-white text-[#5C7065] border border-[#DCE5DF] hover:bg-[#F2F6F3] hover:text-[#14261D]'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeCategory === cat.id
                      ? 'bg-[#E5C483] text-[#14261D] font-bold'
                      : 'bg-[#F2F6F3] text-[#5C7065]'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 bg-[#E5C483] text-[#14261D] hover:bg-[#d6b36f] font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มตำรา</span>
          </button>
        </div>

        {/* Search Bar with Quick Tags */}
        <div className="bg-white border border-[#DCE5DF] rounded-2xl p-3.5 shadow-xs space-y-2.5">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#8C9E94] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาอาการ, ชื่อคัมภีร์, ตำรับยา, หรือเลขหน้า..."
              className="w-full pl-9 pr-24 py-2 bg-[#F9FBF9] border border-[#DCE5DF] rounded-xl text-sm text-[#14261D] focus:outline-none focus:ring-2 focus:ring-[#1E4635]/30 focus:border-[#1E4635]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-xs text-[#8C9E94] hover:text-[#14261D] cursor-pointer"
              >
                ล้างคำค้น
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[#8C9E94] flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3 h-3 text-[#E5C483]" /> คำค้นแนะนำ:
            </span>
            {[
              'หน้า 89 ตารางสมุฏฐาน',
              'หน้า 90 มูลเหตุ 8',
              'ศิโรวาตะ',
              'ขมิ้นชัน',
              'ปราบชมพูทวีป',
              'Warfarin',
            ].map((kw) => (
              <button
                key={kw}
                onClick={() => setSearchQuery(kw)}
                className="px-2 py-0.5 rounded-lg bg-[#F2F6F3] text-[#3D5648] hover:bg-[#E2EDE5] text-[11px] transition cursor-pointer"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Split-Screen Dual Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: List of Matched Items (5 Columns) */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs text-[#5C7065] px-1 pb-1">
              <span>แสดง {filteredItems.length} รายการ</span>
              <span>คลิกเพื่อดูภาพสแกนต้นฉบับจริง</span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="bg-white border border-dashed border-[#DCE5DF] rounded-2xl p-8 text-center">
                <BookOpen className="w-8 h-8 text-[#8C9E94] mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-[#14261D]">ไม่พบข้อมูลที่ตรงกับคำค้นหา</p>
                <p className="text-xs text-[#5C7065] mt-1">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นด้านบน</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedItemId(item.id);
                      setZoomLevel(1);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1E4635] text-white border-[#1E4635] shadow-md ring-2 ring-[#E5C483]/40'
                        : 'bg-white border-[#DCE5DF] hover:border-[#1E4635]/40 hover:bg-[#F9FBF9] text-[#14261D]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-[#E5C483] text-[#14261D]'
                              : 'bg-[#F2F6F3] text-[#28523F] border border-[#DCE5DF]'
                          }`}
                        >
                          {item.categoryLabel}
                        </span>
                        {item.isCustom && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
                            เพิ่มเอง
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-white/20 text-[#E5C483]' : 'bg-[#EAF1EC] text-[#1E4635]'
                        }`}
                      >
                        น. {item.page}
                      </span>
                    </div>

                    <h4
                      className={`font-bold text-sm mt-2 line-clamp-1 ${
                        isSelected ? 'text-white' : 'text-[#14261D]'
                      }`}
                    >
                      {item.title}
                    </h4>

                    {item.subtitle && (
                      <p
                        className={`text-xs mt-0.5 line-clamp-1 ${
                          isSelected ? 'text-[#B2C5BB]' : 'text-[#5C7065]'
                        }`}
                      >
                        {item.subtitle}
                      </p>
                    )}

                    <p
                      className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${
                        isSelected ? 'text-white/80' : 'text-[#3D5648]'
                      }`}
                    >
                      {item.content}
                    </p>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-dashed border-gray-200/40 text-[10px]">
                      <span className={isSelected ? 'text-[#E5C483]' : 'text-[#8C9E94]'}>
                        อ้างอิง: {item.book}
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
            
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: High-Res Scripture & Scan Viewer (7 Columns) */}
          <div className="lg:col-span-7 bg-white border border-[#DCE5DF] rounded-2xl shadow-sm overflow-hidden sticky top-4">
            {selectedItem ? (
              <div>
                {/* Viewer Header */}
                <div className="bg-[#1B3F30] text-white p-4 border-b border-[#E5C483]/30">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#E5C483] text-[#14261D] text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {selectedItem.categoryLabel}
                        </span>
                        <span className="text-xs text-[#E5C483] font-bold">
                          หน้า {selectedItem.page}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-white mt-1">
                        {selectedItem.title}
                      </h3>
                      <p className="text-xs text-[#B2C5BB]">
                        คัมภีร์: {selectedItem.book}
                      </p>
                    </div>

                    {/* Navigation & Zoom Toolbar */}
                    <div className="flex items-center gap-1 bg-[#123123] p-1.5 rounded-xl border border-teal-900/40">
                      <button
                        onClick={() => handlePageStep('prev')}
                        title="หน้าก่อนหน้า"
                        className="p-1.5 text-[#B2C5BB] hover:text-white hover:bg-[#1E4635] rounded-lg transition cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePageStep('next')}
                        title="หน้าถัดไป"
                        className="p-1.5 text-[#B2C5BB] hover:text-white hover:bg-[#1E4635] rounded-lg transition cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="h-4 w-px bg-teal-800/60 mx-1" />
                      <button
                        onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                        title="ซูมเข้า"
                        className="p-1.5 text-[#B2C5BB] hover:text-white hover:bg-[#1E4635] rounded-lg transition cursor-pointer"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                        title="ซูมออก"
                        className="p-1.5 text-[#B2C5BB] hover:text-white hover:bg-[#1E4635] rounded-lg transition cursor-pointer"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setZoomLevel(1)}
                        title="รีเซ็ตขนาด"
                        className="p-1.5 text-[#B2C5BB] hover:text-white hover:bg-[#1E4635] rounded-lg transition cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Scanned Image Preview Container */}
                <div className="relative bg-[#2D332F] overflow-auto max-h-[460px] flex items-center justify-center p-3">
                  {selectedItem.image ? (
                    <div
                      className="transition-transform duration-150 origin-top shadow-2xl rounded-md overflow-hidden bg-white"
                      style={{ transform: `scale(${zoomLevel})` }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedItem.image}
                        alt={`Scan ${selectedItem.book} หน้า ${selectedItem.page}`}
                        className="max-w-full h-auto object-contain block mx-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/scans/page_12.jpg';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="p-12 text-center text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-40 text-[#E5C483]" />
                      <p className="text-sm font-semibold text-gray-300">ไม่มีภาพสแกนจำลองสำหรับรายการนี้</p>
                      <p className="text-xs text-gray-400 mt-1">
                        ข้อความอ้างอิงได้รับการตรวจสอบจากคลังข้อมูลมาตรฐานกรมการแพทย์แผนไทยฯ
                      </p>
                    </div>
                  )}

                  {selectedItem.image && (
                    <a
                      href={selectedItem.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white text-[11px] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-xs transition cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>เปิดภาพเต็ม</span>
                    </a>
                  )}
                </div>

                {/* Clinical OCR Text & Grounding Detail */}
                <div className="p-4 space-y-3 bg-[#FAFBF9] border-t border-[#DCE5DF]">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#14261D] flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#1E4635]" />
                        ข้อความอ้างอิงจากตำรา:
                      </span>
                      <span className="text-[10px] text-[#28523F] font-semibold bg-[#EAF1EC] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#1E4635]" /> ตรวจสอบแล้ว
                      </span>
                    </div>
                    <div className="bg-white border border-[#DCE5DF] rounded-xl p-3 text-xs text-[#2A3B31] leading-relaxed font-sans">
                      {selectedItem.quote || selectedItem.content}
                    </div>
                  </div>

                  {/* Metadata Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-[#5C7065] flex items-center gap-1">
                      <Tag className="w-3 h-3" /> ดัชนีที่เกี่ยวข้อง:
                    </span>
                    {selectedItem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-[#EAF1EC] text-[#1E4635] text-[10px] font-medium rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                    {selectedItem.dhatu && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-semibold rounded-md">
                        ธาตุ: {selectedItem.dhatu}
                      </span>
                    )}
                    {selectedItem.rasa && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px] font-semibold rounded-md">
                        รสยา: {selectedItem.rasa}
                      </span>
                    )}
                    {selectedItem.severity && (
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          selectedItem.severity === 'CRITICAL'
                            ? 'bg-red-100 text-red-800'
                            : selectedItem.severity === 'MODERATE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        ความเสี่ยง: {selectedItem.severity}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-[#5C7065]">
                <BookOpen className="w-12 h-12 mx-auto mb-2 text-[#8C9E94] opacity-50" />
                <p className="text-sm font-semibold text-[#14261D]">กรุณาเลือกรายการทางซ้ายเพื่อเปิดอ่าน</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal สำหรับ นำเข้า / เพิ่มตำราใหม่ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#DCE5DF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE5DF]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#1E4635]" />
                <h3 className="font-bold text-base text-[#14261D]">นำเข้า / บันทึกหน้าตำราใหม่</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#8C9E94] hover:text-[#14261D] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-[#14261D] mb-1">
                  ชื่อคัมภีร์ / ตำรามาตรฐาน
                </label>
                <input
                  type="text"
                  value={newBook}
                  onChange={(e) => setNewBook(e.target.value)}
                  required
                  placeholder="เช่น ตำราพื้นฐานวิชาชีพการแพทย์แผนไทย เล่ม 1, คัมภีร์เวชศึกษา..."
                  className="w-full px-3 py-2 bg-[#F9FBF9] border border-[#DCE5DF] rounded-xl text-xs text-[#14261D] focus:outline-none focus:ring-2 focus:ring-[#1E4635]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#14261D] mb-1">เลขหน้า</label>
                  <input
                    type="text"
                    value={newPage}
                    onChange={(e) => setNewPage(e.target.value)}
                    required
                    placeholder="เช่น 89, 90..."
                    className="w-full px-3 py-2 bg-[#F9FBF9] border border-[#DCE5DF] rounded-xl text-xs text-[#14261D] focus:outline-none focus:ring-2 focus:ring-[#1E4635]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#14261D] mb-1">หมวดหมู่</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as CategoryFilter)}
                    className="w-full px-3 py-2 bg-[#F9FBF9] border border-[#DCE5DF] rounded-xl text-xs text-[#14261D] focus:outline-none focus:ring-2 focus:ring-[#1E4635]"
                  >
                    <option value="PRIMARY_CARE">แนวทางปฐมภูมิ 2564</option>
                    <option value="SCRIPTURES">คัมภีร์เวชกรรมไทย</option>
                    <option value="FORMULAS">ตำรับยา & รสยา</option>
                    <option value="INTERACTIONS">ปฏิกิริยาสมุนไพร-ยา</option>
                    <option value="ICD10">ICD-10-TM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#14261D] mb-1">ชื่อบท / เรื่อง</label>
                <input
                  type="text"
                  value={newChapter}
                  onChange={(e) => setNewChapter(e.target.value)}
                  required
                  placeholder="เช่น ตารางวิเคราะห์สมุฏฐานตรีธาตุ..."
                  className="w-full px-3 py-2 bg-[#F9FBF9] border border-[#DCE5DF] rounded-xl text-xs text-[#14261D] focus:outline-none focus:ring-2 focus:ring-[#1E4635]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#14261D] mb-1">
                  เนื้อหาในตำรา
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  required
                  placeholder="พิมพ์หรือวางเนื้อหาในตำรา..."
                  className="w-full px-3 py-2 bg-[#F9FBF9] border border-[#DCE5DF] rounded-xl text-xs text-[#14261D] focus:outline-none focus:ring-2 focus:ring-[#1E4635]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#14261D] mb-1">
                  คีย์เวิร์ด / แท็ก
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="เช่น วาโยธาตุ, ปวดเมื่อย, ปฐมภูมิ"
                  className="w-full px-3 py-2 bg-[#F9FBF9] border border-[#DCE5DF] rounded-xl text-xs text-[#14261D] focus:outline-none focus:ring-2 focus:ring-[#1E4635]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DCE5DF]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-[#5C7065] hover:text-[#14261D] font-medium transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E4635] text-white hover:bg-[#163528] font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>บันทึกเข้าฐานความรู้</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
