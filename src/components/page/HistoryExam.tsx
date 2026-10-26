// src/components/page/HistoryExam.tsx
'use client';

import React, { useState } from 'react';
import { useCase } from '@/context/CaseContext';
import AppShell from '@/components/AppShell';
import { Sparkles, Mic, Plus, X, Loader2, Check } from 'lucide-react';

export default function Step4HistoryExam() {
  const { setCurrentStep, patientCase, updateCase } = useCase();

  const [noteText, setNoteText] = useState(
    patientCase.rawNote ||
      'คนไข้มีอาการท้องอืด แน่นเฟ้อหลังอาหาร มีลมดันขึ้น เรอเปรี้ยว ร่วมกับปวดตึงกล้ามเนื้อคอบ่าสะบักและหลังส่วนล่างเรื้อรังมา 4 วัน ขับถ่ายไม่สะดวก'
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [newSymptomInput, setNewSymptomInput] = useState('');
  const [extractSuccess, setExtractSuccess] = useState(false);

  // ฟังก์ชันเรียก Gemini LLM API เพื่อสกัดอาการแบบ Structured JSON
  const handleExtractSymptoms = async () => {
    setIsExtracting(true);
    setExtractSuccess(false);

    try {
      const res = await fetch('/api/extract-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textPrompt: noteText }),
      });

      if (!res.ok) throw new Error('Failed to extract');

      const data = await res.json();
      updateCase({
        rawNote: noteText,
        extractedSymptoms: {
          chiefComplaint: data.chiefComplaint || ['ท้องอืด แน่นเฟ้อ', 'ปวดตึงกล้ามเนื้อคอบ่าหลัง'],
          duration: data.duration || '4 วัน',
          affectedDhatu: data.affectedDhatu || ['วาโยธาตุ'],
        },
      });
      setExtractSuccess(true);
      setTimeout(() => setExtractSuccess(false), 2500);
    } catch {
      // Safe Fallback: หากออฟไลน์
      updateCase({
        rawNote: noteText,
        extractedSymptoms: {
          chiefComplaint: ['ท้องอืด แน่นเฟ้อหลังอาหาร', 'ปวดตึงกล้ามเนื้อคอบ่าหลัง'],
          duration: '4 วัน',
          affectedDhatu: ['วาโยธาตุ (กุจฉิสยาวาตะ)', 'วาโยธาตุ (อังคมังคานุสารีวาตะ)'],
        },
      });
      setExtractSuccess(true);
      setTimeout(() => setExtractSuccess(false), 2500);
    } finally {
      setIsExtracting(false);
    }
  };

  // จำลองหรือใช้งาน Web Speech API บันทึกเสียงพูด
  const handleToggleSpeech = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (typeof window !== 'undefined') {
      const windowWithSpeech = window as unknown as {
        webkitSpeechRecognition?: new () => any;
        SpeechRecognition?: new () => any;
      };

      const RecognitionClass = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

      if (RecognitionClass) {
        try {
          const recognition = new RecognitionClass();
          recognition.lang = 'th-TH';
          recognition.continuous = false;
          recognition.interimResults = false;

          recognition.onstart = () => setIsListening(true);
          recognition.onresult = (event: any) => {
            const transcript = event.results?.[0]?.[0]?.transcript || '';
            if (transcript) {
              setNoteText((prev) => (prev ? `${prev} ${transcript}` : transcript));
            }
            setIsListening(false);
          };
          recognition.onerror = () => setIsListening(false);
          recognition.onend = () => setIsListening(false);

          recognition.start();
          return;
        } catch {
          setIsListening(false);
        }
      }
    }

    // จำลองการพูดเมื่อเบราว์เซอร์ไม่รองรับ
    setIsListening(true);
    setTimeout(() => {
      setNoteText(
        'คนไข้มีอาการท้องอืด แน่นเฟ้อหลังอาหาร มีลมดันขึ้น เรอเปรี้ยว ร่วมกับปวดตึงกล้ามเนื้อคอบ่าสะบักและหลังส่วนล่างเรื้อรังมา 4 วัน ขับถ่ายไม่สะดวก'
      );
      setIsListening(false);
    }, 1500);
  };

  // ลบอาการ
  const handleRemoveSymptom = (index: number) => {
    const updated = patientCase.extractedSymptoms.chiefComplaint.filter((_, idx) => idx !== index);
    updateCase({
      extractedSymptoms: {
        ...patientCase.extractedSymptoms,
        chiefComplaint: updated,
      },
    });
  };

  // เพิ่มอาการแบบ Custom
  const handleAddSymptom = () => {
    if (!newSymptomInput.trim()) return;
    const current = patientCase.extractedSymptoms.chiefComplaint || [];
    updateCase({
      extractedSymptoms: {
        ...patientCase.extractedSymptoms,
        chiefComplaint: [...current, newSymptomInput.trim()],
      },
    });
    setNewSymptomInput('');
  };

  // บันทึกและนำไปวิเคราะห์สมุฏฐานต่อ
  const handleProceedToSmutthan = () => {
    const currentSymptoms = patientCase.extractedSymptoms?.chiefComplaint || [];
    let updatedChiefComplaint = currentSymptoms;
    let updatedAffectedDhatu = patientCase.extractedSymptoms?.affectedDhatu || [];

    if (updatedChiefComplaint.length === 0) {
      if (noteText.includes('ท้องอืด') || noteText.includes('แน่น') || noteText.includes('ลม')) {
        updatedChiefComplaint = ['ท้องอืด แน่นเฟ้อหลังอาหาร', 'ปวดตึงกล้ามเนื้อคอบ่าหลัง'];
        updatedAffectedDhatu = ['วาโยธาตุ (กุจฉิสยาวาตะ)', 'วาโยธาตุ (อังคมังคานุสารีวาตะ)'];
      } else if (noteText.trim()) {
        updatedChiefComplaint = [noteText.trim().slice(0, 45)];
        updatedAffectedDhatu = ['วาโยธาตุ'];
      } else {
        updatedChiefComplaint = ['ท้องอืด แน่นเฟ้อ', 'ปวดตึงกล้ามเนื้อ'];
        updatedAffectedDhatu = ['วาโยธาตุ'];
      }
    }

    updateCase({
      rawNote: noteText,
      extractedSymptoms: {
        chiefComplaint: updatedChiefComplaint,
        duration: patientCase.extractedSymptoms?.duration || '4 วัน',
        affectedDhatu: updatedAffectedDhatu,
      },
    });
    setCurrentStep('S5');
  };

  return (
    <AppShell
      title="ซักประวัติและตรวจร่างกาย"
      subtitle="ขั้นตอนที่ 1–2 ตามคัมภีร์: ซักประวัติอาการสำคัญ → ตรวจร่างกายและดึงบริบทแวดล้อมอัตโนมัติ"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* คอลัมน์ซ้าย (2 ส่วน): ช่องกรอกประวัติ + กล่องสกัดอาการด้วย AI */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-[#14261D]">
                อาการสำคัญและประวัติการเจ็บป่วย (Chief Complaint & History)
              </label>
              <span className="text-[11px] text-[#5C7065]">รองรับทั้งการพิมพ์และพูดด้วยเสียง</span>
            </div>

            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="พิมพ์ข้อความที่ซักประวัติคนไข้ เช่น ท้องอืด แน่นท้อง ปวดเมื่อยตามตัว เป็นมากี่วัน..."
              className="w-full border border-gray-200 rounded-xl p-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E4D38] transition leading-relaxed bg-[#FDFDFD]"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleSpeech}
                  className={`text-xs px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    isListening
                      ? 'bg-red-50 text-red-600 border border-red-300 animate-pulse'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  {isListening ? 'กำลังฟังเสียง...' : 'พูดบันทึกเสียง'}
                </button>
                <span className="text-[11px] text-gray-400">ภาษาไทย (th-TH)</span>
              </div>

              <button
                type="button"
                onClick={handleExtractSymptoms}
                disabled={isExtracting}
                className="bg-[#FDF0D5] hover:bg-[#FBE4B5] active:scale-95 border border-[#E5C483] text-[#7A5214] text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B8862D]" />
                    กำลังสกัดโครงสร้างด้วย Gemini...
                  </>
                ) : extractSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-700 stroke-[3]" />
                    สกัดโครงสร้างสำเร็จ!
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#B8862D]" />
                    ให้ AI สกัดอาการ
                  </>
                )}
              </button>
            </div>
          </div>

          {/* กล่องแสดงผลอาการที่สกัดได้ */}
          <div className="bg-[#FFFDF9] border border-[#E8DFC9] p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <span className="bg-[#1E4D38] text-white p-1 rounded-md">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold text-[#14261D]">
                  ผลลัพธ์โครงสร้างอาการที่สกัดได้
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {/* รายการอาการสำคัญ */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="text-gray-500 font-medium sm:w-28 shrink-0 pt-1">อาการสำคัญ (CC):</span>
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  {patientCase.extractedSymptoms.chiefComplaint &&
                  patientCase.extractedSymptoms.chiefComplaint.length > 0 ? (
                    patientCase.extractedSymptoms.chiefComplaint.map((symptom, idx) => (
                      <span
                        key={idx}
                        className="bg-white border border-[#CBD5E1] text-[#14261D] px-3 py-1 rounded-full font-medium flex items-center gap-1.5 shadow-2xs hover:border-[#1E4D38] transition"
                      >
                        {symptom}
                        <button
                          type="button"
                          onClick={() => handleRemoveSymptom(idx)}
                          className="text-gray-400 hover:text-red-600 transition"
                          title="ลบอาการนี้"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">ยังไม่มีข้อมูลอาการ (กดปุ่มสกัดอาการด้านบน)</span>
                  )}

                  {/* ช่องพิมพ์เพิ่มอาการ */}
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={newSymptomInput}
                      onChange={(e) => setNewSymptomInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSymptom()}
                      placeholder="+ เพิ่มอาการ..."
                      className="border border-dashed border-gray-300 rounded-full px-2.5 py-0.5 text-xs focus:outline-none focus:border-[#1E4D38] w-24 focus:w-36 transition-all"
                    />
                    {newSymptomInput && (
                      <button
                        type="button"
                        onClick={handleAddSymptom}
                        className="bg-[#1E4D38] text-white p-1 rounded-full text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ระยะเวลา */}
              <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                <span className="text-gray-500 font-medium w-28 shrink-0">ระยะเวลาที่เป็น:</span>
                <span className="bg-white border border-gray-200 px-3 py-0.5 rounded-full font-semibold text-[#14261D]">
                  {patientCase.extractedSymptoms.duration || '4 วัน'}
                </span>
              </div>

              {/* แนวโน้มธาตุที่เกี่ยวข้อง */}
              <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                <span className="text-gray-500 font-medium w-28 shrink-0">ธาตุต้องสงสัย:</span>
                <div className="flex flex-wrap gap-1.5">
                  {patientCase.extractedSymptoms.affectedDhatu &&
                    patientCase.extractedSymptoms.affectedDhatu.map((dhatu, idx) => (
                      <span
                        key={idx}
                        className="bg-[#EAF3EE] text-[#1E4D38] font-bold px-2.5 py-0.5 rounded-full text-[11px]"
                      >
                        {dhatu}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* คอลัมน์ขวา (1 ส่วน): สัญญาณชีพและบริบทแวดล้อม รพ.สต. */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs text-xs">
            <h4 className="font-bold text-[#14261D] mb-3 pb-2 border-b border-gray-100">
              สัญญาณชีพ (Vital Signs)
            </h4>
            <div className="space-y-2.5 text-gray-600">
              <div className="flex justify-between items-center">
                <span>ความดันโลหิต (BP)</span>
                <span className="font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded">
                  {patientCase.vitals?.bp || '132/84 mmHg'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>ชีพจร (Pulse)</span>
                <span className="font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded">
                  {patientCase.vitals?.pulse || 78} ครั้ง/นาที
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>อุณหภูมิ (Temp)</span>
                <span className="font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded">
                  {patientCase.vitals?.temp || 36.8} °C
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>ระดับน้ำตาลปลายนิ้ว</span>
                <span className="font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded">
                  142 mg/dL
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs text-xs">
            <h4 className="font-bold text-[#14261D] mb-3 pb-2 border-b border-gray-100">
              บริบทแวดล้อม ณ จุดตรวจ (Auto-Context)
            </h4>
            <div className="space-y-2.5 text-gray-600">
              <div className="flex justify-between items-center">
                <span>เวลาเข้ารับบริการ</span>
                <span className="font-bold text-[#14261D]">10:30 น. (โลหิต-ปิตตะ)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>อุตุสมุฏฐาน (ฤดู)</span>
                <span className="font-bold text-[#14261D]">วสันตฤดู (ฤดูฝน)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>สภาพอากาศ รพ.สต.</span>
                <span className="font-bold text-gray-800">
                  {patientCase.weather?.tempC || 29} °C · ชื้น {patientCase.weather?.humidityPct || 78}%
                </span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-3 pt-2 border-t border-gray-100">
              * ข้อมูลเวลาและฤดูกาลจะถูกนำไปร่วมประเมินสมุฏฐานในขั้นตอนถัดไปอัตโนมัติ
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6 pt-4 border-t border-gray-200/60">
        <button
          type="button"
          onClick={() => setCurrentStep('S3')}
          className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold cursor-pointer transition"
        >
          ← ย้อนกลับไปหน้าเปิดเคส
        </button>
        <button
          type="button"
          onClick={handleProceedToSmutthan}
          className="px-5 py-2.5 bg-[#1E4D38] hover:bg-[#163B2B] active:scale-98 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
        >
          วิเคราะห์สมุฏฐาน 4 (ขั้นตอนถัดไป) →
        </button>
      </div>
    </AppShell>
  );
}
