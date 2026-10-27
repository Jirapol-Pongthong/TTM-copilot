'use client';

import React, { useState } from 'react';
import { useCase } from '@/context/CaseContext';
import AppShell from '@/components/AppShell';
import { evaluateSingleDrugRisk } from '@/lib/herbDrugGuard';
import { ArrowRight, Plus, X } from 'lucide-react';

export default function Step3NewCase() {
  const { setCurrentStep, patientCase, upsertPatientInQueue } = useCase();

  // แยกค่า BP บน/ล่าง จากข้อมูลเดิม (เช่น "120/80 mmHg" -> "120" และ "80")
  const initialBpClean = (patientCase.vitals?.bp || '120/80').replace(/mmhg/gi, '').trim();
  const [initSys, initDia] = initialBpClean.includes('/')
    ? initialBpClean.split('/').map((s) => s.trim())
    : ['120', '80'];

  // Local Form States (ใช้ String สำหรับตัวเลขเพื่อให้ลบแล้วพิมพ์ใหม่ได้โดยไม่ติดเลข 0 นำหน้า)
  const [name, setName] = useState(patientCase.name || '');
  const [ageStr, setAgeStr] = useState<string>(String(patientCase.age || 45));
  const [gender, setGender] = useState<'M' | 'F'>(patientCase.gender || 'F');
  const [hn, setHn] = useState(patientCase.hn || 'HN-558291');
  const [diseasesInput, setDiseasesInput] = useState(
    patientCase.underlyingDiseases?.join(', ') || ''
  );

  // สัญญาณชีพ
  const [bpSys, setBpSys] = useState<string>(initSys || '120');
  const [bpDia, setBpDia] = useState<string>(initDia || '80');
  const [pulseStr, setPulseStr] = useState<string>(String(patientCase.vitals?.pulse || 75));
  const [tempStr, setTempStr] = useState<string>(String(patientCase.vitals?.temp || 36.5));

  // รายการยาประจำตัว (Current Medications)
  const [medsList, setMedsList] = useState<string[]>(
    patientCase.currentMeds && patientCase.currentMeds.length > 0
      ? patientCase.currentMeds
      : []
  );
  const [newMedInput, setNewMedInput] = useState('');

  // ฟังก์ชันเพิ่มยา
  const handleAddMed = () => {
    if (!newMedInput.trim()) return;
    setMedsList((prev) => [...prev, newMedInput.trim()]);
    setNewMedInput('');
  };

  // ฟังก์ชันลบยา
  const handleRemoveMed = (index: number) => {
    setMedsList((prev) => prev.filter((_, idx) => idx !== index));
  };

  // บันทึกเคสลงในตารางผู้ป่วยวันนี้และไปต่อหน้า S4
  const handleProceed = () => {
    const parsedDiseases = diseasesInput
      .split(',')
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    // ถ้าผู้ใช้พิมพ์ค้างไว้ในช่องเพิ่มยาแต่ยังไม่ได้กดปุ่ม + เพิ่มยา ให้ดึงมารวมให้อัตโนมัติ
    const finalMeds = newMedInput.trim()
      ? [...medsList, newMedInput.trim()]
      : medsList;

    const cleanSys = bpSys.trim() || '120';
    const cleanDia = bpDia.trim() || '80';
    const formattedBp = `${cleanSys}/${cleanDia} mmHg`;

    const updatedCase = {
      ...patientCase,
      name: name.trim() || 'ผู้ป่วยใหม่',
      age: parseInt(ageStr, 10) || 45,
      gender,
      hn: hn.trim() || 'HN-558291',
      underlyingDiseases: parsedDiseases,
      currentMeds: finalMeds,
      vitals: {
        bp: formattedBp,
        pulse: parseInt(pulseStr, 10) || 75,
        temp: parseFloat(tempStr) || 36.5,
      },
    };

    upsertPatientInQueue(updatedCase, 'รอตรวจ');
    setCurrentStep('S4');
  };

  return (
    <AppShell
      title="เปิดเคสใหม่ / ตรวจสอบประวัติทั่วไป"
      subtitle="ข้อมูลพื้นฐาน โรคประจำตัว และยาแผนปัจจุบันที่ใช้อยู่ เพื่อส่งตรวจความปลอดภัยในขั้นตอนถัดไป"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* คอลัมน์ซ้าย: ข้อมูลผู้ป่วยและสัญญาณชีพ */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-sm text-[#14261D]">ข้อมูลทั่วไปของผู้ป่วย</h3>
            <span className="text-[11px] text-[#5C7065]">แก้ไขข้อมูลได้ทุกช่อง</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-gray-500 font-medium">ชื่อ-นามสกุล</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ระบุชื่อ-สกุลผู้ป่วย..."
                className="w-full border border-gray-200 rounded-lg p-2.5 mt-1 font-semibold text-[#14261D] focus:outline-none focus:ring-2 focus:ring-[#1E4D38]"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-gray-500 font-medium">อายุ (ปี)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={ageStr}
                  onChange={(e) => setAgeStr(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="เช่น 20"
                  className="w-full border border-gray-200 rounded-lg p-2 mt-1 font-semibold text-[#14261D] focus:outline-none focus:ring-2 focus:ring-[#1E4D38]"
                />
              </div>

              <div>
                <label className="text-gray-500 font-medium">เพศ</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'M' | 'F')}
                  className="w-full border border-gray-200 rounded-lg p-2 mt-1 bg-white font-semibold text-[#14261D] focus:outline-none focus:ring-2 focus:ring-[#1E4D38]"
                >
                  <option value="F">หญิง</option>
                  <option value="M">ชาย</option>
                </select>
              </div>

              <div>
                <label className="text-gray-500 font-medium">HN</label>
                <input
                  type="text"
                  value={hn}
                  onChange={(e) => setHn(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-[#1E4D38]"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-500 font-medium">
                โรคประจำตัว (คั่นด้วยเครื่องหมายจุลภาค ,)
              </label>
              <input
                type="text"
                value={diseasesInput}
                onChange={(e) => setDiseasesInput(e.target.value)}
                placeholder="เช่น เบาหวานชนิดที่ 2, ความดันโลหิตสูง..."
                className="w-full border border-gray-200 rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-[#1E4D38]"
              />
            </div>

            {/* ส่วนสัญญาณชีพ (แยก Format ช่องความดันโลหิต BP บน/ล่าง ชัดเจน) */}
            <div className="pt-2 border-t border-gray-100">
              <label className="text-gray-600 font-bold block mb-1.5">สัญญาณชีพแรกรับ</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <span className="text-[10px] text-gray-500 block">
                    ความดัน BP (ค่าบน / ล่าง)
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={bpSys}
                      onChange={(e) => setBpSys(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="120"
                      title="ความดันตัวบน (Systolic)"
                      className="w-full border border-gray-200 rounded-lg p-1.5 text-xs text-center font-semibold focus:outline-none focus:ring-2 focus:ring-[#1E4D38]"
                    />
                    <span className="text-gray-400 font-bold">/</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={bpDia}
                      onChange={(e) => setBpDia(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="80"
                      title="ความดันตัวล่าง (Diastolic)"
                      className="w-full border border-gray-200 rounded-lg p-1.5 text-xs text-center font-semibold focus:outline-none focus:ring-2 focus:ring-[#1E4D38]"
                    />
                    <span className="text-[10px] text-gray-400 shrink-0">mmHg</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-gray-500 block">ชีพจร Pulse (ครั้ง/นาที)</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={pulseStr}
                      onChange={(e) => setPulseStr(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="75"
                      className="w-full border border-gray-200 rounded-lg p-1.5 text-xs text-center font-semibold focus:outline-none focus:ring-2 focus:ring-[#1E4D38]"
                    />
                    <span className="text-[10px] text-gray-400 shrink-0">bpm</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-gray-500 block">อุณหภูมิ Temp (°C)</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={tempStr}
                      onChange={(e) => setTempStr(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="36.5"
                      className="w-full border border-gray-200 rounded-lg p-1.5 text-xs text-center font-semibold focus:outline-none focus:ring-2 focus:ring-[#1E4D38]"
                    />
                    <span className="text-[10px] text-gray-400 shrink-0">°C</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* คอลัมน์ขวา: ยาแผนปัจจุบันที่ใช้อยู่ */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <div>
                <h3 className="font-bold text-sm text-[#14261D]">ยาแผนปัจจุบันที่ใช้อยู่ (Current Meds)</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  รองรับทั้งพิมพ์เล็ก/พิมพ์ใหญ่ ภาษาไทย/อังกฤษ มีหรือไม่มีหน่วย mg หรือจุด (.)
                </p>
              </div>
              <span className="bg-[#FAF9F5] text-gray-600 px-2 py-0.5 rounded text-[11px] font-semibold border border-gray-200">
                {medsList.length} รายการ
              </span>
            </div>

            {/* รายการยาที่มี */}
            {medsList.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {medsList.map((med, idx) => {
                  const riskInfo = evaluateSingleDrugRisk(med);
                  const isCritical = riskInfo.level === 'CRITICAL';
                  const isModerate = riskInfo.level === 'MODERATE';

                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                        isCritical
                          ? 'bg-[#FFF8F8] border-red-200 text-[#9A2E2E]'
                          : isModerate
                          ? 'bg-[#FFFDF5] border-amber-200 text-[#9A6B1F]'
                          : 'bg-[#F8F9F8] border-gray-200 text-[#14261D]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isCritical
                              ? 'bg-red-500'
                              : isModerate
                              ? 'bg-amber-500'
                              : 'bg-[#1E4D38]'
                          }`}
                        />
                        <span className="font-bold">{med}</span>
                        {riskInfo.isRisk && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isCritical
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {riskInfo.badgeText}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMed(idx)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded-md transition cursor-pointer"
                        title="ลบยานี้"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 border border-dashed border-gray-200 rounded-xl text-center text-gray-400 text-xs">
                ยังไม่มีรายการยาแผนปัจจุบัน (พิมพ์ชื่อยาในช่องด้านล่างเพื่อเพิ่ม)
              </div>
            )}

            {/* ช่องพิมพ์เพิ่มยา */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
              <input
                type="text"
                value={newMedInput}
                onChange={(e) => setNewMedInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMed()}
                placeholder="พิมพ์ชื่อยา เช่น warfarin, Warfarin 3mg, วาร์ฟาริน, แอสไพริน..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E4D38]"
              />
              <button
                type="button"
                onClick={handleAddMed}
                className="bg-[#1E4D38] hover:bg-[#163B2B] text-white text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1 cursor-pointer shrink-0 transition"
              >
                <Plus className="w-3.5 h-3.5" /> เพิ่มยา
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setCurrentStep('S2')}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-600 cursor-pointer transition"
            >
              ← ย้อนกลับ
            </button>
            <button
              type="button"
              onClick={handleProceed}
              className="px-5 py-2.5 bg-[#1E4D38] hover:bg-[#163B2B] active:scale-98 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition"
            >
              เริ่มซักประวัติ <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
