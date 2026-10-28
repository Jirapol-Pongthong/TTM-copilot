// src/components/page/IcdCoding.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useCase } from '@/context/CaseContext';
import AppShell from '@/components/AppShell';
import masterIcdMappings from '@/data/icd10_mapping.json';
import { Search, CheckCircle2, ArrowRight } from 'lucide-react';

interface ICDItem {
  id: string;
  description: string;
  ttmCode: string;
  icd10tm: string;
  confidence: string;
  isRecommended: boolean;
  checked: boolean;
}

export default function Step8IcdCoding() {
  const { setCurrentStep, patientCase, updateCase } = useCase();

  // สร้างชุดรหัสจากฐานข้อมูล icd10_mapping.json โดยแนะนำอัตโนมัติตามอาการและหัตถการของผู้ป่วย
  const initialCodes = useMemo<ICDItem[]>(() => {
    const symptomsText = [
      ...(patientCase.extractedSymptoms?.chiefComplaint || []),
      patientCase.rawNote || '',
    ].join(' ').toLowerCase();

    const rxText = (patientCase.prescriptions || []).map((p) => p.herbName).join(' ').toLowerCase();

    return masterIcdMappings.map((mapping, idx) => {
      let isMatch = false;

      // ตรวจจับความสอดคล้องตามเกณฑ์ทางคลินิก
      if (mapping.ttmCode === 'U55.22') {
        isMatch = symptomsText.includes('ท้องอืด') || symptomsText.includes('แน่น') || symptomsText.includes('เฟ้อ') || symptomsText.includes('กุจฉิ') || symptomsText.includes('จุกเสียด');
      } else if (mapping.ttmCode === 'U55.10') {
        isMatch = symptomsText.includes('เมื่อย') || symptomsText.includes('คอ') || symptomsText.includes('บ่า') || symptomsText.includes('หลัง') || symptomsText.includes('กล้ามเนื้อ') || symptomsText.includes('ตึง');
      } else if (mapping.ttmCode === 'U57.31') {
        isMatch = symptomsText.includes('ไข้') || symptomsText.includes('ตัวร้อน') || symptomsText.includes('ปิตตะ') || (patientCase.vitals?.temp || 0) >= 37.5;
      } else if (mapping.ttmCode === 'U56.11') {
        isMatch = symptomsText.includes('หวัด') || symptomsText.includes('คัดจมูก') || symptomsText.includes('ไอ') || symptomsText.includes('เสมหะ') || symptomsText.includes('น้ำมูก');
      } else if (mapping.ttmCode === 'U55.21') {
        isMatch = symptomsText.includes('วิงเวียน') || symptomsText.includes('หน้ามืด') || symptomsText.includes('ตาลาย') || symptomsText.includes('ศีรษะหมุน');
      } else if (mapping.ttmCode === 'U55.30') {
        isMatch = symptomsText.includes('อัมพฤกษ์') || symptomsText.includes('อ่อนแรง') || symptomsText.includes('ชา');
      } else if (mapping.ttmCode === 'U58.12') {
        isMatch = symptomsText.includes('ท้องเสีย') || symptomsText.includes('ถ่ายเหลว') || symptomsText.includes('มูกเลือด') || symptomsText.includes('มวนท้อง');
      } else if (mapping.ttmCode === 'U55.14') {
        isMatch = symptomsText.includes('สลักเพชร') || symptomsText.includes('บั้นเอว') || symptomsText.includes('ปวดหลัง') || symptomsText.includes('เอว') || symptomsText.includes('ร้าวลงขา');
      } else if (mapping.ttmCode === 'U60.1') {
        isMatch = rxText.includes('ประคบ') || rxText.includes('หัตถการ');
      } else if (mapping.ttmCode === 'U60.2') {
        isMatch = rxText.includes('นวด');
      } else if (mapping.ttmCode === 'U60.3') {
        isMatch = rxText.includes('อบ');
      } else if (mapping.ttmCode === 'U60.4') {
        isMatch = rxText.includes('เผายา') || symptomsText.includes('กุจฉิสยา');
      } else {
        // ค้นหาอัตโนมัติจากชื่อโรคและรหัสทั้ง 98 รายการ
        const keywords = [...mapping.ttmName.split(/[\s()/→]+/), ...mapping.icd10Name.split(/[\s()/→]+/)]
          .map((k) => k.trim().toLowerCase())
          .filter((k) => k.length >= 3 && !['โรค', 'การ', 'เพื่อ', 'บำบัด', 'other', 'with', 'care'].includes(k));
        isMatch = keywords.some((kw) => symptomsText.includes(kw) || rxText.includes(kw));
      }

      // หากเป็นเคสทั่วไปที่ไม่มีอาการเด่น ให้แนะนำ U55.22 เป็นค่ามาตรฐานเริ่มต้น
      if (idx === 0 && !isMatch && !symptomsText) {
        isMatch = true;
      }

      return {
        id: mapping.id,
        description: mapping.ttmName,
        ttmCode: mapping.ttmCode,
        icd10tm: mapping.icd10tm,
        confidence: isMatch ? 'แนะนำ' : 'ตัวเลือก',
        isRecommended: isMatch,
        checked: isMatch,
      };
    }).sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0));
  }, [patientCase]);

  const [codesList, setCodesList] = useState<ICDItem[]>(initialCodes);
  const [searchTerm, setSearchTerm] = useState('');

  // ฟังก์ชันสลับการเลือก Checkbox
  const handleToggleCheck = (id: string) => {
    setCodesList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  // กรองตามคำค้นหา
  const filteredCodes = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return codesList;
    return codesList.filter(
      (item) =>
        item.description.toLowerCase().includes(q) ||
        item.ttmCode.toLowerCase().includes(q) ||
        item.icd10tm.toLowerCase().includes(q)
    );
  }, [codesList, searchTerm]);

  // ยืนยันรหัสและไปหน้า S9
  const handleConfirmAndProceed = () => {
    const selectedCodes = codesList
      .filter((item) => item.checked)
      .map((item) => ({
        ttmCode: item.ttmCode,
        icd10tm: item.icd10tm,
        description: item.description,
      }));

    updateCase({
      confirmedICD: selectedCodes,
    });

    setCurrentStep('S9');
  };

  return (
    <AppShell title="ลงรหัสโรค / หัตถการ (ICD-10-TM)">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* คอลัมน์ซ้าย (2 ส่วน): ตารางรหัสโรค */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          {/* แถบค้นหารหัส */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหารหัสโรค (เช่น U55, U57, K30) หรือชื่อโรค/หัตถการ..."
                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E4D38]"
              />
            </div>
            <span className="text-[11px] text-gray-500 font-medium shrink-0">
              เลือกแล้ว {codesList.filter((c) => c.checked).length} / {codesList.length} รายการ
            </span>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF9F5] text-gray-600 font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4 w-12 text-center">เลือก</th>
                <th className="py-3 px-4">รายการ</th>
                <th className="py-3 px-4">รหัสแผนไทย → ICD-10-TM</th>
                <th className="py-3 px-4">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCodes.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => handleToggleCheck(item.id)}
                  className={`transition cursor-pointer ${
                    item.checked ? 'bg-[#FFFDF9] hover:bg-[#FFF9EE]' : 'bg-gray-50/50 hover:bg-gray-100/60'
                  }`}
                >
                  <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleToggleCheck(item.id)}
                      className="accent-[#1E4D38] w-4 h-4 rounded cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-bold block ${
                        item.checked ? 'text-[#14261D]' : 'text-gray-400'
                      }`}
                    >
                      {item.description}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-gray-700">
                    <span className="bg-gray-100 text-[#14261D] px-2 py-0.5 rounded">
                      {item.ttmCode}
                    </span>{' '}
                    →{' '}
                    <span className="bg-emerald-50 text-[#1E4D38] px-2 py-0.5 rounded">
                      {item.icd10tm}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        item.isRecommended
                          ? 'bg-[#EAF3EE] text-[#1E4D38]'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {item.confidence}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* คอลัมน์ขวา: สรุปรหัสที่เลือก */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 text-xs space-y-3 shadow-xs h-fit">
          <h4 className="font-bold text-[#14261D] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#1E4D38]" />
            รหัสที่เลือก ({codesList.filter((c) => c.checked).length} รายการ)
          </h4>
          <div className="space-y-1.5">
            {codesList
              .filter((c) => c.checked)
              .map((c) => (
                <div
                  key={c.id}
                  className="bg-[#FAF9F5] p-2.5 rounded-xl border border-gray-100 flex items-center justify-between gap-2"
                >
                  <span className="font-medium text-[#14261D] truncate">{c.description}</span>
                  <span className="font-mono font-bold text-[#1E4D38] shrink-0">
                    {c.ttmCode} → {c.icd10tm}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200/60">
        <button
          type="button"
          onClick={() => setCurrentStep('S7')}
          className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold cursor-pointer transition"
        >
          ← ย้อนกลับ
        </button>
        <button
          type="button"
          onClick={handleConfirmAndProceed}
          className="px-5 py-2.5 bg-[#1E4D38] hover:bg-[#163B2B] active:scale-98 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
        >
          ยืนยันรหัสและสรุปเคส <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </AppShell>
  );
}
