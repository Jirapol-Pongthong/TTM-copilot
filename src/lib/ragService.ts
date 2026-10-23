// src/lib/ragService.ts
import knowledgeChunks from '@/data/knowledge_chunks.json';

export interface KnowledgeChunk {
  id: string;
  book: string;
  page: number;
  chapter: string;
  content: string;
  tags: string[];
}

export function getCitationDetails(bookName: string, pageNumber?: number): KnowledgeChunk | undefined {
  return (knowledgeChunks as KnowledgeChunk[]).find((chunk) => {
    const bookMatch = chunk.book.includes(bookName) || bookName.includes(chunk.book);
    if (pageNumber) {
      return bookMatch && chunk.page === pageNumber;
    }
    return bookMatch;
  });
}

export function searchKnowledgeChunks(keyword: string): KnowledgeChunk[] {
  const q = keyword.toLowerCase();
  return (knowledgeChunks as KnowledgeChunk[]).filter(
    (chunk) =>
      chunk.content.toLowerCase().includes(q) ||
      chunk.book.toLowerCase().includes(q) ||
      chunk.tags.some((t) => t.toLowerCase().includes(q))
  );
}
