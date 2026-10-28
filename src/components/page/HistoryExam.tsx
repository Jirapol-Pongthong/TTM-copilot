// src/components/page/HistoryExam.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCase } from '@/context/CaseContext';
import AppShell from '@/components/AppShell';
import { extractThaiSymptomsDeterministic } from '@/lib/symptomExtractor';
import {
  fetchRealTimeWeather,
} from '@/lib/weatherService';
import {
  Sparkles,
  Mic,
  MicOff,
  Plus,
  X,
  Loader2,
  Check,
  RotateCcw,
  Activity,
  CloudSun,
  RefreshCw,
} from 'lucide-react';

/**
 * ทำความสะอาดข้อความภาษาไทยที่ได้จาก Web Speech API ของ Chrome
 */
function normalizeThaiSpeechTranscript(rawSpeech: string): string {
  return rawSpeech
    .replace(/\s+/g, ' ')
    .replace(/ปวด\s+ท้อง/g, 'ปวดท้อง')
    .replace(/แน่น\s+ท้อง/g, 'แน่นท้อง')
    .replace(/ท้อง\s+อืด/g, 'ท้องอืด')
    .replace(/แน่น\s+เฟ้อ/g, 'แน่นเฟ้อ')
    .replace(/ปวด\s+หัว/g, 'ปวดหัว')
    .replace(/ปวด\s+ศีรษะ/g, 'ปวดศีรษะ')
    .replace(/เวียน\s+หัว/g, 'เวียนหัว')
    .replace(/ตัว\s+ร้อน/g, 'ตัวร้อน')
    .replace(/มี\s+ไข้/g, 'มีไข้')
    .replace(/เป็น\s+ไข้/g, 'เป็นไข้')
    .replace(/เจ็บ\s+คอ/g, 'เจ็บคอ')
    .replace(/ปวด\s+เมื่อย/g, 'ปวดเมื่อย')
    .replace(/ปวด\s+ตึง/g, 'ปวดตึง')
    .replace(/คอ\s+บ่า/g, 'คอบ่า')
    .replace(/ปวด\s+หลัง/g, 'ปวดหลัง')
    .replace(/ปวด\s+ก้น/g, 'ปวดก้น')
    .replace(/ปวด\s+เข่า/g, 'ปวดเข่า')
    .replace(/ปวด\s+ขา/g, 'ปวดขา')
    .replace(/ท้อง\s+ผูก/g, 'ท้องผูก')
    .replace(/ท้อง\s+เสีย/g, 'ท้องเสีย')
    .replace(/เรอ\s+เปรี้ยว/g, 'เรอเปรี้ยว')
    .trim();
}

