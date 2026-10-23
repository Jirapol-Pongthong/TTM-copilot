'use client';

import React from 'react';
import { useCase } from '@/context/CaseContext';
import AppShell from '@/components/AppShell';
import { BookOpen, Sparkles } from 'lucide-react';

export default function Step5Smutthan() {
  const { setCurrentStep } = useCase();

  return (
    <AppShell title="วิเคราะห์สมุฏฐาน 4" subtitle="ขั้นตอนที่ 3–5 ตามตำรา: วิเคราะห์อาการ → หาสาเหตุ → พิจารณาฤดู อายุ และเวลา">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200">
            <div className="flex justify-between items-start">
              <span className="text-[11px] text-gray-500 font-semibold">ธาตุสมุฏฐาน</span>
              <span className="bg-[#EAF3EE] text-[#1E4D38] text-[10px] px-2 py-0.5 rounded-full font-bold">ตรงกับอาการ</span>
            </div>
            <h3 className="font-extrabold text-base text-[#14261D] mt-2">วาโยธาตุ · กุจฉิสยาวาตา</h3>
            <p className="text-xs text-gray-600 mt-1">ท้องอืด แน่นท้อง สัมพันธ์กับลมในช่องท้อง</p>
            <p className="text-[10px] text-gray-400 mt-4">อ้างอิง: คัมภีร์ธาตุบรรจบ (น.12)</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200">
            <div className="flex justify-between items-start">
              <span className="text-[11px] text-gray-500 font-semibold">อุตุสมุฏฐาน</span>
              <span className="bg-[#EAF3EE] text-[#1E4D38] text-[10px] px-2 py-0.5 rounded-full font-bold">ตรงกับธาตุ</span>
            </div>
            <h3 className="font-extrabold text-base text-[#14261D] mt-2">วสันตฤดู (ฤดูฝน)</h3>
            <p className="text-xs text-gray-600 mt-1">ธาตุประจำฤดู: วาโยธาตุ (กุจฉิสยาวาตา)</p>
            <p className="text-[10px] text-gray-400 mt-4">อ้างอิง: ตำราเวชกรรมไทย 1 (น.58)</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200">
            <div className="flex justify-between items-start">
              <span className="text-[11px] text-gray-500 font-semibold">อายุสมุฏฐาน</span>
              <span className="bg-[#EAF3EE] text-[#1E4D38] text-[10px] px-2 py-0.5 rounded-full font-bold">ตรงกับธาตุ</span>
            </div>
            <h3 className="font-extrabold text-base text-[#14261D] mt-2">ปัจฉิมวัย (32–64 ปี)</h3>
            <p className="text-xs text-gray-600 mt-1">อายุ 58 ปี · ธาตุประจำวัย: วาโยธาตุ</p>
            <p className="text-[10px] text-gray-400 mt-4">อ้างอิง: คัมภีร์เวชศึกษา (น.34)</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200">
            <div className="flex justify-between items-start">
              <span className="text-[11px] text-gray-500 font-semibold">กาลสมุฏฐาน</span>
              <span className="bg-[#FDF0D5] text-[#9A6B1F] text-[10px] px-2 py-0.5 rounded-full font-bold">ปัจจัยร่วม</span>
            </div>
            <h3 className="font-extrabold text-base text-[#14261D] mt-2">10:30 น. (09.00–12.00)</h3>
            <p className="text-xs text-gray-600 mt-1">ช่วงเวลา: โลหิตเด่น สนับสนุนอาการ</p>
            <p className="text-[10px] text-gray-400 mt-4">อ้างอิง: สมุฏฐานวินิจฉัย (น.45)</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#1E4D38] text-white p-5 rounded-2xl">
            <span className="text-xs text-[#B2C5BB]">ผลประเมินโดยรวม</span>
            <h3 className="text-lg font-bold text-[#E5C483] mt-1">แนวโน้มวาโยธาตุแปรปรวน</h3>
            <p className="text-xs text-gray-200 mt-2">ความสอดคล้องของปัจจัย 3 จาก 4 ด้าน</p>
            <div className="w-full bg-teal-900 rounded-full h-2 mt-3">
              <div className="bg-[#E5C483] h-2 rounded-full w-[82%]" />
            </div>
            <p className="text-right text-xs text-[#E5C483] mt-1 font-bold">ความมั่นใจ 82%</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 text-xs">
            <h4 className="font-bold text-[#7A5214] flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> เหตุผลโดยสรุป (AI อธิบาย)
            </h4>
            <p className="text-gray-600 leading-relaxed">
              อาการท้องอืดตรงกับลมในช่องท้อง และสอดคล้องกับวาโยธาตุของวัย (ปัจฉิมวัย) และของฤดู (วสันตฤดู)
            </p>
            <button className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 flex items-center justify-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> ดูอ้างอิงตำรา
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={() => setCurrentStep('S4')} className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold">
          ← ย้อนกลับ
        </button>
        <button onClick={() => setCurrentStep('S6')} className="px-5 py-2 bg-[#1E4D38] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5">
          เลือกตำรับยา / รสยา →
        </button>
      </div>
    </AppShell>
  );
}