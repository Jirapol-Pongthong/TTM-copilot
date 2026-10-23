'use client';

import React from 'react';
import { useCase } from '@/context/CaseContext';
import AppShell from '@/components/AppShell';
import { ArrowRight } from 'lucide-react';

export default function Step3NewCase() {
  const { setCurrentStep, patientCase, updateCase } = useCase();

  return (
    <AppShell title="เปิดเคสใหม่" subtitle="ข้อมูลพื้นฐานและยาที่ผู้ป่วยใช้อยู่ ใช้สำหรับตรวจความปลอดภัยในขั้นตอนถัดไป">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <h3 className="font-bold text-sm text-[#14261D] mb-4">ข้อมูลผู้ป่วย</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-gray-500 font-medium">ชื่อ-สกุล</label>
              <input
                type="text"
                value={patientCase.name || 'คุณสมศรี ใจดี'}
                onChange={(e) => updateCase({ name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg p-2.5 mt-1 font-semibold"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-gray-500 font-medium">อายุ</label>
                <input
                  type="number"
                  value={patientCase.age || 58}
                  onChange={(e) => updateCase({ age: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-gray-500 font-medium">เพศ</label>
                <input type="text" value="หญิง" readOnly className="w-full border border-gray-200 rounded-lg p-2 mt-1 bg-gray-50" />
              </div>
              <div>
                <label className="text-gray-500 font-medium">HN</label>
                <input type="text" value={patientCase.hn || '00-12345'} readOnly className="w-full border border-gray-200 rounded-lg p-2 mt-1 bg-gray-50" />
              </div>
            </div>
            <div>
              <label className="text-gray-500 font-medium">โรคประจำตัว</label>
              <input
                type="text"
                value={patientCase.underlyingDiseases.join(', ') || 'เบาหวานชนิดที่ 2'}
                className="w-full border border-gray-200 rounded-lg p-2 mt-1"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#14261D]">ยาแผนปัจจุบันที่ใช้อยู่</h3>
            <p className="text-[11px] text-gray-500 mt-0.5 mb-3">ใช้ตรวจอันตรกิริยากับสมุนไพรในขั้นตอนที่ 4 (F3 Herb-Drug Guard)</p>
            <div className="space-y-2">
              <div className="bg-[#F8F9F8] p-3 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#14261D]">Metformin 500 mg</p>
                  <p className="text-gray-500 text-[11px]">วันละ 2 ครั้ง หลังอาหาร</p>
                </div>
                <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-[10px]">ยาประจำ</span>
              </div>
              <div className="bg-[#FFF8F8] p-3 rounded-xl border border-red-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#9A2E2E]">Warfarin 3 mg / Aspirin 81 mg</p>
                  <p className="text-gray-500 text-[11px]">ยาต้านการแข็งตัวของเลือด (ตัวกระตุ้นเตือนในหน้า S7)</p>
                </div>
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px]">ยาประจำ</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setCurrentStep('S2')} className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-600">
              ยกเลิก
            </button>
            <button onClick={() => setCurrentStep('S4')} className="px-5 py-2 bg-[#1E4D38] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5">
              เริ่มซักประวัติ <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}