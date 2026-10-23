'use client';

import React from 'react';
import { useCase } from '@/context/CaseContext';
import AppShell from '@/components/AppShell';
import { FileDown, Send } from 'lucide-react';

export default function Step9CaseSummary() {
  const { setCurrentStep, patientCase } = useCase();

  return (
    <AppShell title="สรุปเคส" subtitle="ตรวจทานสรุปและส่งออก หรือส่งข้อมูลเข้าระบบ HIS / HDC">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 space-y-4 text-xs">
          <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
            <span className="font-bold text-sm text-[#14261D]">สรุปผลการตรวจ (สร้างอัตโนมัติ · แพทย์แก้ไขได้)</span>
            <span className="text-gray-400 text-[11px]">เคสเสร็จสมบูรณ์</span>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              <span className="text-gray-500 font-medium">อาการสำคัญ:</span>
              <span className="col-span-3 text-gray-800 font-semibold">ท้องอืด แน่นท้องหลังอาหาร ปวดเมื่อยตามตัว 3 วัน</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <span className="text-gray-500 font-medium">สมุฏฐาน:</span>
              <span className="col-span-3 text-gray-800 font-semibold">วาโยธาตุ (กุจฉิสยาวาตา) · วสันตฤดู · ปัจฉิมวัย</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <span className="text-gray-500 font-medium">แผนการรักษา:</span>
              <span className="col-span-3 text-[#1E4D38] font-bold">หัตถการประคบสมุนไพรบริเวณท้อง (ปลอดภัย เลี่ยงยากิน)</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <span className="text-gray-500 font-medium">ความปลอดภัย:</span>
              <span className="col-span-3 text-gray-800">ตรวจผ่านเกณฑ์ (หลีกเลี่ยงขมิ้นชัน/เถาวัลย์เปรียง เนื่องจากตีกับ Warfarin/Aspirin)</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <span className="text-gray-500 font-medium">รหัสที่ยืนยัน:</span>
              <span className="col-span-3 font-mono font-semibold text-gray-800">U55.22 (R14) · M79.1 · U60.1 (ประคบสมุนไพร)</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 text-xs space-y-3">
            <h4 className="font-bold text-gray-800">ส่งออกและส่งต่อ</h4>
            <button
              onClick={() => window.print()}
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-800 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <FileDown className="w-4 h-4" /> ส่งออกเป็น PDF
            </button>
            <button
              onClick={() => alert('จำลองการส่งข้อมูล FHIR JSON เข้าสู่ Health Data Center (HDC) สำเร็จ!')}
              className="w-full bg-[#1E4D38] hover:bg-[#163B2B] text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> ส่งข้อมูลเข้า HIS / HDC
            </button>
            <p className="text-[10px] text-gray-400 text-center">ส่งผ่านโครงสร้างมาตรฐาน FHIR / HL7</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={() => setCurrentStep('S8')} className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold">
          ← ย้อนกลับ
        </button>
        <button
          onClick={() => setCurrentStep('S2')}
          className="px-5 py-2 bg-[#1E4D38] text-white rounded-lg text-xs font-semibold"
        >
          ปิดเคส กลับหน้ารายการผู้ป่วย
        </button>
      </div>
    </AppShell>
  );
}