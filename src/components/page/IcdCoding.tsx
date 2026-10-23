'use client';

import React from 'react';
import { useCase } from '@/context/CaseContext';
import AppShell from '@/components/AppShell';

export default function Step8IcdCoding() {
  const { setCurrentStep } = useCase();

  return (
    <AppShell title="ลงรหัสโรค / หัตถการ" subtitle="ระบบจับคู่รหัสแผนไทยกับ ICD-10-TM ให้แพทย์ตรวจและยืนยันก่อนบันทึก">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
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
              <tr className="bg-[#FFFDF9]">
                <td className="py-3.5 px-4 text-center">
                  <input type="checkbox" defaultChecked className="accent-[#1E4D38] w-4 h-4" />
                </td>
                <td className="py-3.5 px-4 font-bold text-[#14261D]">ท้องอืด ท้องเฟ้อ (อาการหลัก)</td>
                <td className="py-3.5 px-4 font-mono text-gray-700 font-semibold">U55.22 → R14</td>
                <td className="py-3.5 px-4">
                  <span className="bg-[#EAF3EE] text-[#1E4D38] px-2 py-0.5 rounded-full font-bold text-[10px]">
                    สูง · ระบบแนะนำ
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 text-center">
                  <input type="checkbox" defaultChecked className="accent-[#1E4D38] w-4 h-4" />
                </td>
                <td className="py-3.5 px-4 font-bold text-[#14261D]">ปวดเมื่อยตามตัว</td>
                <td className="py-3.5 px-4 font-mono text-gray-700 font-semibold">U77.1 → M79.1</td>
                <td className="py-3.5 px-4">
                  <span className="bg-[#FDF0D5] text-[#9A6B1F] px-2 py-0.5 rounded-full font-bold text-[10px]">
                    ปานกลาง
                  </span>
                </td>
              </tr>
              <tr className="bg-[#F4F8F5]">
                <td className="py-3.5 px-4 text-center">
                  <input type="checkbox" defaultChecked className="accent-[#1E4D38] w-4 h-4" />
                </td>
                <td className="py-3.5 px-4 font-bold text-[#1E4D38]">หัตถการ: ประคบสมุนไพรบริเวณท้อง</td>
                <td className="py-3.5 px-4 font-mono text-gray-700 font-semibold">U60.1 (หัตถการ)</td>
                <td className="py-3.5 px-4">
                  <span className="bg-[#EAF3EE] text-[#1E4D38] px-2 py-0.5 rounded-full font-bold text-[10px]">สูง</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 text-xs space-y-3">
          <h4 className="font-bold text-[#7A5214]">ระบบเลือกรหัสอย่างไร?</h4>
          <p className="text-gray-600 leading-relaxed">
            ค้นหาจากบัญชี 642 รหัสของสถาบันการแพทย์แผนไทย เปรียบเทียบกับคู่มือปี 2568
            และเสนอ 3 อันดับแรกให้แพทย์เป็นผู้ยืนยันขั้นสุดท้าย (Human-in-the-loop)
          </p>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={() => setCurrentStep('S7')} className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold">
          ← ย้อนกลับ
        </button>
        <button onClick={() => setCurrentStep('S9')} className="px-5 py-2 bg-[#1E4D38] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5">
          ยืนยันรหัสและสรุปเคส →
        </button>
      </div>
    </AppShell>
  );
}