import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { extractThaiSymptomsDeterministic } from '@/lib/symptomExtractor';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai =
  apiKey && apiKey !== 'ใส่_API_KEY_ของคุณที่นี่'
    ? new GoogleGenAI({ apiKey })
    : null;

export async function POST(req: NextRequest) {
  let textPrompt = '';
  try {
    const body = await req.json();
    textPrompt = typeof body?.textPrompt === 'string' ? body.textPrompt.trim() : '';

    if (!textPrompt) {
      return NextResponse.json({ error: 'Invalid input prompt' }, { status: 400 });
    }

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: textPrompt,
          config: {
            systemInstruction:
              'คุณคือผู้ช่วยแพทย์แผนไทย สกัดข้อความประวัติผู้ป่วยให้อยู่ในรูป JSON ตาม Schema ที่กำหนด โดยจับคู่กับกลไกพยาธิสภาพเวชกรรมไทยอย่างแม่นยำ และสกัดระดับความปวด/ความรุนแรงของอาการ (painScore 1 ถึง 10) หากผู้ป่วยระบุตัวเลข เช่น ระดับ 8 หรือ 8/10 ให้ใช้เลขนั้น หากพูดว่าปวดมาก/รุนแรงให้ระบุ 8 หากปานกลางให้ระบุ 6 หากเล็กน้อยให้ระบุ 3 ห้ามแต่งข้อมูลอาการที่ไม่ได้อยู่ในข้อความของผู้ป่วยเด็ดขาด',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                chiefComplaint: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'รายการอาการสำคัญที่สกัดได้จากข้อความจริงของผู้ป่วย เช่น ปวดหัวด้านหลังศีรษะ ร้าวลงมาท้ายทอย',
                },
                duration: {
                  type: Type.STRING,
                  description: 'ระยะเวลาที่มีอาการ เช่น หลายวัน, 3 วัน, 1 สัปดาห์ หรือ ไม่ระบุระยะเวลา',
                },
                affectedDhatu: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'แนวโน้มธาตุที่เกี่ยวข้องตามคัมภีร์ เช่น วาโยธาตุ (ศิโรวาตะ + ราชยักษ์วาตะ), เตโชธาตุ (สันตัปปัคคี)',
                },
                painScore: {
                  type: Type.INTEGER,
                  description: 'ระดับความปวดหรือความรุนแรงของอาการ VAS Scale (1 ถึง 10)',
                },
                bowelMovement: {
                  type: Type.STRING,
                  description: 'การขับถ่าย เช่น ปกติ, ขับถ่ายไม่สะดวก, ถ่ายเหลว',
                },
              },
              required: ['chiefComplaint', 'duration', 'affectedDhatu', 'painScore'],
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (Array.isArray(parsed.chiefComplaint) && parsed.chiefComplaint.length > 0) {
            return NextResponse.json(parsed);
          }
        }
      } catch {
        // หาก API Key ไม่ถูกต้องหรือเครือข่ายขัดข้อง ให้ตกลงมาใช้ Deterministic Thai Clinical NLP Parser ด้านล่าง
      }
    }

    // ประมวลผลสกัดอาการจริงจากข้อความที่ผู้ใช้พิมพ์ด้วย Deterministic Thai Clinical NLP Parser
    const extracted = extractThaiSymptomsDeterministic(textPrompt);
    return NextResponse.json(extracted);
  } catch {
    const extracted = extractThaiSymptomsDeterministic(textPrompt);
    return NextResponse.json(extracted);
  }
}
