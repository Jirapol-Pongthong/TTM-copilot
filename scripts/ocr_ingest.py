import json
import os
from google import genai
from PIL import Image

client = genai.Client()

def ocr_textbook_page(img_path: str, book_name: str, page_no: int, chapter: str, category: str):
    if not os.path.exists(img_path):
        print(f"คำเตือน: ไม่พบไฟล์รูปภาพที่ {img_path}")
        return None

    img = Image.open(img_path)
    
    # Prompt
    prompt = """
    คุณคือผู้เชี่ยวชาญด้านเวชกรรมไทยและเอกสารโบราณ
    กรุณาถอดข้อความภาษาไทยทั้งหมดที่ปรากฏในหน้าตำรานี้อย่างละเอียด
    - คงตัวสะกด คำศัพท์เฉพาะ รสยา และชื่อสมุนไพรตามต้นฉบับ 100%
    - ตัดหัวกระดาษหรือเลขหน้าที่ไม่เกี่ยวข้องออก เอาเฉพาะเนื้อหาทางคลินิก
    """

    print(f"กำลังทำ OCR หน้า {page_no} จากเล่ม '{book_name}'...")
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[img, prompt]
    )

    return {
        "id": f"{book_name}_P{page_no}",
        "book": book_name,
        "chapter": chapter,
        "page": page_no,
        "category": category,
        "image": f"/scans/{os.path.basename(img_path)}",
        "quote": response.text.strip()
    }

def main():
    # 2. กำหนดรายการหน้าที่ต้องการทำ OCR
    pages_to_ocr = [
        {
            "img_path": "public/scans/page_12.jpg",
            "book_name": "คัมภีร์ธาตุบรรจบ",
            "page_no": 12,
            "chapter": "ว่าด้วยลักษณะวาโยธาตุพิการ",
            "category": "ธาตุสมุฏฐาน"
        },
        {
            "img_path": "public/scans/page_34.jpg",
            "book_name": "คัมภีร์เวชศึกษา",
            "page_no": 34,
            "chapter": "ว่าด้วยปัจฉิมวัยและวาโยสมุฏฐาน",
            "category": "อายุสมุฏฐาน"
        },
        {
            "img_path": "public/scans/page_58.jpg",
            "book_name": "ตำราเวชกรรมไทย เล่ม 1",
            "page_no": 58,
            "chapter": "ว่าด้วยอิทธิพลของวสันตฤดู",
            "category": "อุตุสมุฏฐาน"
        }
    ]

    knowledge_chunks = []
    for item in pages_to_ocr:
        chunk = ocr_textbook_page(
            item["img_path"],
            item["book_name"],
            item["page_no"],
            item["chapter"],
            item["category"]
        )
        if chunk:
            knowledge_chunks.append(chunk)

    # 3. บันทึกผลลัพธ์ลง src/data/knowledge_chunks.json
    output_path = "src/data/knowledge_chunks.json"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(knowledge_chunks, f, ensure_ascii=False, indent=2)

    print(f"ทำ OCR เสร็จสิ้น บันทึกไฟล์แล้วที่: {output_path}")

if __name__ == "__main__":
    main()