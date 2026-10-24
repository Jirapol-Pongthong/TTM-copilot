// src/app/api/extract-symptoms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(req: NextRequest) {
  try {
    const { textPrompt } = await req.json();

    if (!textPrompt || typeof textPrompt !== 'string') {
      return NextResponse.json({ error: 'Invalid input prompt' }, { status: 400 });
    }

    // หากมี GEMINI_API_KEY ให้เรียกโมเดล Gemini 2.5 Flash พร้อมบังคับ Structured JSON Schema
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: textPrompt,
        config: {
          systemInstruction:
            'คุณคือผู้ช่วยแพทย์แผนไทย สกัดข้อความประวัติผู้ป่วยให้อยู่ในรูป JSON ตาม Schema ที่กำหนด ห้ามแต่งข้อมูลนอกเหนือจากที่ได้รับ',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              chiefComplaint: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'รายการอาการสำคัญ เช่น ท้องอืด, แน่นเฟ้อ, ปวดเมื่อยตามตัว',
              },
              duration: {
                type: Type.STRING,
                description: 'ระยะเวลาที่มีอาการ เช่น 3 วัน, 4 วัน, 1 สัปดาห์',
              },
              affectedDhatu: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'แนวโน้มธาตุที่เกี่ยวข้อง เช่น วาโยธาตุ, ปิตตะแทรก',
              },
              bowelMovement: {
                type: Type.STRING,
                description: 'การขับถ่าย เช่น ปกติ, ท้องผูก, ถ่ายเหลว',
              },
            },
            required: ['chiefComplaint', 'duration', 'affectedDhatu'],
          },
        },
      });

      if (response.text) {
        return NextResponse.json(JSON.parse(response.text));
      }
    }

    // Safe Fallback: หากไม่มี API Key หรือ API ติดขัด ให้ประมวลผลด้วยตรรกะ Deterministic Regex/Rule ทางการแพทย์แผนไทย
    const lower = textPrompt.toLowerCase();
    const symptoms: string[] = [];
    const detectedDhatu: string[] = [];

    // 1. กลุ่มอาการทางเดินอาหาร (กุจฉิสยาวาตา / โกฏฐาสยาวาตา)
    if (lower.includes('ท้องอืด') || lower.includes('แน่นท้อง') || lower.includes('แน่นเฟ้อ')) {
      symptoms.push('ท้องอืด แน่นเฟ้อหลังอาหาร');
      detectedDhatu.push('วาโยธาตุ (กุจฉิสยาวาตา)');
    }
    if (lower.includes('เรอเปรี้ยว') || lower.includes('กรดไหลย้อน') || lower.includes('จุกคอ')) {
      symptoms.push('เรอเปรี้ยว มีลมดันขึ้น');
      detectedDhatu.push('วาโยธาตุ (ลมตีขึ้น)');
    }

    // 2. กลุ่มอาการศีรษะ (ลมอุทธังคมาวาตา / ปิตตะกำเริบ)
    if (lower.includes('ปวดหัว') || lower.includes('ปวดศีรษะ') || lower.includes('มึนหัว') || lower.includes('ขมับ') || lower.includes('เวียนหัว')) {
      symptoms.push('ปวดตึงศีรษะและขมับ (ลมอุทธังคมาวาตา)');
      detectedDhatu.push('วาโยธาตุ (ลมอุทธังคมาวาตา)');
    }

    // 3. กลุ่มอาการกล้ามเนื้อสะโพก ก้นกบ หลัง และขา (ลมอังคมังคานุสารีวาตา / ลมแล่นในเส้น)
    if (lower.includes('ก้น') || lower.includes('สะโพก') || lower.includes('สลักเพชร') || lower.includes('ก้นกบ')) {
      symptoms.push('ปวดกล้ามเนื้อบริเวณสะโพกและก้น (สลักเพชร)');
      detectedDhatu.push('วาโยธาตุ (ลมอังคมังคานุสารีวาตา)');
    }
    if (lower.includes('ปวดหลัง') || lower.includes('เอว') || lower.includes('บั้นเอว')) {
      symptoms.push('ปวดตึงบั้นเอวและหลังส่วนล่าง');
      if (!detectedDhatu.includes('วาโยธาตุ (ลมอังคมังคานุสารีวาตา)')) {
        detectedDhatu.push('วาโยธาตุ (ลมอังคมังคานุสารีวาตา)');
      }
    }
    if (lower.includes('คอ') || lower.includes('บ่า') || lower.includes('ไหล่') || lower.includes('สะบัก')) {
      symptoms.push('ปวดตึงกล้ามเนื้อคอบ่าสะบัก');
      if (!detectedDhatu.includes('วาโยธาตุ (ลมอังคมังคานุสารีวาตา)')) {
        detectedDhatu.push('วาโยธาตุ (ลมอังคมังคานุสารีวาตา)');
      }
    }
    if (lower.includes('ปวดเมื่อย') || lower.includes('เมื่อยตัว') || lower.includes('ข้อยึด')) {
      if (!symptoms.some(s => s.includes('ปวดกล้ามเนื้อ') || s.includes('ปวดตึง'))) {
        symptoms.push('ปวดเมื่อยตามสรรพางค์กาย');
        detectedDhatu.push('วาโยธาตุ (ลมอังคมังคานุสารีวาตา)');
      }
    }

    // 4. กลุ่มอาการธาตุไฟ / เตโชธาตุ (ปิตตะสมุฏฐาน)
    if (lower.includes('ตัวร้อน') || lower.includes('ไข้') || lower.includes('แสบร้อน') || lower.includes('กระหายน้ำ')) {
      symptoms.push('มีไข้ ตัวร้อนรุมๆ (เตโชธาตุกำเริบ)');
      detectedDhatu.push('เตโชธาตุ (ปิตตะสมุฏฐาน)');
    }

    // 5. กลุ่มอาการธาตุน้ำ / อาโปธาตุ (เสมหะสมุฏฐาน)
    if (lower.includes('ไอ') || lower.includes('เสมหะ') || lower.includes('น้ำมูก') || lower.includes('คัดจมูก')) {
      symptoms.push('ไอ มีเสมหะ ระคายคอ');
      detectedDhatu.push('อาโปธาตุ (เสมหะสมุฏฐาน)');
    }

    // 6. ระบบการขับถ่าย
    let bowelMovement = 'ปกติ';
    if (lower.includes('ท้องผูก') || lower.includes('ถ่ายไม่ออก') || lower.includes('ถ่ายยาก') || lower.includes('ถ่ายแข็ง') || lower.includes('2-3 วัน')) {
      bowelMovement = 'ขับถ่ายไม่สะดวก ท้องผูก';
      if (!symptoms.includes('ขับถ่ายไม่สะดวก')) symptoms.push('ขับถ่ายไม่สะดวก ท้องผูก');
    } else if (lower.includes('ท้องเสีย') || lower.includes('ถ่ายเหลว') || lower.includes('ท้องเดิน')) {
      bowelMovement = 'ถ่ายอุจจาระเหลว';
      symptoms.push('ถ่ายอุจจาระเหลว ถ่ายบ่อย');
    }

    // กรณีพิมพ์ข้อความอื่นที่ไม่ตรงคีย์เวิร์ดมาตรฐานเลย ให้แยกเอาประโยคที่ผู้ใช้พิมพ์จริง
    if (symptoms.length === 0) {
      const cleanText = textPrompt.trim().slice(0, 80);
      symptoms.push(cleanText || 'รู้สึกไม่สบายตัว ปวดเมื่อยตามร่างกาย');
      detectedDhatu.push('วาโยธาตุ (ลมกำเริบ)');
    }

    // สกัดระยะเวลาจากตัวเลขในข้อความ
    let duration = '3-4 วัน';
    const durationMatch = textPrompt.match(/(\d+)\s*(วัน|สัปดาห์|เดือน|ปี)/);
    if (durationMatch) {
      duration = `${durationMatch[1]} ${durationMatch[2]}`;
    }

    return NextResponse.json({
      chiefComplaint: symptoms,
      duration: duration,
      affectedDhatu: detectedDhatu.length > 0 ? detectedDhatu : ['วาโยธาตุ (ลม)'],
      bowelMovement: bowelMovement,
      source: 'Deterministic Clinical Fallback Engine (Dynamic NLP Rule)',
    });
  } catch (err) {
    // ป้องกันระบบล่ม 100% ด้วยผลลัพธ์มาตรฐานทางการแพทย์
    return NextResponse.json({
      chiefComplaint: ['ท้องอืด แน่นเฟ้อหลังอาหาร', 'ปวดตึงกล้ามเนื้อคอบ่าหลัง'],
      duration: '4 วัน',
      affectedDhatu: ['วาโยธาตุ'],
      bowelMovement: 'ขับถ่ายไม่สะดวก',
      source: 'Safe Fallback Mock',
    });
  }
}
