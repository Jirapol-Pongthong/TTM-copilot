'use client';

import React from 'react';
import { useCase } from '@/context/CaseContext';

export default function Step1Login() {
  const { setCurrentStep } = useCase();

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
      <div className="w-full md:w-1/2 bg-[#123123] text-white p-12 flex flex-col justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-[#E5C483] tracking-tight">TTM Copilot</h1>
          <p className="text-lg text-[#B2C5BB] mt-3">
            ผู้ช่วยสนับสนุนการตัดสินใจทางคลินิกเวชกรรมไทยด้วย AI สำหรับหน่วยบริการปฐมภูมิ
          </p>
          <ul className="mt-10 space-y-4 text-sm text-[#D5DFD9]">
            <li className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#E5C483]" />
              ประเมินสมุฏฐาน 4 พร้อมเหตุผลและอ้างอิงตำรา
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#E5C483]" />
              เสนอรสยา / ตำรับ ให้แพทย์เลือกและปรับเอง
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#E5C483]" />
              ตรวจอันตรกิริยาระหว่างยาแผนปัจจุบันกับสมุนไพร
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#E5C483]" />
              จับคู่รหัสโรค ICD-10-TM ให้แพทย์ยืนยัน
            </li>
          </ul>
        </div>
        <p className="text-xs text-[#708A7C]">DTAM Hackathon 2026 · Track 1 เวชกรรมไทย</p>
      </div>

      <div className="w-full md:w-1/2 p-12 flex flex-col justify-center max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-[#14261D]">เข้าสู่ระบบ</h2>
        <p className="text-xs text-[#5C7065] mt-1">สำหรับผู้ประกอบวิชาชีพการแพทย์แผนไทย</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setCurrentStep('S2');
          }}
          className="mt-6 space-y-4 text-xs"
        >
          <div>
            <label className="block text-[#3A4F43] font-semibold mb-1">หน่วยบริการ</label>
            <input
              type="text"
              defaultValue="รพ.สต. ตัวอย่าง (เลือกหน่วยบริการ)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-[#1E4D38]"
            />
          </div>
          <div>
            <label className="block text-[#3A4F43] font-semibold mb-1">ชื่อผู้ใช้</label>
            <input
              type="text"
              defaultValue="somchai.ttm"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-[#1E4D38]"
            />
          </div>
          <div>
            <label className="block text-[#3A4F43] font-semibold mb-1">รหัสผ่าน</label>
            <input
              type="password"
              defaultValue="password123"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-[#1E4D38]"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#1E4D38] hover:bg-[#163B2B] text-white font-semibold py-2.5 rounded-lg transition"
          >
            เข้าสู่ระบบ
          </button>
        </form>
        <p className="text-[11px] text-gray-400 mt-4 text-center">
          Prototype ตัวอย่าง: ข้อมูลทั้งหมดเป็นข้อมูลสมมติ ไม่ใช่ข้อมูลผู้ป่วยจริง
        </p>
      </div>
    </div>
  );
}