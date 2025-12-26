import { Injectable, NotFoundException } from '@nestjs/common';
import { join } from 'path';
import { existsSync, statSync, readdirSync } from 'fs';
import { DownloadDocumentDto } from './dto/download-document.dto';

export interface DocumentTemplate {
  id: string;
  name: string;
  nameUz: string;
  description: string;
  category: string;
  fileName: string;
  fileSize: number;
  lastModified: Date;
  downloadCount: number;
  isActive: boolean;
  requiredPermissions?: string[];
}

export interface DownloadLog {
  fileName: string;
  customerId?: string;
  markaId?: string;
  orderId?: string;
  timestamp: Date;
  userAgent?: string;
}

@Injectable()
export class DocumentsService {
  private readonly documentsPath = join(process.cwd(), '..', 'hujjatlar');
  private downloadLogs: DownloadLog[] = [];
  private downloadCounts: Map<string, number> = new Map();

  // Document templates based on real files
  private documentTemplates: DocumentTemplate[] = [
    {
      id: 'valikli-zavod-otves',
      name: 'Валикли завод ОТВЕС',
      nameUz: 'Valikli zavod tortish hisoboti',
      description: 'Valikli zavodining tortish hisoboti 2025-yil uchun',
      category: 'production',
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
      category: 'production',
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
      category: 'production',
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
      category: 'quality',
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
      category: 'warehouse',
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
      category: 'warehouse',
      fileName: 'УМУМИЙ ТОЛА НАКЛАДНОЙ 2025 (4).xlsx',
      fileSize: 316526,
      lastModified: new Date('2025-12-03T14:23:42'),
      downloadCount: 0,
      isActive: true,
      requiredPermissions: ['WAREHOUSE_READ']
    }
  ];

  constructor() {
    this.initializeDocuments();
  }

  private initializeDocuments() {
    // Update file info if documents folder exists
    if (existsSync(this.documentsPath)) {
      try {
        const files = readdirSync(this.documentsPath);
        this.documentTemplates.forEach(template => {
          if (files.includes(template.fileName)) {
            const filePath = join(this.documentsPath, template.fileName);
            const stats = statSync(filePath);
            template.fileSize = stats.size;
            template.lastModified = stats.mtime;
          }
        });
      } catch (error) {
        console.warn('Could not read documents folder:', error.message);
      }
    }
  }

  async getAllDocuments(category?: string): Promise<DocumentTemplate[]> {
    let documents = this.documentTemplates.filter(doc => doc.isActive);
    
    if (category && category !== 'all') {
      documents = documents.filter(doc => doc.category === category);
    }

    // Update download counts
    documents.forEach(doc => {
      doc.downloadCount = this.downloadCounts.get(doc.fileName) || 0;
    });

    return documents.sort((a, b) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );
  }

  async getDocumentById(id: string): Promise<DocumentTemplate> {
    const document = this.documentTemplates.find(doc => doc.id === id && doc.isActive);
    if (!document) {
      throw new NotFoundException('Hujjat topilmadi');
    }

    // Update download count
    document.downloadCount = this.downloadCounts.get(document.fileName) || 0;

    return document;
  }

  async searchDocuments(query: string): Promise<DocumentTemplate[]> {
    const lowercaseQuery = query.toLowerCase();
    const documents = this.documentTemplates.filter(doc => 
      doc.isActive && (
        doc.name.toLowerCase().includes(lowercaseQuery) ||
        doc.nameUz.toLowerCase().includes(lowercaseQuery) ||
        doc.description.toLowerCase().includes(lowercaseQuery)
      )
    );

    // Update download counts
    documents.forEach(doc => {
      doc.downloadCount = this.downloadCounts.get(doc.fileName) || 0;
    });

    return documents;
  }

  async requestDownload(downloadDto: DownloadDocumentDto): Promise<{ success: boolean; downloadUrl?: string; fileName?: string; error?: string }> {
    try {
      const document = await this.getDocumentById(downloadDto.documentId);
      
      const filePath = join(this.documentsPath, document.fileName);
      if (!existsSync(filePath)) {
        return {
          success: false,
          error: 'Hujjat faylda topilmadi'
        };
      }

      const downloadUrl = `/api/documents/download/${document.fileName}`;
      
      return {
        success: true,
        downloadUrl,
        fileName: document.fileName
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async logDownload(fileName: string, logData: Partial<DownloadLog>): Promise<void> {
    // Add to download logs
    this.downloadLogs.push({
      fileName,
      ...logData,
      timestamp: new Date()
    });

    // Increment download count
    const currentCount = this.downloadCounts.get(fileName) || 0;
    this.downloadCounts.set(fileName, currentCount + 1);

    // Keep only last 1000 logs
    if (this.downloadLogs.length > 1000) {
      this.downloadLogs = this.downloadLogs.slice(-1000);
    }

    console.log(`Document downloaded: ${fileName} (Total: ${currentCount + 1})`);
  }

  async getDocumentStats(): Promise<any> {
    const totalDocuments = this.documentTemplates.filter(doc => doc.isActive).length;
    const totalDownloads = Array.from(this.downloadCounts.values()).reduce((sum, count) => sum + count, 0);
    
    const categoryCounts = this.documentTemplates.reduce((acc, doc) => {
      if (doc.isActive) {
        acc[doc.category] = (acc[doc.category] || 0) + 1;
      }
      return acc;
    }, {});

    const recentDownloads = this.downloadLogs
      .slice(-10)
      .reverse()
      .map(log => ({
        fileName: log.fileName,
        timestamp: log.timestamp,
        customerId: log.customerId
      }));

    return {
      totalDocuments,
      totalDownloads,
      categoryCounts,
      recentDownloads
    };
  }

  formatFileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}