export default function Step4HistoryExam() {
  const { setCurrentStep, patientCase, updateCase } = useCase();

  const [noteText, setNoteText] = useState(patientCase.rawNote || '');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [newSymptomInput, setNewSymptomInput] = useState('');
  const [extractSuccess, setExtractSuccess] = useState(false);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);

  const currentPainScore = patientCase.extractedSymptoms?.painScore ?? 7;
  const calculatedSymptomWeight = Math.max(1.0, Math.min(5.0, Number((currentPainScore * 0.5).toFixed(1))));

  const recognitionRef = useRef<any>(null);
  const baseTextBeforeSpeechRef = useRef<string>('');

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // ดึงข้อมูลสภาพอากาศจริงจาก Open-Meteo API
  const handleFetchLiveWeather = async () => {
    setIsFetchingWeather(true);
    try {
      const live = await fetchRealTimeWeather();
      updateCase({
        season: live.inferredSeason,
        weather: {
          tempC: live.tempC,
          humidityPct: live.humidityPct,
          conditionLabel: live.conditionLabel,
          precipitationMm: live.precipitationMm,
          locationName: live.locationName,
          isLiveApi: true,
          fetchedAt: live.fetchedAt,
        },
      });
    } catch {
      // Fallback
    } finally {
      setIsFetchingWeather(false);
    }
  };

  // ดึงสภาพอากาศจริงจาก Open-Meteo API อัตโนมัติเมื่อเปิดหน้าหากยังไม่ได้ดึง
  useEffect(() => {
    if (!patientCase.weather?.isLiveApi) {
      handleFetchLiveWeather();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // อัปเดตระดับความปวด VAS (1–10)
  const handleSelectPainScore = (score: number) => {
    updateCase({
      extractedSymptoms: {
        ...patientCase.extractedSymptoms,
        painScore: score,
      },
    });
  };

  // ฟังก์ชันเรียก API เพื่อสกัดอาการจากข้อความที่พิมพ์จริง
  const handleExtractSymptoms = async () => {
    if (!noteText.trim()) return;
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
      const fallback = extractThaiSymptomsDeterministic(noteText);
      updateCase({
        rawNote: noteText,
        extractedSymptoms: {
          chiefComplaint:
            Array.isArray(data.chiefComplaint) && data.chiefComplaint.length > 0
              ? data.chiefComplaint
              : fallback.chiefComplaint,
          duration: data.duration || fallback.duration,
          affectedDhatu:
            Array.isArray(data.affectedDhatu) && data.affectedDhatu.length > 0
              ? data.affectedDhatu
              : fallback.affectedDhatu,
          painScore: data.painScore || fallback.painScore || currentPainScore,
        },
      });
      setExtractSuccess(true);
      setTimeout(() => setExtractSuccess(false), 2500);
    } catch {
      const fallback = extractThaiSymptomsDeterministic(noteText);
      updateCase({
        rawNote: noteText,
        extractedSymptoms: {
          chiefComplaint: fallback.chiefComplaint,
          duration: fallback.duration,
          affectedDhatu: fallback.affectedDhatu,
          painScore: fallback.painScore || currentPainScore,
        },
      });
      setExtractSuccess(true);
      setTimeout(() => setExtractSuccess(false), 2500);
    } finally {
      setIsExtracting(false);
    }
  };

  // บันทึกเสียงพูดด้วย Web Speech API
  const handleToggleSpeech = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
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
          if (recognitionRef.current) {
            try {
              recognitionRef.current.abort();
            } catch {
              // ignore
            }
          }

          const recognition = new RecognitionClass();
          recognitionRef.current = recognition;
          baseTextBeforeSpeechRef.current = noteText.trim();

          recognition.lang = 'th-TH';
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            setIsListening(true);
          };

          recognition.onresult = (event: any) => {
            const pieces: string[] = [];
            for (let i = 0; i < event.results.length; i++) {
              const piece = event.results[i]?.[0]?.transcript?.trim();
              if (piece) {
                pieces.push(piece);
              }
            }

            const sessionRaw = pieces.join(' ');
            const normalizedSession = normalizeThaiSpeechTranscript(sessionRaw);
            const prefix = baseTextBeforeSpeechRef.current;

            if (normalizedSession) {
              setNoteText(prefix ? `${prefix} ${normalizedSession}` : normalizedSession);
            }
          };

          recognition.onerror = () => {
            setIsListening(false);
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognition.start();
          return;
        } catch {
          setIsListening(false);
        }
      }
    }
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
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    }

    const currentSymptoms = patientCase.extractedSymptoms?.chiefComplaint || [];
    const noteChanged = noteText.trim() !== (patientCase.rawNote || '').trim();

    if ((currentSymptoms.length === 0 || noteChanged) && noteText.trim()) {
      const parsed = extractThaiSymptomsDeterministic(noteText);
      updateCase({
        rawNote: noteText,
        extractedSymptoms: {
          chiefComplaint: parsed.chiefComplaint,
          duration: parsed.duration,
          affectedDhatu: parsed.affectedDhatu,
          painScore: patientCase.extractedSymptoms?.painScore ?? parsed.painScore,
        },
      });
    } else {
      updateCase({
        rawNote: noteText,
      });
    }

    setCurrentStep('S5');
  };

  const tempC = patientCase.weather?.tempC ?? 29;
  const humidityPct = patientCase.weather?.humidityPct ?? 78;
  const isHotDryAnomaly = tempC >= 33 && humidityPct < 65 && patientCase.season !== 'summer';

  return (
    <AppShell title="ซักประวัติและตรวจร่างกาย">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* คอลัมน์ซ้าย (2 ส่วน): ช่องกรอกประวัติ + กล่องสกัดอาการด้วย AI + สเกลความปวด VAS */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-[#14261D]">
                อาการสำคัญและประวัติการเจ็บป่วย
              </label>
            </div>

            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => {
                setNoteText(e.target.value);
                baseTextBeforeSpeechRef.current = e.target.value.trim();
              }}
              placeholder="พิมพ์อาการของผู้ป่วย เช่น ปวดขามาก ระดับความปวด 8/10, ท้องอืด แน่นเฟ้อ, ปวดตึงคอบ่า..."
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
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      กำลังฟังเสียง...
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      พูดบันทึกเสียง
                    </>
                  )}
                </button>
                {noteText && (
                  <button
                    type="button"
                    onClick={() => {
                      setNoteText('');
                      baseTextBeforeSpeechRef.current = '';
                    }}
                    className="text-[11px] text-gray-500 hover:text-red-600 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-red-200 flex items-center gap-1 transition cursor-pointer"
                    title="ล้างข้อความทั้งหมด"
                  >
                    <RotateCcw className="w-3 h-3" />
                    ล้างข้อความ
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleExtractSymptoms}
                disabled={isExtracting || !noteText.trim()}
                className="bg-[#FDF0D5] hover:bg-[#FBE4B5] active:scale-95 border border-[#E5C483] text-[#7A5214] text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B8862D]" />
                    กำลังสกัดอาการ...
                  </>
                ) : extractSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-700 stroke-[3]" />
                    สกัดสำเร็จ
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#B8862D]" />
                    สกัดอาการด้วย AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* กล่องสเกลวัดระดับความปวด VAS 1–10 */}
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="bg-[#1E4D38] text-white p-1.5 rounded-lg">
                  <Activity className="w-3.5 h-3.5" />
                </span>
                <h4 className="text-xs font-bold text-[#14261D]">
                  ระดับความปวด / ความรุนแรง (VAS 1–10)
                </h4>
              </div>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#EAF3EE] text-[#1E4D38] border border-[#1E4D38]/20">
                VAS {currentPainScore}/10 (+{calculatedSymptomWeight.toFixed(1)} คะแนน)
              </span>
            </div>

            <div className="grid grid-cols-10 gap-1.5 mt-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isSelected = currentPainScore === num;
                let colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100';
                if (num >= 4 && num <= 6) {
                  colorClass = 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100';
                } else if (num >= 7) {
                  colorClass = 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100';
                }

                if (isSelected) {
                  if (num <= 3) colorClass = 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-300 font-extrabold shadow-xs';
                  else if (num <= 6) colorClass = 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300 font-extrabold shadow-xs';
                  else colorClass = 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-300 font-extrabold shadow-xs';
                }

                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleSelectPainScore(num)}
                    className={`py-2 rounded-xl border text-xs font-bold transition cursor-pointer flex flex-col items-center justify-center ${colorClass}`}
                  >
                    <span>{num}</span>
                    <span className="text-[9px] opacity-80 font-normal">
                      +{Math.max(1.0, Number((num * 0.5).toFixed(1))).toFixed(1)}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between text-[10px] text-gray-500 mt-2 px-1">
              <span className="text-emerald-700 font-medium">1–3: เล็กน้อย (+1.0 ถึง +1.5)</span>
              <span className="text-amber-700 font-medium">4–6: ปานกลาง (+2.0 ถึง +3.0)</span>
              <span className="text-rose-700 font-medium">7–10: รุนแรง (+3.5 ถึง +5.0)</span>
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
                  อาการที่สกัดได้
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="text-gray-500 font-medium sm:w-28 shrink-0 pt-1">อาการสำคัญ:</span>
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
                    <span className="text-gray-400 italic">ยังไม่มีข้อมูลอาการ</span>
                  )}

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

              <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                <span className="text-gray-500 font-medium w-28 shrink-0">ระยะเวลาที่เป็น:</span>
                <span className="bg-white border border-gray-200 px-3 py-0.5 rounded-full font-semibold text-[#14261D]">
                  {patientCase.extractedSymptoms.duration || '-'}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                <span className="text-gray-500 font-medium w-28 shrink-0">ธาตุต้องสงสัย:</span>
                <div className="flex flex-wrap gap-1.5">
                  {patientCase.extractedSymptoms.affectedDhatu &&
                  patientCase.extractedSymptoms.affectedDhatu.length > 0 ? (
                    patientCase.extractedSymptoms.affectedDhatu.map((dhatu, idx) => (
                      <span
                        key={idx}
                        className="bg-[#EAF3EE] text-[#1E4D38] font-bold px-2.5 py-0.5 rounded-full text-[11px]"
                      >
                        {dhatu}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">-</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* คอลัมน์ขวา (1 ส่วน): สัญญาณชีพ + บริบทแวดล้อม & Live Weather API */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs text-xs">
            <h4 className="font-bold text-[#14261D] mb-3 pb-2 border-b border-gray-100">
              สัญญาณชีพ
            </h4>
            <div className="space-y-2.5 text-gray-600">
              <div className="flex justify-between items-center">
                <span>BP</span>
                <span className="font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded">
                  {patientCase.vitals?.bp || '120/80 mmHg'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Pulse</span>
                <span className="font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded">
                  {patientCase.vitals?.pulse || 76} bpm
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Temp</span>
                <span className="font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded">
                  {patientCase.vitals?.temp || 36.6} °C
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                <span>VAS</span>
                <span className="font-bold text-[#1E4D38] bg-[#EAF3EE] px-2 py-0.5 rounded">
                  {currentPainScore} / 10 (+{calculatedSymptomWeight.toFixed(1)})
                </span>
              </div>
            </div>
          </div>

          {/* กล่อง Live Weather API & อุตุสมุฏฐานเชิงพลวัต */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs text-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
              <h4 className="font-bold text-[#14261D] flex items-center gap-1.5">
                <CloudSun className="w-4 h-4 text-[#1E4D38]" />
                อุตุสมุฏฐาน & Live Weather
              </h4>
              {patientCase.weather?.isLiveApi && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Live API
                </span>
              )}
            </div>

            <div className="space-y-2.5 text-gray-600">
              <div className="flex justify-between items-center">
                <span>อายุสมุฏฐาน ({patientCase.age || 58} ปี)</span>
                <span className="font-bold text-[#1E4D38] bg-[#EAF3EE] px-2 py-0.5 rounded">
                  +2.0 คะแนน
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>กาลสมุฏฐาน ({patientCase.visitTime || '10:30'} น.)</span>
                <span className="font-bold text-[#7A5214] bg-[#FDF0D5] px-2 py-0.5 rounded">
                  +1.5 คะแนน
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>ฤดูตามปฏิทิน</span>
                <span className="font-bold text-[#14261D]">
                  {patientCase.season === 'rainy'
                    ? 'วสันตฤดู'
                    : patientCase.season === 'summer'
                    ? 'คิมหันตฤดู'
                    : 'เหมันตฤดู'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>สภาพอากาศจริง</span>
                <span className="font-extrabold text-[#1E4D38] bg-[#EAF3EE] px-2 py-0.5 rounded">
                  {tempC} °C · ชื้น {humidityPct}%
                </span>
              </div>
              {patientCase.weather?.conditionLabel && (
                <div className="text-[11px] bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700">
                  {patientCase.weather.conditionLabel}
                  {isHotDryAnomaly && (
                    <span className="block text-rose-700 font-bold mt-0.5">
                      ⚠️ อุตุแปรปรวน: ร้อนแล้งแทรก → ปิตตะ (+1.5)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* ปุ่มดึงข้อมูลจริงจาก Open-Meteo API */}
            <button
              type="button"
              onClick={handleFetchLiveWeather}
              disabled={isFetchingWeather}
              className="mt-3 w-full py-2 px-3 bg-[#1E4D38] hover:bg-[#163B2B] text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingWeather ? 'animate-spin' : ''}`} />
              <span>
                {isFetchingWeather ? 'กำลังดึงสภาพอากาศ...' : 'อัปเดตสภาพอากาศจริง'}
              </span>
            </button>
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
          ← ย้อนกลับ
        </button>
        <button
          type="button"
          onClick={handleProceedToSmutthan}
          className="px-5 py-2.5 bg-[#1E4D38] hover:bg-[#163B2B] active:scale-98 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
        >
          วิเคราะห์สมุฏฐาน 4 →
        </button>
      </div>
    </AppShell>
  );
}
