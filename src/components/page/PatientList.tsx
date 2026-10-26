// src/components/page/PatientList.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useCase } from '@/context/CaseContext';
import AppShell from '@/components/AppShell';
import { Plus, Search, FileText, X, CheckCircle2, Pill, Stethoscope, Clock, ShieldCheck } from 'lucide-react';

interface PatientHistoryDetail {
  chiefComplaint: string;
  underlyingDiseases: string[];
  currentMeds: string[];
  smutthan: string;
  prescriptions: {
    name: string;
    dosage: string;
    rasa: string;
  }[];
  icdCodes: string[];
  examTime: string;
}

interface PatientItem {
  id: string;
  hn: string;
  time: string;
  name: string;
  age: number;
  gender: 'ชาย' | 'หญิง';
  symptoms: string;
  status: 'รอตรวจ' | 'ตรวจแล้ว';
  demoType?: 'somsri' | 'somchai';
  historyDetail?: PatientHistoryDetail;
}

const PATIENTS: PatientItem[] = [
  {
    id: 'DEMO-PT-001',
    hn: 'HN-982341',
    time: '10:30',
    name: 'คุณสมศรี ใจดี',
    age: 58,
    gender: 'หญิง',
    symptoms: 'ท้องอืด แน่นท้อง ปวดเมื่อยตามตัว 4 วัน',
    status: 'รอตรวจ',
    demoType: 'somsri',
  },
  {
    id: 'DEMO-PT-002',
    hn: 'HN-445892',
    time: '10:50',
    name: 'นายสมชาย รักไทย',
    age: 65,
    gender: 'ชาย',
    symptoms: 'ปวดขัดข้อเข่าเรื้อรัง 2 ข้าง ลุกยืนลำบาก (ข้อเข่าเสื่อม OA Knee)',
    status: 'รอตรวจ',
    demoType: 'somchai',
  },
  {
    id: 'DEMO-PT-003',
    hn: 'HN-312905',
    time: '09:15',
    name: 'นางมาลี สุขเกษม',
    age: 49,
    gender: 'หญิง',
    symptoms: 'ปวดตึงคอบ่าสะบัก ปวดศีรษะข้างเดียว (ลมขึ้นเบื้องบน / ลมปะกัง)',
    status: 'ตรวจแล้ว',
    historyDetail: {
      chiefComplaint: 'ปวดตึงคอบ่าสะบักร้าวขึ้นศีรษะข้างขวา ตาพร่า มึนศีรษะ เรื้อรัง 5 วัน',
      underlyingDiseases: ['ไมเกรน (Migraine)', 'ความดันโลหิตสูง (HT)'],
      currentMeds: ['Enalapril 5mg 1 tab od pc', 'Paracetamol 500mg prn'],
      smutthan: 'วาโยธาตุ (อุทธังคมาวาตา) กำเริบเนื่องจากความเครียดและการนั่งทำงานนาน',
      prescriptions: [
        {
          name: 'ยาหอมนวโกฐ (แคปซูล)',
          dosage: '2 แคปซูล วันละ 3 ครั้ง ละลายน้ำอุ่น ก่อนอาหาร 5 วัน',
          rasa: 'รสสุขุม / หอมร้อน (แก้ลมกองละเอียด)',
        },
        {
          name: 'หัตถการ: นวดราชสำนักแก้อาการลมปะกังและประคบสมุนไพร',
          dosage: 'นวดจุดสัญญาณศีรษะและคอบ่า 45 นาที สัปดาห์ละ 1 ครั้ง',
          rasa: 'หัตถการภายนอก (ไม่ใช้ยากิน)',
        },
      ],
      icdCodes: ['U50.1 (G44.2) ลมปะกัง / ปวดศีรษะจากลมขึ้นเบื้องบน', 'U60.2 นวดรักษาทางการแพทย์แผนไทย'],
      examTime: '09:15 น. (เสร็จสมบูรณ์)',
    },
  },
  {
    id: 'DEMO-PT-004',
    hn: 'HN-772183',
    time: '09:45',
    name: 'นายประสิทธิ์ มั่นคง',
    age: 52,
    gender: 'ชาย',
    symptoms: 'ไข้หวัด ครั่นเนื้อครั่นตัว มีน้ำมูก ไอมีเสมหะ (เตโช-อาโป)',
    status: 'ตรวจแล้ว',
    historyDetail: {
      chiefComplaint: 'มีไข้ ตัวร้อน ครั่นเนื้อครั่นตัว ไอมีเสมหะขาวขุ่น เจ็บคอ 2 วันหลังโดนฝน',
      underlyingDiseases: ['ภูมิแพ้อากาศ (Allergic Rhinitis)'],
      currentMeds: ['Cetirizine 10mg 1 tab hs'],
      smutthan: 'เตโชธาตุ (สันตัปปัคคี) กำเริบ ร่วมกับ อาโปธาตุ (เสมหะสมุฏฐาน)',
      prescriptions: [
        {
          name: 'ยาจันทน์ลีลา (แคปซูล)',
          dosage: '2 แคปซูล วันละ 3 ครั้ง ก่อนอาหาร หรือเวลามีไข้ทุก 4–6 ชม. 3 วัน',
          rasa: 'รสขม / เย็น (แก้ไข้ ดับพิษร้อน)',
        },
        {
          name: 'ยาประสะมะแว้ง (เม็ดอม)',
          dosage: 'อมครั้งละ 1–2 เม็ด เมื่อมีอาการไอหรือระคายคอ วันละ 4 ครั้ง',
          rasa: 'รสเปรี้ยว / ขมฝาด (กัดฟอกเสมหะ)',
        },
      ],
      icdCodes: ['U51.0 (R50.9) ไข้เพื่อเตโชธาตุกำเริบ (ไข้หวัดเปลี่ยนฤดู)', 'U52.1 (R05) อาการไอจากเสมหะ'],
      examTime: '09:45 น. (เสร็จสมบูรณ์)',
    },
  },
];

