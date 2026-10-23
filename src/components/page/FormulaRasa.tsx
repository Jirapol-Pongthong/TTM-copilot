'use client';

import React from 'react';
import { useCase } from '@/context/CaseContext';
import AppShell from '@/components/AppShell';

export default function Step6FormulaRasa() {
  const { setCurrentStep } = useCase();

  return (
    <AppShell title="เลือกตำรับยา / รสยา" subtitle="ขั้นตอนที่ 6 ตามตำรา: เลือกตำรับยาที่เหมาะสมกับสมุฏฐานและผู้ป่วยรายนี้">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200">
            <h4 className="font-bold text-xs text-[#14261D] mb-3">รสยา 9 รส ที่สัมพันธ์กับสมุฏฐาน</h4>
            <div className="grid grid-cols-3 gap-1.5 text-xs text-center">
              {['ฝาด', 'หวาน', 'เมาเบื่อ', 'ขม', '★ เผ็ดร้อน', 'มัน', 'หอมเย็น', 'เค็ม', 'เปรี้ยว'].map((r) => (
                <span
                  key={r}
                  className={`p-2 rounded-lg border text-[11px] font-semibold ${
                    r.includes('เผ็ดร้อน') ? 'bg-[#FDF0D5] border-[#E5C483] text-[#7A5214]' : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  {r}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-3">รสร้อน (รสประธาน) แก้โรคทางวาโยธาตุ</p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200">
            <h4 className="font-bold text-xs text-[#14261D] mb-3">ตัวเลือกที่ระบบแนะนำ</h4>
            <div className="space-y-3">
              <div className="border-2 border-[#1E4D38] bg-[#F4F8F5] p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1E4D38]" />
                    <span className="font-bold text-sm text-[#14261D]">ยาขมิ้นชัน (แคปซูล) / ยาเถาวัลย์เปรียง</span>
                    <span className="bg-[#EAF3EE] text-[#1E4D38] text-[10px] px-2 py-0.5 rounded font-bold">ยาตัวเลือกแรก</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">บรรเทาอาการท้องอืด ปวดเมื่อยตามตัว (First Line Drug)</p>
                </div>
                <span className="bg-[#FDF0D5] text-[#9A6B1F] text-[11px] font-bold px-2.5 py-1 rounded-lg">รสเผ็ดร้อน</span>
              </div>

              <div className="border border-gray-200 p-4 rounded-xl flex items-center justify-between text-xs text-gray-700 hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full border border-gray-400" />
                  <span className="font-semibold">หัตถการ: ประคบสมุนไพรบริเวณท้อง</span>
                </div>
                <span className="text-gray-400 text-[11px]">ไม่ใช้ยากิน</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 text-xs">
              <label className="font-bold text-gray-700">ขนาดและวิธีใช้ (แพทย์กำหนด)</label>
              <input
                type="text"
                defaultValue="2 แคปซูล วันละ 3 ครั้ง หลังอาหาร 7 วัน"
                className="w-full border border-gray-200 rounded-lg p-2.5 mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={() => setCurrentStep('S5')} className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold">
          ← ย้อนกลับ
        </button>
        <button onClick={() => setCurrentStep('S7')} className="px-5 py-2 bg-[#1E4D38] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5">
          ตรวจความปลอดภัยของยา →
        </button>
      </div>
    </AppShell>
  );
}