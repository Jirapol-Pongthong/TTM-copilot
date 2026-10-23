'use client';

import React from 'react';
import { useCase } from '@/context/CaseContext';
import AppShell from '@/components/AppShell';
import { Sparkles } from 'lucide-react';

export default function Step4HistoryExam() {
  const { setCurrentStep } = useCase();

  return (
    <AppShell title="ซักประวัติและตรวจร่างกาย" subtitle="ขั้นตอนที่ 1–2 ตามตำรา: ซักประวัติ → ตรวจร่างกาย">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200">
            <label className="block text-xs font-bold text-[#14261D] mb-2">อาการสำคัญและประวัติ (พิมพ์หรือพูด)</label>
            <textarea
              rows={3}
              defaultValue="ท้องอืด แน่นท้องหลังกินอาหาร ปวดเมื่อยตามตัว เป็นมา 3 วัน ไม่มีไข้ ขับถ่ายปกติ กินยาเบาหวานและยาละลายลิ่มเลือดตามปกติ"
              className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-[#1E4D38]"
            />
            <div className="flex gap-2 mt-3">
              <button className="border border-gray-300 text-gray-700 text-xs px-3.5 py-1.5 rounded-lg font-semibold">
                พูดบันทึก
              </button>
              <button className="bg-[#FDF0D5] border border-[#E5C483] text-[#7A5214] text-xs px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> ให้ AI สกัดอาการ
              </button>
            </div>
          </div>

          <div className="bg-[#FFFBF2] border border-[#F3E2BD] p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#7A5214] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> อาการที่ระบบสกัดให้ (Structured JSON)
              </span>
              <span className="text-[11px] text-gray-500">แพทย์ตรวจและแก้ไขได้</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-24">อาการหลัก:</span>
                <div className="flex gap-1.5">
                  <span className="bg-white border border-gray-200 px-2.5 py-0.5 rounded-full font-medium">ท้องอืด</span>
                  <span className="bg-white border border-gray-200 px-2.5 py-0.5 rounded-full font-medium">แน่นท้องหลังอาหาร</span>
                  <span className="bg-white border border-gray-200 px-2.5 py-0.5 rounded-full font-medium">ปวดเมื่อยตามตัว</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-24">ระยะเวลา:</span>
                <span className="bg-white border border-gray-200 px-2.5 py-0.5 rounded-full">3 วัน</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-24">การขับถ่าย:</span>
                <span className="bg-white border border-gray-200 px-2.5 py-0.5 rounded-full">ปกติ</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 text-xs">
            <h4 className="font-bold text-[#14261D] mb-3">สัญญาณชีพและการตรวจเบื้องต้น</h4>
            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between"><span>ความดันโลหิต</span><span className="font-semibold text-gray-900">128/82 mmHg</span></div>
              <div className="flex justify-between"><span>ชีพจร</span><span className="font-semibold text-gray-900">76 ครั้ง/นาที</span></div>
              <div className="flex justify-between"><span>อุณหภูมิ</span><span className="font-semibold text-gray-900">36.8 °C</span></div>
              <div className="flex justify-between"><span>น้ำตาลปลายนิ้ว</span><span className="font-semibold text-gray-900">142 mg/dL</span></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 text-xs">
            <h4 className="font-bold text-[#14261D] mb-3">บริบทที่ระบบดึงให้อัตโนมัติ</h4>
            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between"><span>เวลา</span><span className="font-semibold text-gray-900">10:30 น. (โลหิตเด่น)</span></div>
              <div className="flex justify-between"><span>วันที่ / ฤดู</span><span className="font-semibold text-gray-900">28 ต.ค. · วสันตฤดู</span></div>
              <div className="flex justify-between"><span>อากาศ</span><span className="font-semibold text-gray-900">31 °C · ชื้น 78%</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={() => setCurrentStep('S3')} className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold">
          ← ย้อนกลับ
        </button>
        <button onClick={() => setCurrentStep('S5')} className="px-5 py-2 bg-[#1E4D38] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5">
          วิเคราะห์สมุฏฐาน →
        </button>
      </div>
    </AppShell>
  );
}