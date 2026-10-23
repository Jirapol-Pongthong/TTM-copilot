'use client';

import React from 'react';
import { useCase } from '@/context/CaseContext';
import AppShell from '@/components/AppShell';
import { Plus } from 'lucide-react';

export default function Step2PatientList() {
  const { setCurrentStep, loadDemoCase } = useCase();

  return (
    <AppShell title="ผู้ป่วยวันนี้" subtitle="วันอังคารที่ 28 ตุลาคม 2569 · รพ.สต. ตัวอย่าง">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200">
          <span className="text-3xl font-extrabold text-[#14261D]">12</span>
          <p className="text-xs text-[#5C7065] mt-1">เคสวันนี้</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200">
          <span className="text-3xl font-extrabold text-[#C08A3E]">5</span>
          <p className="text-xs text-[#5C7065] mt-1">รอตรวจ</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200">
          <span className="text-3xl font-extrabold text-[#1E4D38]">7</span>
          <p className="text-xs text-[#5C7065] mt-1">ตรวจแล้ว</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ป่วย / HN..."
            className="w-80 border border-gray-200 rounded-lg px-3 py-1.5 text-xs"
          />
          <button
            onClick={() => setCurrentStep('S3')}
            className="flex items-center gap-1.5 bg-[#1E4D38] hover:bg-[#163B2B] text-white text-xs font-semibold px-4 py-2 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5" /> เปิดเคสใหม่
          </button>
        </div>

        <table className="w-full text-xs text-left">
          <thead className="bg-[#FAF9F5] text-[#5C7065] font-semibold border-b border-gray-100">
            <tr>
              <th className="py-3 px-4">เวลา</th>
              <th className="py-3 px-4">ผู้ป่วย</th>
              <th className="py-3 px-4">อายุ</th>
              <th className="py-3 px-4">อาการสำคัญ</th>
              <th className="py-3 px-4">สถานะ</th>
              <th className="py-3 px-4 text-right">การกระทำ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="bg-[#FFF9EE] hover:bg-[#FFF4DC] transition">
              <td className="py-3.5 px-4 font-semibold text-[#14261D]">10:30</td>
              <td className="py-3.5 px-4 font-bold text-[#14261D]">คุณสมศรี ใจดี</td>
              <td className="py-3.5 px-4">58</td>
              <td className="py-3.5 px-4">ท้องอืด แน่นท้อง ปวดเมื่อยตามตัว 3 วัน</td>
              <td className="py-3.5 px-4">
                <span className="bg-[#FCECD2] text-[#9A6B1F] font-semibold px-2 py-0.5 rounded-full">รอตรวจ</span>
              </td>
              <td className="py-3.5 px-4 text-right">
                <button
                  onClick={loadDemoCase}
                  className="border border-[#1E4D38] text-[#1E4D38] hover:bg-[#1E4D38] hover:text-white font-semibold px-3 py-1 rounded-lg transition"
                >
                  เปิดเคส
                </button>
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-3.5 px-4 text-gray-500">10:50</td>
              <td className="py-3.5 px-4 font-semibold text-gray-800">นายสมชาย รักไทย</td>
              <td className="py-3.5 px-4">65</td>
              <td className="py-3.5 px-4 text-gray-600">ปวดเข่าเรื้อรัง</td>
              <td className="py-3.5 px-4">
                <span className="bg-[#FCECD2] text-[#9A6B1F] font-semibold px-2 py-0.5 rounded-full">รอตรวจ</span>
              </td>
              <td className="py-3.5 px-4 text-right">
                <button className="border border-gray-300 text-gray-600 px-3 py-1 rounded-lg">เปิดเคส</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}