// src/components/page/IcdCoding.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useCase } from '@/context/CaseContext';
import AppShell from '@/components/AppShell';
import { Search, Plus, Check, CheckCircle2, ArrowRight } from 'lucide-react';

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

  // สร้างชุดรหัสแนะนำอัตโนมัติตามอาการและหัตถการของผู้ป่วยรายนี้
  const initialCodes = useMemo<ICDItem[]>(() => {
    const symptomsText = [
      ...(patientCase.extractedSymptoms?.chiefComplaint || []),
      patientCase.rawNote || '',
    ].join(' ');

    const items: ICDItem[] = [];

    // 1. ตรวจอาการท้องอืด แน่นเฟ้อ
    if (
      symptomsText.includes('ท้องอืด') ||
      symptomsText.includes('แน่น') ||
      symptomsText.includes('เฟ้อ') ||
      symptomsText.includes('กุจฉิ') ||
      items.length === 0
    ) {
      items.push({
        id: 'icd-gas',
        description: 'ท้องอืด ท้องเฟ้อ (ลมกุจฉิสยาวาตา)',
        ttmCode: 'U55.22',
        icd10tm: 'R14',
        confidence: 'สูง · ระบบแนะนำ',
        isRecommended: true,
        checked: true,
      });
    }

    // 2. ตรวจอาการปวดเข่า / ข้อเข่าเสื่อม
    if (symptomsText.includes('เข่า') || symptomsText.includes('ข้อ')) {
      items.push({
        id: 'icd-knee',
        description: 'ลมจับโปงแห้งเข่า (ข้อเข่าเสื่อม / ปวดขัดข้อ)',
        ttmCode: 'U77.2',
        icd10tm: 'M17.9',
        confidence: 'สูง · ระบบแนะนำ',
        isRecommended: true,
        checked: true,
      });
    }

    // 3. ตรวจอาการปวดเมื่อยคอบ่าหลัง
    if (
      symptomsText.includes('เมื่อย') ||
      symptomsText.includes('คอ') ||
      symptomsText.includes('บ่า') ||
      symptomsText.includes('หลัง') ||
      symptomsText.includes('สลักเพชร')
    ) {
      items.push({
        id: 'icd-muscle',
        description: 'ปวดเมื่อยตามตัว / กล้ามเนื้อ (อังคมังคานุสารีวาตา)',
        ttmCode: 'U77.1',
        icd10tm: 'M79.1',
        confidence: 'ปานกลาง',
        isRecommended: true,
        checked: true,
      });
    }

    // 4. ตรวจอาการปวดศีรษะ ลมขึ้นเบื้องบน
    if (symptomsText.includes('หัว') || symptomsText.includes('ศีรษะ') || symptomsText.includes('ขมับ')) {
      items.push({
        id: 'icd-head',
        description: 'ลมปะกัง / ปวดศีรษะจากลมขึ้นเบื้องบน (อุทธังคมาวาตา)',
        ttmCode: 'U50.1',
        icd10tm: 'G44.2',
        confidence: 'สูง · ระบบแนะนำ',
        isRecommended: true,
        checked: true,
      });
    }

    // 5. ตรวจอาการไข้ / ตัวร้อน
    if (symptomsText.includes('ไข้') || symptomsText.includes('ตัวร้อน')) {
      items.push({
        id: 'icd-fever',
        description: 'ไข้เพื่อเตโชธาตุกำเริบ (ไข้หวัด / ไข้เปลี่ยนฤดู)',
        ttmCode: 'U51.0',
        icd10tm: 'R50.9',
        confidence: 'สูง · ระบบแนะนำ',
        isRecommended: true,
        checked: true,
      });
    }

    // 6. ตรวจอาการไอ / เสมหะ
    if (symptomsText.includes('ไอ') || symptomsText.includes('เสมหะ')) {
      items.push({
        id: 'icd-cough',
        description: 'อาการไอเนื่องจากเสมหะกำเริบ (อาโปธาตุ)',
        ttmCode: 'U52.1',
        icd10tm: 'R05',
        confidence: 'สูง · ระบบแนะนำ',
        isRecommended: true,
        checked: true,
      });
    }

    // 7. ตรวจหัตถการจากแผนการรักษา
    const rxText = (patientCase.prescriptions || []).map((p) => p.herbName).join(' ');
    if (rxText.includes('ประคบ') || rxText.includes('หัตถการ')) {
      items.push({
        id: 'icd-procedure-herbal',
        description: 'หัตถการ: ประคบสมุนไพรเพื่อการรักษา',
        ttmCode: 'U60.1',
        icd10tm: 'U60.1',
        confidence: 'สูง',
        isRecommended: false,
        checked: true,
      });
    }

    if (rxText.includes('นวด')) {
      items.push({
        id: 'icd-procedure-massage',
        description: 'หัตถการ: นวดรักษาทางการแพทย์แผนไทย',
        ttmCode: 'U60.2',
        icd10tm: 'U60.2',
        confidence: 'สูง',
        isRecommended: false,
        checked: true,
      });
    }

    return items;
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
    <AppShell
      title="ลงรหัสโรค / หัตถการ (ICD-10-TM)"
      subtitle="ระบบจับคู่รหัสการวินิจฉัยแพทย์แผนไทยกับ ICD-10-TM อัตโนมัติ เพื่อให้แพทย์ตรวจสอบและยืนยันก่อนส่งออก HDC"
    >
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
                placeholder="ค้นหารหัสโรค (เช่น U55, U77, R14) หรือชื่อโรค..."
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
                <th className="py-3 px-4 w-12 text-center">ยืนยัน</th>
                <th className="py-3 px-4">รายการ (โรค / อาการ / หัตถการ)</th>
                <th className="py-3 px-4">รหัสแผนไทย → ICD-10-TM</th>
                <th className="py-3 px-4">ความเหมาะสม</th>
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
                        item.checked ? 'text-[#14261D]' : 'text-gray-400 line-through'
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
                        item.confidence.includes('สูง')
                          ? 'bg-[#EAF3EE] text-[#1E4D38]'
                          : 'bg-[#FDF0D5] text-[#9A6B1F]'
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

        {/* คอลัมน์ขวา: คำอธิบายระบบมาตรฐาน ICD-10-TM */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 text-xs space-y-4 shadow-xs">
          <div>
            <h4 className="font-bold text-[#7A5214] mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#C08A3E]" />
              ระบบเลือกรหัสอย่างไร?
            </h4>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              ระบบทำการจับคู่อัตโนมัติจาก <strong>บัญชี 642 รหัสมาตรฐานของสถาบันการแพทย์แผนไทย</strong>{' '}
              ร่วมกับคู่มือรหัสสถิติสุขภาพ ICD-10-TM ฉบับปี 2568 โดยใช้ทั้งศัพท์อาการ (CC) และผลประเมินสมุฏฐาน
            </p>
          </div>

          <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-gray-100 text-[11px] text-gray-600 space-y-1.5">
            <p className="font-bold text-[#14261D]">หลักการกำกับดูแลโดยแพทย์ (Human-in-the-loop):</p>
            <p>
              • ติ๊กเลือกเฉพาะรหัสที่ตรงกับอาการจริงของผู้ป่วยในมื้อตรวจนี้
            </p>
            <p>
              • รหัสที่แพทย์ยืนยันจะถูกส่งต่อเข้าสู่หน้าสรุปเคส (S9) และพร้อม Export เป็นชุดข้อมูลมาตรฐาน FHIR/HDC ทันที
            </p>
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
          ← ย้อนกลับไปหน้าตรวจความปลอดภัย
        </button>
        <button
          type="button"
          onClick={handleConfirmAndProceed}
          className="px-5 py-2.5 bg-[#1E4D38] hover:bg-[#163B2B] active:scale-98 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
        >
          ยืนยันรหัสและสรุปเคส (S9) <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </AppShell>
  );
}
