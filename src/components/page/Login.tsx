// src/components/page/Login.tsx
'use client';

import React, { useState } from 'react';
import { useCase } from '@/context/CaseContext';
import { Stethoscope, ArrowRight, BookOpenCheck } from 'lucide-react';

export default function Step1Login() {
  const { setCurrentStep } = useCase();
  const [hospital, setHospital] = useState('รพ.สต. ตัวอย่างเฉลิมพระเกียรติ');
  const [username, setUsername] = useState('somchai.ttm');
  const [password, setPassword] = useState('••••••••');

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAF8F5]">
      {/* ฝั่งซ้าย: Brand Showcase สไตล์พรีเมียมหรูหรา เขียวมรกตทองคำ */}
      <div className="w-full lg:w-[54%] bg-gradient-to-br from-[#0B1E15] via-[#102B1E] to-[#163828] text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden select-none border-b lg:border-b-0 lg:border-r border-[#E5C483]/20">
        {/* Subtle Ambient Glow Effect */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#E5C483]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#255C43]/40 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-[#E5C483]/30 backdrop-blur-md shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#E5C483] animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wider text-[#E5C483] uppercase">
              DTAM Hackathon 2026 · Track 1 เวชกรรมไทย
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#8EA89B] hidden sm:inline-block">
            เวอร์ชัน Demo
          </span>
        </div>

        {/* Brand Center Hero */}
        <div className="relative z-10 my-10 lg:my-auto max-w-xl">
          <div className="mb-4">
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#E5C483] uppercase block">
              Clinical Decision Support
            </span>
            <span className="text-[10px] text-[#8EA89B] tracking-wider">
              Thai Traditional Medicine AI
            </span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-[#FFF2D6] via-[#E5C483] to-[#B8862D] bg-clip-text text-transparent drop-shadow-sm font-serif">
              GENESIS
            </span>
          </h1>

          <p className="text-sm sm:text-base font-light text-[#D1E0D7] mt-3 leading-relaxed">
            จุดเริ่มต้นใหม่ของระบบสนับสนุนการตัดสินใจทางคลินิกเวชกรรมไทยด้วย AI
            <br className="hidden sm:inline" />
            บูรณาการคัมภีร์ดั้งเดิม 5 เล่ม สู่การดูแลสุขภาพปฐมภูมิที่แม่นยำและปลอดภัยสูงสุด
          </p>

        </div>

        {/* Footer Credit */}
        <div className="relative z-10 pt-4 flex flex-wrap items-center justify-between text-[11px] text-[#7E998B] gap-2">
          <div className="flex items-center gap-1.5">
            <BookOpenCheck className="w-3.5 h-3.5 text-[#E5C483]" />
            <span>เชื่อมโยงคลังตำรา 572 รายการ และสแกนคัมภีร์ต้นฉบับ 99 หน้า</span>
          </div>
          <span>กรมการแพทย์แผนไทยและแพทย์ทางเลือก</span>
        </div>
      </div>

      {/* ฝั่งขวา: ฟอร์มเข้าสู่ระบบสะอาด ทันสมัย สไตล์คลินิก */}
      <div className="w-full lg:w-[46%] p-8 lg:p-14 flex flex-col justify-center max-w-lg mx-auto">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#EAF3EE] text-[#1E4D38] text-[11px] font-bold mb-3">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>ระบบบริการเวชกรรมไทยปฐมภูมิ</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#14261D] tracking-tight">
            เข้าสู่ระบบปฏิบัติงาน
          </h2>
          <p className="text-xs text-[#5C7065] mt-1.5">
            สำหรับแพทย์แผนไทย แพทย์เวชปฏิบัติทั่วไป และบุคลากรสาธารณสุข
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setCurrentStep('S2');
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block text-[#14261D] font-bold mb-1.5">
              หน่วยบริการ / สถานพยาบาล
            </label>
            <input
              type="text"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E4D38] focus:border-transparent transition shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-[#14261D] font-bold mb-1.5">
              ชื่อผู้ใช้งาน (ใบอนุญาตประกอบวิชาชีพ)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E4D38] focus:border-transparent transition shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-[#14261D] font-bold mb-1.5">
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E4D38] focus:border-transparent transition shadow-2xs"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <label className="flex items-center gap-1.5 text-gray-600 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-[#1E4D38] focus:ring-[#1E4D38]" />
              <span>จดจำการเข้าสู่ระบบในเครื่องนี้</span>
            </label>
            <span className="text-[#1E4D38] font-semibold hover:underline cursor-pointer">
              ขอรับรหัสผ่านใหม่
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#1E4D38] to-[#153A2A] hover:from-[#163B2B] hover:to-[#0F281D] active:scale-[0.99] text-[#FFF9EB] font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer mt-4 flex items-center justify-center gap-2 group text-sm border border-[#E5C483]/30"
          >
            <span>เข้าสู่ระบบ GENESIS</span>
            <ArrowRight className="w-4 h-4 text-[#E5C483] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200/60 text-center text-[11px] text-gray-400">
          ระบบรักษาความมั่นคงปลอดภัยตามมาตรฐาน PDPA และระเบียบกระทรวงสาธารณสุข
        </div>
      </div>
    </div>
  );
}
