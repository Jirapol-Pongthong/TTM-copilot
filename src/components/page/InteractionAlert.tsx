'use client';

import React from 'react';
import { useCase } from '@/context/CaseContext';
import AppShell from '@/components/AppShell';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export default function Step7InteractionAlert() {
  const { setCurrentStep } = useCase();

  return (
    <AppShell title="ตรวจความปลอดภัยของยา" subtitle="Herb-Drug Guard: ตรวจสมุนไพรที่เลือกเทียบกับยาแผนปัจจุบันที่ผู้ป่วยใช้อยู่">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* ป้ายเตือนอันตรกิริยา ความเสี่ยงสูงสีแดงตาม Figma S7 */}
          <div className="bg-[#FFF5F5] border-2 border-[#E57373] p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#C62828] font-bold text-base">
                <AlertTriangle className="w-5 h-5 text-[#C62828]" />
                พบความเสี่ยงอันตรกิริยา (CRITICAL)
              </div>
              <span className="bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                ควรระวัง / ห้ามจ่ายร่วม
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#FFCDD2] mt-4 flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-400 text-[10px]">สมุนไพรที่เลือก</span>
                <p className="font-bold text-[#14261D] text-sm mt-0.5">ขมิ้นชัน / เถาวัลย์เปรียง</p>
              </div>
              <span className="text-[#C62828] font-bold text-base">✕</span>
              <div>
                <span className="text-gray-400 text-[10px]">ยาประจำตัวของผู้ป่วย</span>
                <p className="font-bold text-[#C62828] text-sm mt-0.5">Warfarin 3 mg / Aspirin 81 mg</p>
              </div>
            </div>

            <p className="text-xs text-[#5A1A1A] mt-4 leading-relaxed font-medium">
              ผลที่อาจเกิดขึ้น: อาจเสริมฤทธิ์ต้านการแข็งตัวของเลือด เพิ่มความเสี่ยงเลือดออกในทางเดินอาหารได้ง่าย
              ควรหลีกเลี่ยงหรือปรึกษาแพทย์ผู้สั่งยาก่อนใช้
            </p>
            <p className="text-[10px] text-gray-400 mt-3">
              แหล่งข้อมูล: ฐานข้อมูลอันตรกิริยายาสมุนไพร (ผ่านการตรวจสอบโดยผู้เชี่ยวชาญ)
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-xs text-[#14261D]">ทางเลือกที่แนะนำ</h4>
          <button
            onClick={() => setCurrentStep('S8')}
            className="w-full text-left bg-[#F4F8F5] border-2 border-[#1E4D38] p-4 rounded-xl hover:bg-[#EAF3EE] transition"
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-[#14261D]">เปลี่ยนเป็นหัตถการประคบสมุนไพร</span>
              <span className="bg-[#1E4D38] text-white text-[10px] font-bold px-2 py-0.5 rounded">แนะนำ</span>
            </div>
            <p className="text-[11px] text-gray-600 mt-1">บรรเทาท้องอืดโดยไม่ใช้ยากิน ไม่เกิดอันตรกิริยากับ Warfarin/Aspirin</p>
          </button>

          <button
            onClick={() => setCurrentStep('S6')}
            className="w-full text-left bg-white border border-gray-200 p-4 rounded-xl hover:bg-gray-50 transition"
          >
            <span className="font-bold text-xs text-gray-800">กลับไปปรับเป็นตำรับอื่น (หน้า S6)</span>
            <p className="text-[11px] text-gray-500 mt-1">เลือกตัวยาอื่นที่เหมาะกับสมุฏฐานและปลอดภัย</p>
          </button>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={() => setCurrentStep('S6')} className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold">
          ← กลับไปปรับตำรับ
        </button>
        <button onClick={() => setCurrentStep('S8')} className="px-5 py-2 bg-[#1E4D38] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5">
          ใช้ทางเลือก: ประคบสมุนไพร <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </AppShell>
  );
}