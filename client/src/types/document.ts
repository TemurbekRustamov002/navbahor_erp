export interface DocumentTemplate {
  id: string;
  name: string;
  nameUz: string;
  description: string;
  category: DocumentCategory;
  fileName: string;
  fileSize: number;
  lastModified: Date;
  downloadCount: number;
  isActive: boolean;
  requiredPermissions?: string[];
}

export enum DocumentCategory {
  PRODUCTION = 'production',
  QUALITY = 'quality',
  WAREHOUSE = 'warehouse',
  CONTRACTS = 'contracts',
  CERTIFICATES = 'certificates',
  REPORTS = 'reports'
}

export interface DocumentDownloadRequest {
  documentId: string;
  customerId?: string;
  markaId?: string;
  orderId?: string;
  parameters?: Record<string, any>;
}

export interface DocumentDownloadResponse {
  success: boolean;
  downloadUrl?: string;
  fileName?: string;
  error?: string;
}

export const DOCUMENT_CATEGORIES = [
  {
    key: DocumentCategory.PRODUCTION,
    name: "Ishlab chiqarish",
    icon: "Factory",
    color: "blue"
  },
  {
    key: DocumentCategory.QUALITY,
    name: "Sifat nazorati",
    icon: "CheckCircle",
    color: "green"
  },
  {
    key: DocumentCategory.WAREHOUSE,
    name: "Ombor",
    icon: "Package",
    color: "orange"
  },
  {
    key: DocumentCategory.CONTRACTS,
    name: "Shartnomalar",
    icon: "FileText",
    color: "purple"
  },
  {
    key: DocumentCategory.CERTIFICATES,
    name: "Sertifikatlar",
    icon: "Award",
    color: "yellow"
  },
  {
    key: DocumentCategory.REPORTS,
    name: "Hisobotlar",
    icon: "BarChart3",
    color: "gray"
  }
];