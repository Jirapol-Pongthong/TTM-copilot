# GENESIS

**GENESIS: ปัญญาประดิษฐ์สนับสนุนการตัดสินใจทางคลินิกการแพทย์แผนไทย (Clinical Decision Support System - CDSS) สำหรับหน่วยบริการปฐมภูมิ**
*DTAM Hackathon 2026 — Track 1: เวชกรรมไทย*

---

## 🌟 ฟีเจอร์หลัก (Key Features)

1. **สกัดอาการและวัดระดับความปวดอัตโนมัติ (Clinical NLP & LLM Symptom Extraction):**
   - รองรับทั้งการพิมพ์และพูดบันทึกเสียงภาษาไทย (Web Speech API)
   - สกัด Chief Complaint, Duration, ธาตุต้องสงสัย และสเกลความปวด **VAS (1–10)**

2. **โมเดลวิเคราะห์สมุฏฐาน ๔ เชิงปริมาณ (Quantitative Dosha Engine):**
   - อัลกอริทึม AHP & Delphi Consensus คำนวณคะแนนตรีโทษ (วาตะ, ปิตตะ, เสมหะ) เต็ม 10.0 คะแนน
   - เชื่อมต่อ **Live Weather API (Open-Meteo)** ตรวจจับภาวะ **อุตุแปรปรวน** แบบ Real-time เพื่อป้องกันการวินิจฉัยผิดพลาด

3. **ฐานความรู้ตำราและคัมภีร์เวชกรรมไทยดิจิทัล (DTAM Knowledge Archive):**
   - รวมข้อมูลมาตรฐาน 572 รายการ (กฎสมุฏฐาน 139 ข้อ, ตำรับยา 130 ตำรับ, ปฏิกิริยายา 135 คู่, รหัส ICD-10-TM/U-Codes 128 รหัส, Chunks ตำรา 40 เรื่อง) พร้อมภาพสแกน 99 หน้า

4. **ระบบความปลอดภัยและการจ่ายยา (Herb-Drug Interaction Guardrails):**
   - ตรวจสอบความปลอดภัยสองชั้น ป้องกันการตีกันระหว่างยาสมุนไพรกับยาแผนปัจจุบัน (WARNING / CRITICAL) พร้อมข้อห้ามใช้ (Contraindications)

---

## 🚀 เริ่มต้นใช้งาน (Getting Started)

```bash
# ติดตั้ง dependencies
npm install

# รัน Development Server
npm run dev
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

---

## 📦 Production Build

```bash
npm run build
npm run start
```
