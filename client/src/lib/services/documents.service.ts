import { DocumentTemplate, DocumentCategory, DocumentDownloadRequest } from '@/types/document';

// Hujjatlar papkasidagi real fayllar
const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'valikli-zavod-otves',
    name: 'Валикли завод ОТВЕС',
    nameUz: 'Valikli zavod tortish hisoboti',
    description: 'Valikli zavodining tortish hisoboti 2025-yil uchun',
    category: DocumentCategory.PRODUCTION,
    fileName: 'Валикли завод_ОТВЕС_2025_й_ (3).xlsx',
    fileSize: 521732,
    lastModified: new Date('2025-12-03T14:23:41'),
    downloadCount: 0,
    isActive: true,
    requiredPermissions: ['PRODUCTION_READ']
  },
  {
    id: 'navbahor-production-2025-v3',
    name: 'НАВБАХОР 2025 йил ишлаб чиқариш махсулотлар (3)',
    nameUz: 'Navbahor 2025-yil ishlab chiqarish mahsulotlari (3-versiya)',
    description: 'Navbahor korxonasining 2025-yil ishlab chiqarish mahsulotlari ro\'yxati',
    category: DocumentCategory.PRODUCTION,
    fileName: 'НАВБАХОР_2025_йил_ишлаб_чикариш_маҳсулотлар (3).xlsx',
    fileSize: 1838218,
    lastModified: new Date('2025-12-03T14:23:31'),
    downloadCount: 0,
    isActive: true,
    requiredPermissions: ['PRODUCTION_READ']
  },
  {
    id: 'navbahor-production-2025-v4',
    name: 'НАВБАХОР 2025 йил ишлаб чиқариш махсулотлар (4)',
    nameUz: 'Navbahor 2025-yil ishlab chiqarish mahsulotlari (4-versiya)',
    description: 'Navbahor korxonasining 2025-yil ishlab chiqarish mahsulotlari ro\'yxati (yangi versiya)',
    category: DocumentCategory.PRODUCTION,
    fileName: 'НАВБАХОР_2025_йил_ишлаб_чикариш_маҳсулотлар (4).xlsx',
    fileSize: 2066559,
    lastModified: new Date('2025-12-03T14:23:43'),
    downloadCount: 0,
    isActive: true,
    requiredPermissions: ['PRODUCTION_READ']
  },
  {
    id: 'tola-xulosasi',
    name: 'Тола хулосаси',
    nameUz: 'Tola xulosasi',
    description: 'Tola sifati bo\'yicha xulosalar va tekshirish natijalari',
    category: DocumentCategory.QUALITY,
    fileName: 'Тола хулосаси (4).xlsx',
    fileSize: 12653,
    lastModified: new Date('2025-12-03T14:23:31'),
    downloadCount: 0,
    isActive: true,
    requiredPermissions: ['LAB_READ']
  },
  {
    id: 'tola-nakladnoy-2025-v3',
    name: 'УМУМИЙ ТОЛА НАКЛАДНОЙ 2025 (3)',
    nameUz: 'Umumiy tola nakladnoysi 2025 (3-versiya)',
    description: 'Tola bo\'yicha umumiy nakladnoy hujjati',
    category: DocumentCategory.WAREHOUSE,
    fileName: 'УМУМИЙ ТОЛА НАКЛАДНОЙ 2025 (3).xlsx',
    fileSize: 316526,
    lastModified: new Date('2025-12-03T14:23:31'),
    downloadCount: 0,
    isActive: true,
    requiredPermissions: ['WAREHOUSE_READ']
  },
  {
    id: 'tola-nakladnoy-2025-v4',
    name: 'УМУМИЙ ТОЛА НАКЛАДНОЙ 2025 (4)',
    nameUz: 'Umumiy tola nakladnoysi 2025 (4-versiya)',
    description: 'Tola bo\'yicha umumiy nakladnoy hujjati (yangi versiya)',
    category: DocumentCategory.WAREHOUSE,
    fileName: 'УМУМИЙ ТОЛА НАКЛАДНОЙ 2025 (4).xlsx',
    fileSize: 316526,
    lastModified: new Date('2025-12-03T14:23:42'),
    downloadCount: 0,
    isActive: true,
    requiredPermissions: ['WAREHOUSE_READ']
  }
];

export class DocumentsService {
  // Get all available document templates
  static getDocumentTemplates(): DocumentTemplate[] {
    return DOCUMENT_TEMPLATES.filter(doc => doc.isActive);
  }

  // Get documents by category
  static getDocumentsByCategory(category: DocumentCategory): DocumentTemplate[] {
    return DOCUMENT_TEMPLATES.filter(doc => doc.category === category && doc.isActive);
  }

  // Get document by ID
  static getDocumentById(id: string): DocumentTemplate | null {
    return DOCUMENT_TEMPLATES.find(doc => doc.id === id) || null;
  }

  // Download document (generates public URL under /hujjatlar)
  static async downloadDocument(request: DocumentDownloadRequest): Promise<string> {
    const doc = this.getDocumentById(request.documentId);
    if (!doc) {
      throw new Error('Hujjat topilmadi');
    }

    // For now serve from Next.js public folder directly
    const downloadUrl = `/hujjatlar/${encodeURIComponent(doc.fileName)}`;

    // Increment download count (in-memory)
    doc.downloadCount++;

    return downloadUrl;
  }

  // Format file size
  static formatFileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Get category color
  static getCategoryColor(category: DocumentCategory): string {
    const colors = {
      [DocumentCategory.PRODUCTION]: 'blue',
      [DocumentCategory.QUALITY]: 'green',
      [DocumentCategory.WAREHOUSE]: 'orange',
      [DocumentCategory.CONTRACTS]: 'purple',
      [DocumentCategory.CERTIFICATES]: 'yellow',
      [DocumentCategory.REPORTS]: 'gray'
    };
    return colors[category] || 'gray';
  }

  // Check if user has permission to download document
  static hasPermission(document: DocumentTemplate, userPermissions: string[]): boolean {
    if (!document.requiredPermissions || document.requiredPermissions.length === 0) {
      return true;
    }
    return document.requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
  }

  // Search documents
  static searchDocuments(query: string): DocumentTemplate[] {
    const lowercaseQuery = query.toLowerCase();
    return DOCUMENT_TEMPLATES.filter(doc => 
      doc.isActive && (
        doc.name.toLowerCase().includes(lowercaseQuery) ||
        doc.nameUz.toLowerCase().includes(lowercaseQuery) ||
        doc.description.toLowerCase().includes(lowercaseQuery)
      )
    );
  }
}