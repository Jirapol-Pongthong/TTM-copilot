# scripts/extract_scans.py
"""
สคริปต์สำหรับสกัดภาพสแกนความละเอียดสูง (Digital Archive Scans) 
จากไฟล์ PDF ตำราหลวงของกรมการแพทย์แผนไทยและการแพทย์ทางเลือก
เข้าสู่โฟลเดอร์ public/scans/ เพื่อให้ระบบ TTM Copilot แสดงผลใน Modal ได้แบบ 100%
"""

import os
import sys
import fitz  # PyMuPDF 라이บรารีสกัดเอกสาร PDF ระดับมืออาชีพ

# บังคับ Terminal ให้แสดงผลภาษาไทย UTF-8 ถูกต้องบน Windows
sys.stdout.reconfigure(encoding='utf-8')

# 1. กำหนด Path ต้นทาง (PDF E-books) และ ปลายทาง (Next.js public/scans)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(BASE_DIR, 'public', 'scans')
PDF_DIR = os.path.join(os.path.dirname(BASE_DIR), 'Track 1 เวชกรรม', 'E-book')

os.makedirs(OUT_DIR, exist_ok=True)

# 2. ระบุไฟล์ PDF และหน้าที่ต้องการสกัด
BOOKS_CONFIG = [
    {
        'pdf_name': 'ตำราพื้นฐานวิชาชีพการแพทย์แผนไทย เล่ม 1.pdf',
        'pages': [1, 14, 18, 22, 24, 25, 30, 31, 40, 42, 45, 48, 50, 52, 55, 60, 65, 68, 70, 72, 75, 78, 80, 81, 82, 88, 92],
        'prefix': 'page_',
        'ext': '.jpg',
        'dpi': 150
    },
    {
        'pdf_name': 'แนวทางปฏิบัติเวชกรรมดูแลผู้ป่วยปฐมภูมิ.pdf',
        'pages': [89, 90, 91],
        'prefix': 'scan_แนวทางปฏิบัติเวชกรรมดูแลผู้ป่วยปฐมภูมิ_page_',
        'ext': '.png',
        'dpi': 200
    }
]

def extract_pdf_pages():
    total_saved = 0
    print("เริ่มต้นกระบวนการสกัดภาพสแกนจากตำราทางการ...")

    for config in BOOKS_CONFIG:
        pdf_path = os.path.join(PDF_DIR, config['pdf_name'])
        if not os.path.exists(pdf_path):
            print(f"⚠️ ไม่พบไฟล์ PDF: {pdf_path}")
            continue

        print(f"\n📖 กำลังอ่านไฟล์: {config['pdf_name']}")
        doc = fitz.open(pdf_path)

        for p in config['pages']:
            # ในระบบ PDF หน้าแรกจะนับเป็น Index 0 (0-indexed)
            idx = p - 1
            if 0 <= idx < len(doc):
                page = doc[idx]
                
                # แปลง Vector หน้า PDF เป็น Bitmap ความละเอียดสูงตามค่า DPI ที่กำหนด
                pix = page.get_pixmap(dpi=config['dpi'])
                
                out_filename = f"{config['prefix']}{p}{config['ext']}"
                out_filepath = os.path.join(OUT_DIR, out_filename)
                
                pix.save(out_filepath)
                total_saved += 1
                print(f"  ✓ บันทึกสำเร็จ: {out_filename} (หน้า {p})")
            else:
                print(f"  ❌ หน้า {p} เกินขอบเขตของเอกสาร")

    print(f"\n🎉 สกัดเสร็จสมบูรณ์ทั้งหมด {total_saved} ไฟล์ลงใน: {OUT_DIR}")

if __name__ == '__main__':
    extract_pdf_pages()
