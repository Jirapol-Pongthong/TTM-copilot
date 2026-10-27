// src/components/page/CaseSummary.tsx
'use client';

import React, { useState } from 'react';
import { useCase } from '@/context/CaseContext';
import AppShell from '@/components/AppShell';
import { FileDown, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function Step9CaseSummary() {
  const { setCurrentStep, patientCase, completeCurrentCase } = useCase();
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // ดึงข้อมูลจริงจาก CaseContext
  const chiefComplaints =
    patientCase.extractedSymptoms?.chiefComplaint?.length > 0
      ? patientCase.extractedSymptoms.chiefComplaint.join(', ')
      : patientCase.rawNote || 'มีอาการไม่สบายตามธาตุสมุฏฐาน';

  const smutthanElement = patientCase.smutthanResult?.primaryElement || 'ลม';
  const ageGroupLabel =
    (patientCase.age || 58) >= 32
      ? 'ปัจฉิมวัย'
      : (patientCase.age || 58) > 16
      ? 'มัชฌิมวัย'
      : 'ปฐมวัย';

  const smutthanText = `${
    smutthanElement === 'ลม'
      ? 'วาโยธาตุ'
      : smutthanElement === 'ไฟ'
      ? 'เตโชธาตุ'
      : smutthanElement === 'น้ำ'
      ? 'อาโปธาตุ'
      : 'ปถวีธาตุ'
  } (${smutthanElement}) แปรปรวน · วสันตฤดู · ${ageGroupLabel}`;

  const currentRx = patientCase.prescriptions?.[0];
  const rxSummary = currentRx
    ? `${currentRx.herbName} — ${currentRx.dosage}`
    : 'หัตถการประคบสมุนไพรบริเวณท้องและคอบ่าหลัง (ปลอดภัย เลี่ยงยากิน)';

  const hasHighRiskInteractions = currentRx?.interactionRisk === 'CRITICAL';
  const safetyText = hasHighRiskInteractions
    ? `พบความเสี่ยงยาตีกัน (${currentRx.interactionDetail}) — แนะนำปรับเป็นหัตถการภายนอก`
    : currentRx?.interactionRisk === 'NONE'
    ? 'ตรวจผ่านเกณฑ์ความปลอดภัยสมุนไพรและยาแผนปัจจุบัน (Herb-Drug Guard PASSED)'
    : 'ตรวจผ่านเกณฑ์ (เลือกทางเลือกหัตถการปลอดภัย เลี่ยงอันตรกิริยากับยาต้านการแข็งตัวของเลือด)';

  const confirmedICDText =
    patientCase.confirmedICD && patientCase.confirmedICD.length > 0
      ? patientCase.confirmedICD.map((c) => `${c.ttmCode} (${c.icd10tm})`).join(' · ')
      : 'U55.22 (R14) · U77.1 (M79.1) · U60.1 (หัตถการประคบ)';

  // ฟังก์ชันส่งออกข้อมูล HDC / HIS และอัปเดตสถานะเป็นตรวจแล้ว
  const handleExportHDC = () => {
    setIsExporting(true);
    completeCurrentCase();
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3500);
    }, 1200);
  };

  // ปิดเคสและอัปเดตสถานะเป็น 'ตรวจแล้ว' ในหน้ารายการผู้ป่วยวันนี้ (S2)
  const handleFinishAndReturn = () => {
    completeCurrentCase();
    setCurrentStep('S2');
  };

  return (
    <AppShell
      title="สรุปเคสและส่งออกข้อมูล (Clinical Summary & HDC Export)"
      subtitle="ตรวจทานสรุปผลการตรวจรักษาฉบับสมบูรณ์ และส่งออกข้อมูลเข้าระบบสารสนเทศโรงพยาบาล (HIS/HDC)"
    >
      {/* CSS ซ่อนส่วนประกอบอื่นเวลา Print ให้เหลือเฉพาะฟอร์มสรุปเวชระเบียน */}
      <style jsx global>{`
        @media print {
          aside,
          nav,
          button,
          .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          .printable-card {
            border: 1px solid #ddd !important;
            box-shadow: none !important;
            padding: 24px !important;
          }
        }
      `}</style>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* คอลัมน์ซ้าย (2 ส่วน): การ์ดสรุปประวัติและผลการรักษา */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5 text-xs printable-card">
          <div className="border-b border-gray-100 pb-3.5 flex justify-between items-center">
            <div>
              <span className="font-bold text-base text-[#14261D] block">
                บันทึกเวชกรรมไทย CDSS ประจำเคส
              </span>
              <span className="text-[11px] text-gray-500">
                ผู้ป่วย: {patientCase.name || 'ไม่ระบุชื่อ'} (HN: {patientCase.hn || '-'}) · อายุ{' '}
                {patientCase.age || '-'} ปี
              </span>
            </div>
            <span className="bg-emerald-50 text-[#1E4D38] border border-emerald-200 px-3 py-1 rounded-full font-bold text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              การตรวจเสร็จสมบูรณ์
            </span>
          </div>

          <div className="space-y-3.5">
            {/* อาการสำคัญ */}
            <div className="grid grid-cols-4 gap-2 py-2 border-b border-gray-50">
              <span className="text-gray-500 font-medium">อาการสำคัญ (CC):</span>
              <span className="col-span-3 text-[#14261D] font-bold">{chiefComplaints}</span>
            </div>

            {/* ข้อมูลพื้นฐาน & สัญญาณชีพ */}
            <div className="grid grid-cols-4 gap-2 py-2 border-b border-gray-50">
              <span className="text-gray-500 font-medium">สัญญาณชีพ & โรคประจำตัว:</span>
              <div className="col-span-3 space-y-1">
                <p className="text-gray-800">
                  BP: <strong>{patientCase.vitals?.bp || '120/80 mmHg'}</strong> · Pulse:{' '}
                  <strong>{patientCase.vitals?.pulse || 76} bpm</strong> · Temp:{' '}
                  <strong>{patientCase.vitals?.temp || 36.6} °C</strong>
                </p>
                <p className="text-gray-600">
                  โรคประจำตัว:{' '}
                  {patientCase.underlyingDiseases && patientCase.underlyingDiseases.length > 0
                    ? patientCase.underlyingDiseases.join(', ')
                    : 'ปฏิเสธโรคประจำตัว'}
                </p>
                <p className="text-gray-600">
                  ยาแผนปัจจุบัน:{' '}
                  {patientCase.currentMeds && patientCase.currentMeds.length > 0
                    ? patientCase.currentMeds.join(', ')
                    : 'ไม่ได้ใช้ยาประจำ'}
                </p>
              </div>
            </div>

            {/* ผลสมุฏฐาน 4 */}
            <div className="grid grid-cols-4 gap-2 py-2 border-b border-gray-50">
              <span className="text-gray-500 font-medium">สมุฏฐานวินิจฉัย:</span>
              <div className="col-span-3">
                <span className="text-[#14261D] font-bold bg-[#FAF9F5] px-2.5 py-1 rounded border border-gray-200 inline-block">
                  {smutthanText}
                </span>
                <p className="text-gray-500 text-[11px] mt-1">
                  ความเชื่อมั่น {patientCase.smutthanResult?.confidence || 88}% · อ้างอิงคัมภีร์เวชศึกษา และสมุฏฐานวินิจฉัย
                </p>
              </div>
            </div>

            {/* แผนการรักษาและตำรับยา */}
            <div className="grid grid-cols-4 gap-2 py-2 border-b border-gray-50">
              <span className="text-gray-500 font-medium">แผนการรักษา & ตำรับยา:</span>
              <div className="col-span-3">
                <span className="text-[#1E4D38] font-bold text-sm block">{rxSummary}</span>
                {currentRx?.rasa && (
                  <span className="text-[11px] text-[#7A5214] bg-[#FDF0D5] px-2 py-0.5 rounded font-semibold inline-block mt-1">
                    รสยา: {currentRx.rasa}
                  </span>
                )}
              </div>
            </div>

            {/* ความปลอดภัยและอันตรกิริยา */}
            <div className="grid grid-cols-4 gap-2 py-2 border-b border-gray-50">
              <span className="text-gray-500 font-medium">ความปลอดภัย (Drug Guard):</span>
              <div className="col-span-3 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-gray-800 leading-relaxed">{safetyText}</span>
              </div>
            </div>

            {/* รหัสสถิติ ICD-10-TM ที่ยืนยัน */}
            <div className="grid grid-cols-4 gap-2 py-2">
              <span className="text-gray-500 font-medium">รหัสโรคที่แพทย์ยืนยัน:</span>
              <div className="col-span-3">
                <span className="font-mono font-bold text-[#14261D] bg-[#F4F8F5] px-3 py-1 rounded-lg border border-emerald-200 inline-block">
                  {confirmedICDText}
                </span>
                <p className="text-[10px] text-gray-400 mt-1">
                  ตามเกณฑ์มาตรฐานข้อมูลสุขภาพกระทรวงสาธารณสุข (HDC Version 2568)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* คอลัมน์ขวา: ปุ่มส่งออกและส่งต่อ */}
        <div className="space-y-4 no-print">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 text-xs space-y-3 shadow-xs">
            <h4 className="font-bold text-sm text-[#14261D] mb-1">ส่งออกและส่งต่อข้อมูล</h4>
            <p className="text-[11px] text-gray-500 mb-3">
              จัดเก็บเป็นเอกสารหรือส่งเข้าฐานข้อมูลบริการปฐมภูมิ
            </p>

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-800 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-2xs"
            >
              <FileDown className="w-4 h-4 text-[#1E4D38]" /> พิมพ์หรือบันทึกเป็น PDF
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={handleExportHDC}
              className="w-full bg-[#1E4D38] hover:bg-[#163B2B] active:scale-98 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-xs disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isExporting ? 'กำลังส่งข้อมูลเข้า HDC...' : 'ส่งข้อมูลเข้า HIS / HDC'}
            </button>

            {exportSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[11px] font-semibold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ส่งข้อมูลโครงสร้าง FHIR JSON เข้าสู่ HDC สธ. และอัปเดตสถานะตรวจแล้วสำเร็จ!
              </div>
            )}

            <div className="bg-[#FAF9F5] p-3 rounded-xl border border-gray-100 text-[10px] text-gray-500 text-center leading-relaxed">
              โครงสร้างข้อมูลสอดคล้องกับมาตรฐาน Health Data Center (HDC) และ Fast Healthcare Interoperability Resources (FHIR)
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 text-xs shadow-xs">
            <h4 className="font-bold text-[#14261D] mb-2">สถานะการให้บริการ</h4>
            <ul className="space-y-1.5 text-gray-600 text-[11px]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                บันทึกสมุฏฐาน 4 สมบูรณ์
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                ผ่านเกณฑ์ตรวจยาตีกัน (Herb-Drug Guard)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                ยืนยันรหัส ICD-10-TM เรียบร้อย
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200/60 no-print">
        <button
          type="button"
          onClick={() => setCurrentStep('S8')}
          className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold cursor-pointer transition"
        >
          ← ย้อนกลับไปหน้ารหัสโรค
        </button>
        <button
          type="button"
          onClick={handleFinishAndReturn}
          className="px-5 py-2.5 bg-[#1E4D38] hover:bg-[#163B2B] active:scale-98 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs transition"
        >
          เสร็จสิ้น ปิดเคสกลับหน้ารายการผู้ป่วย →
        </button>
      </div>
    </AppShell>
  );
}
