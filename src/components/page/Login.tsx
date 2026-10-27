// src/components/page/Login.tsx
'use client';

import React, { useState } from 'react';
import { useCase } from '@/context/CaseContext';

export default function Step1Login() {
  const { setCurrentStep } = useCase();
  const [hospital, setHospital] = useState('รพ.สต. ตัวอย่าง');
  const [username, setUsername] = useState('somchai.ttm');
  const [password, setPassword] = useState('••••••••');

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
      {/* ฝั่งซ้ายสีเขียวเข้ม */}
      <div className="w-full md:w-1/2 bg-[#123123] text-white p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-extrabold text-[#E5C483] tracking-tight">TTM Copilot</h1>
          <p className="text-lg text-[#B2C5BB] mt-3 leading-relaxed">
            ผู้ช่วยสนับสนุนการตัดสินใจทางคลินิกเวชกรรมไทยด้วย AI สำหรับหน่วยบริการปฐมภูมิ
          </p>
        </div>
      </div>

      {/* ฝั่งขวาฟอร์มเข้าสู่ระบบ */}
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
            <label className="block text-[#14261D] font-bold mb-1.5">หน่วยบริการ</label>
            <input
              type="text"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E4D38] focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-[#14261D] font-bold mb-1.5">ชื่อผู้ใช้</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E4D38] focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-[#14261D] font-bold mb-1.5">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E4D38] focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#1E4D38] hover:bg-[#163B2B] active:scale-[0.99] text-white font-bold py-3 rounded-lg shadow hover:shadow-md transition-all duration-150 cursor-pointer mt-4"
          >
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
}
