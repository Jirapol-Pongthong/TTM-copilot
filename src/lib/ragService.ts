// src/lib/ragService.ts
import knowledgeChunks from '@/data/knowledge_chunks.json';

export interface KnowledgeChunk {
  id: string;
  book: string;
  page: number;
  chapter: string;
  category?: string;
  image?: string;
  content: string;
  tags: string[];
  sourceMethod?: string;
}

export interface RetrievalResult {
  found: boolean;
  message: string;
  chunk?: KnowledgeChunk;
  excerpt?: string;
  citationBadge?: string;
  scanImageUrl?: string;
}

/**
 * ดึงรายละเอียดการอ้างอิงตำราจากชื่อหนังสือและเลขหน้า
 */
export function getCitationDetails(bookName: string, pageNumber?: number): KnowledgeChunk | undefined {
  const clean = bookName.replace(/คัมภีร์|ตำรา|แนวทางปฏิบัติ|คู่มือ/g, '').trim();
  const allChunks = knowledgeChunks as KnowledgeChunk[];

  // 1. Exact match (book & page)
  let found = allChunks.find((chunk) => {
    const bMatch =
      chunk.book.includes(bookName) ||
      bookName.includes(chunk.book) ||
      (clean && chunk.book.includes(clean));
    return bMatch && (pageNumber ? chunk.page === pageNumber : true);
  });

  // 2. Partial book/id/chapter match
  if (!found && clean) {
    found = allChunks.find(
      (chunk) =>
        chunk.book.includes(clean) ||
        chunk.id.includes(clean) ||
        chunk.chapter.includes(clean)
    );
  }

  // 3. Fallback: match by page if available
  if (!found && pageNumber) {
    found = allChunks.find((chunk) => chunk.page === pageNumber);
  }

  // Fallback scan image URL if found
  if (found && !found.image && found.page) {
    return { ...found, image: `/scans/page_${found.page}.jpg` };
  }

  return found;
}

/**
 * ค้นหาข้อความอ้างอิงในคลังตำรา (Lightweight RAG Retriever)
 * มีระบบความปลอดภัย: หากค้นไม่พบ จะส่งข้อความแจ้งเตือนมาตรฐาน ห้าม AI มโนอ้างอิงเอง
 */
export function retrieveTextbookCitation(queryKeyword: string): RetrievalResult {
  const q = queryKeyword.toLowerCase().trim();
  if (!q) {
    return {
      found: false,
      message: 'กรุณาระบุคำค้นหาเพื่อดึงหลักฐานอ้างอิงจากคลังตำรา',
    };
  }

  const matches = (knowledgeChunks as KnowledgeChunk[]).filter(
    (c) =>
      c.content.toLowerCase().includes(q) ||
      c.book.toLowerCase().includes(q) ||
      c.chapter.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q))
  );

  if (matches.length === 0) {
    return {
      found: false,
      message: 'ไม่พบหลักฐานอ้างอิงเพียงพอในคลังตำรามาตรฐาน',
    };
  }

  const best = matches[0];
  return {
    found: true,
    message: 'พบหลักฐานอ้างอิงในคลังตำรามาตรฐาน',
    chunk: best,
    excerpt: best.content.slice(0, 200) + '...',
    citationBadge: `[${best.book} หน้า ${best.page}]`,
    scanImageUrl: best.image,
  };
}

/**
 * ค้นหาแบบรายการทั้งหมดสำหรับฟังก์ชัน Search / Filter
 */
export function searchKnowledgeChunks(keyword: string): KnowledgeChunk[] {
  const q = keyword.toLowerCase().trim();
  if (!q) return knowledgeChunks as KnowledgeChunk[];

  return (knowledgeChunks as KnowledgeChunk[]).filter(
    (chunk) =>
      chunk.content.toLowerCase().includes(q) ||
      chunk.book.toLowerCase().includes(q) ||
      chunk.chapter.toLowerCase().includes(q) ||
      chunk.tags.some((t) => t.toLowerCase().includes(q))
  );
}
