// src/components/page/PatientList.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useCase } from '@/context/CaseContext';
import { PatientQueueItem } from '@/types/clinicalCase';
import AppShell from '@/components/AppShell';
import { Plus, Search, FileText, X, CheckCircle2, Pill, Stethoscope, Clock, ShieldCheck } from 'lucide-react';

export default function Step2PatientList() {
  const { patientQueue, loadCase, loadDemoCase, startNewCase } = useCase();
  const [searchTerm, setSearchTerm] = useState('');

  // Modal ดูประวัติการรักษาผู้ป่วยที่ตรวจแล้ว
  const [selectedHistoryPatient, setSelectedHistoryPatient] = useState<PatientQueueItem | null>(null);

  // กรองรายการผู้ป่วยตามตัวค้นหา (ชื่อ, HN, หรืออาการสำคัญ)
  const filteredPatients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return patientQueue;
    return patientQueue.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.hn.toLowerCase().includes(query) ||
        p.symptoms.toLowerCase().includes(query)
    );
  }, [searchTerm, patientQueue]);

  const totalCount = patientQueue.length;
  const waitingCount = patientQueue.filter((p) => p.status === 'รอตรวจ').length;
  const doneCount = patientQueue.filter((p) => p.status === 'ตรวจแล้ว').length;

  const handleOpenPatientCase = (patient: PatientQueueItem) => {
    if (patient.caseSnapshot) {
      loadCase(patient.caseSnapshot);
    } else {
      loadDemoCase(patient.demoType || 'somsri');
    }
  };

  return (
    <AppShell title="ผู้ป่วยวันนี้" subtitle="วันอังคารที่ 28 ตุลาคม 2569 · รพ.สต. ตัวอย่าง">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        {/* Search Bar + สรุปจำนวนเคสในแถวเดียวกัน + ปุ่มเปิดเคสใหม่ */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อผู้ป่วย, เลข HN, หรืออาการสำคัญ..."
                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E4D38] transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* แถบสรุปจำนวนเคสอยู่ข้างช่องค้นหา */}
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-gray-100 text-[#14261D] font-bold px-3 py-1.5 rounded-lg border border-gray-200">
                เคสวันนี้: <span className="text-sm">{totalCount}</span>
              </span>
              <span className="bg-[#FDF0D5] text-[#9A6B1F] font-bold px-3 py-1.5 rounded-lg border border-[#E5C483]">
                รอตรวจ: <span className="text-sm">{waitingCount}</span>
              </span>
              <span className="bg-[#EAF3EE] text-[#1E4D38] font-bold px-3 py-1.5 rounded-lg border border-emerald-200">
                ตรวจแล้ว: <span className="text-sm">{doneCount}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={startNewCase}
              className="flex items-center gap-1.5 bg-[#1E4D38] hover:bg-[#163B2B] text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> เปิดเคสใหม่
            </button>
          </div>
        </div>

        {/* ตารางผู้ป่วย */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF9F5] text-[#5C7065] font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">เวลา</th>
                <th className="py-3 px-4">ผู้ป่วย / HN</th>
                <th className="py-3 px-4">อายุ</th>
                <th className="py-3 px-4">อาการสำคัญ</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4 text-right">การกระทำ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => {
                  const isWaiting = patient.status === 'รอตรวจ';
                  return (
                    <tr
                      key={patient.id}
                      className="bg-white hover:bg-emerald-50/30 transition"
                    >
                      <td className="py-3.5 px-4 font-semibold text-[#14261D]">{patient.time}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#14261D]">{patient.name}</div>
                        <div className="text-[10px] text-gray-400">{patient.hn}</div>
                      </td>
                      <td className="py-3.5 px-4">{patient.age} ปี ({patient.gender})</td>
                      <td className="py-3.5 px-4 text-gray-700 max-w-xs">{patient.symptoms}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold px-2.5 py-0.5 rounded-full text-[10px] ${
                            isWaiting
                              ? 'bg-[#FCECD2] text-[#9A6B1F]'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {patient.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {patient.status === 'รอตรวจ' ? (
                          <button
                            onClick={() => handleOpenPatientCase(patient)}
                            className="border border-[#1E4D38] text-[#1E4D38] hover:bg-[#1E4D38] hover:text-white font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer shadow-2xs"
                          >
                            เปิดเคส
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedHistoryPatient(patient)}
                            className="border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ml-auto"
                          >
                            <FileText className="w-3.5 h-3.5 text-gray-500" /> ดูประวัติ
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    ไม่พบผู้ป่วยที่ตรงกับคำค้นหา &quot;{searchTerm}&quot;
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ดูประวัติการรักษาผู้ป่วยที่ตรวจแล้ว */}
      {selectedHistoryPatient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-[#14261D]">
                    {selectedHistoryPatient.name}
                  </h3>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ตรวจแล้ว ({selectedHistoryPatient.time} น.)
                  </span>
                </div>
                <p className="text-gray-500 text-[11px] mt-0.5">
                  อายุ {selectedHistoryPatient.age} ปี ({selectedHistoryPatient.gender}) · HN: {selectedHistoryPatient.hn} · หน่วยบริการปฐมภูมิ
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHistoryPatient(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedHistoryPatient.historyDetail ? (
              <div className="space-y-3.5">
                {/* อาการสำคัญ & โรคประจำตัว */}
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-gray-500 w-28 shrink-0">อาการสำคัญ (CC):</span>
                    <span className="font-bold text-[#14261D]">
                      {selectedHistoryPatient.historyDetail.chiefComplaint}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-gray-500 w-28 shrink-0">โรคประจำตัว:</span>
                    <span className="text-gray-700">
                      {selectedHistoryPatient.historyDetail.underlyingDiseases.join(', ') || 'ไม่มี'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-gray-500 w-28 shrink-0">ยาแผนปัจจุบัน:</span>
                    <span className="text-gray-700">
                      {selectedHistoryPatient.historyDetail.currentMeds.join(', ') || 'ไม่มี'}
                    </span>
                  </div>
                </div>

                {/* สมุฏฐานวินิจฉัย */}
                <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-[#E5C483]/50">
                  <div className="flex items-center gap-1.5 font-bold text-[#7A5214] mb-1">
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>ผลการประเมินสมุฏฐาน 4</span>
                  </div>
                  <p className="text-[#14261D] font-semibold">
                    {selectedHistoryPatient.historyDetail.smutthan}
                  </p>
                </div>

                {/* ยาและหัตถการที่จ่ายแล้ว */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#14261D]">
                    <Pill className="w-3.5 h-3.5 text-[#1E4D38]" />
                    <span>รายการยาสมุนไพรและหัตถการที่สั่งจ่าย</span>
                  </div>
                  {selectedHistoryPatient.historyDetail.prescriptions.map((rx, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-emerald-200 bg-[#F4F8F5] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1E4D38] text-xs">{rx.name}</span>
                        <span className="bg-[#FDF0D5] text-[#7A5214] text-[10px] font-bold px-2 py-0.5 rounded">
                          {rx.rasa}
                        </span>
                      </div>
                      <p className="text-gray-700 text-[11px]">วิธีใช้: {rx.dosage}</p>
                    </div>
                  ))}
                </div>

                {/* รหัส ICD-10-TM */}
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#14261D]">รหัสวินิจฉัยและหัตถการ (ICD-10-TM)</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> ส่งออก HDC แล้ว
                    </span>
                  </div>
                  <ul className="space-y-1 text-gray-700 font-mono text-[11px]">
                    {selectedHistoryPatient.historyDetail.icdCodes.map((code, i) => (
                      <li key={i} className="bg-gray-50 px-2.5 py-1 rounded border border-gray-100">
                        • {code}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">ไม่มีข้อมูลประวัติการรักษา</p>
            )}

            <div className="flex justify-end items-center gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  const pt = selectedHistoryPatient;
                  setSelectedHistoryPatient(null);
                  handleOpenPatientCase(pt);
                }}
                className="px-4 py-2 border border-[#1E4D38] text-[#1E4D38] hover:bg-emerald-50 rounded-lg font-semibold cursor-pointer transition"
              >
                แก้ไข / เปิดดูในหน้าตรวจ
              </button>
              <button
                type="button"
                onClick={() => setSelectedHistoryPatient(null)}
                className="px-4 py-2 bg-[#1E4D38] hover:bg-[#163B2B] text-white rounded-lg font-bold cursor-pointer transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