export default function Step2PatientList() {
  const { loadDemoCase, startNewCase } = useCase();
  const [searchTerm, setSearchTerm] = useState('');

  // Modal ดูประวัติการรักษาผู้ป่วยที่ตรวจแล้ว
  const [selectedHistoryPatient, setSelectedHistoryPatient] = useState<PatientItem | null>(null);

  // กรองรายการผู้ป่วยตามตัวค้นหา (ชื่อ, HN, หรืออาการสำคัญ)
  const filteredPatients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return PATIENTS;
    return PATIENTS.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.hn.toLowerCase().includes(query) ||
        p.symptoms.toLowerCase().includes(query)
    );
  }, [searchTerm]);

  return (
    <AppShell title="ผู้ป่วยวันนี้" subtitle="วันอังคารที่ 28 ตุลาคม 2569 · รพ.สต. ตัวอย่าง">
      {/* การ์ดสถิติผู้ป่วย */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-3xl font-extrabold text-[#14261D]">{PATIENTS.length}</span>
          <p className="text-xs text-[#5C7065] mt-1">เคสวันนี้</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-3xl font-extrabold text-[#C08A3E]">
            {PATIENTS.filter((p) => p.status === 'รอตรวจ').length}
          </span>
          <p className="text-xs text-[#5C7065] mt-1">รอตรวจ</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-3xl font-extrabold text-[#1E4D38]">
            {PATIENTS.filter((p) => p.status === 'ตรวจแล้ว').length}
          </span>
          <p className="text-xs text-[#5C7065] mt-1">ตรวจแล้ว</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        {/* Search Bar & ปุ่มเปิดเคสใหม่ */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
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

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400 hidden sm:inline">
              พบ {filteredPatients.length} รายการ
            </span>
            <button
              onClick={startNewCase}
              className="flex items-center gap-1.5 bg-[#1E4D38] hover:bg-[#163B2B] text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> เปิดเคสใหม่
            </button>
          </div>
        </div>

        {/* ตารางผู้ป่วย (ปรับสีแถวรอตรวจให้เหมือนกันเป็นมาตรฐานเดียว) */}
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
                            onClick={() => loadDemoCase(patient.demoType || 'somsri')}
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
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedHistoryPatient.historyDetail ? (
              <div className="space-y-3.5">
                {/* อาการสำคัญ & โรคประจำตัว */}
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1.5">
                  <p className="text-gray-500 font-semibold">อาการสำคัญ (Chief Complaint):</p>
                  <p className="font-bold text-[#14261D] text-sm">
                    {selectedHistoryPatient.historyDetail.chiefComplaint}
                  </p>
                  <div className="pt-1 text-[11px] text-gray-600 flex flex-wrap gap-4">
                    <span>
                      โรคประจำตัว: <strong>{selectedHistoryPatient.historyDetail.underlyingDiseases.join(', ')}</strong>
                    </span>
                    <span>
                      ยาเดิมที่ใช้อยู่: <strong>{selectedHistoryPatient.historyDetail.currentMeds.join(', ')}</strong>
                    </span>
                  </div>
                </div>

                {/* สมุฏฐานวินิจฉัย */}
                <div className="p-3.5 rounded-xl border border-amber-100 bg-[#FFFDF9] space-y-1">
                  <span className="text-[10px] font-bold text-[#9A6B1F] bg-[#FDF0D5] px-2 py-0.5 rounded">
                    สมุฏฐานวินิจฉัย
                  </span>
                  <p className="font-semibold text-[#14261D] pt-1">
                    {selectedHistoryPatient.historyDetail.smutthan}
                  </p>
                </div>

                {/* ยาและหัตถการที่แพทย์สั่งจ่ายให้ในครั้งนี้ */}
                <div>
                  <h4 className="font-bold text-xs text-[#14261D] mb-2 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-[#1E4D38]" />
                    ยาและหัตถการที่แพทย์สั่งจ่ายให้ (Prescriptions & Procedures):
                  </h4>
                  <div className="space-y-2">
                    {selectedHistoryPatient.historyDetail.prescriptions.map((rx, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-gray-200 bg-white flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-[#1E4D38] text-xs">{rx.name}</p>
                          <p className="text-gray-600 text-[11px] mt-0.5">{rx.dosage}</p>
                        </div>
                        <span className="bg-[#FAF9F5] text-[#7A5214] border border-[#F3E2BD] px-2 py-1 rounded text-[10px] font-semibold shrink-0">
                          {rx.rasa}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* รหัสสถิติที่บันทึก */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">รหัส ICD-10-TM แผนไทย:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedHistoryPatient.historyDetail.icdCodes.map((code, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-800 font-mono px-2 py-0.5 rounded font-semibold">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 py-4 text-center">ไม่มีข้อมูลประวัติเพิ่มเติม</p>
            )}

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedHistoryPatient(null)}
                className="px-4 py-2 bg-[#1E4D38] hover:bg-[#163B2B] text-white rounded-lg text-xs font-bold transition cursor-pointer"
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
