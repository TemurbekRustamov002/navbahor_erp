export interface ChecklistItem {
  id: string;
  toyId: string;
  markaId: string;
  markaLabel: string;
  qrCode: string;
  weight: number;
  grade: string;
  qualityScore: number;
  addedAt: string;
  position: number; // Order in checklist
  isScanned?: boolean;
  scannedAt?: string;
  scannedBy?: string;
}

export interface ChecklistSummary {
  markaId: string;
  markaLabel: string;
  totalToys: number;
  grades: {
    [grade: string]: number; // Grade name -> count
  };
  totalWeight: number;
  averageQuality: number;
}

export interface Checklist {
  id: string;
  workspaceId: string;
  customerId: string;
  customerName: string;
  items: ChecklistItem[];
  summary: ChecklistSummary[];
  status: 'draft' | 'confirmed' | 'locked' | 'modification_requested';
  createdAt: string;
  confirmedAt?: string;
  lockedAt?: string;
  modificationRequestedAt?: string;
  modificationReason?: string;
  createdBy: string;
  confirmedBy?: string;
  totalItems: number;
  totalWeight: number;
  notes?: string;
}

export interface ToySelectionCriteria {
  markaId: string;
  markaLabel: string;
  grade: string;
  quantity: number;
  availableCount: number;
  selectedToys: string[]; // toy IDs
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  criteria: ToySelectionCriteria[];
  createdAt: string;
  createdBy: string;
  usedCount: number;
}

export interface ChecklistExportData {
  checklist: Checklist;
  qrCodesFile: Blob; // PDF with QR codes
  summaryFile: Blob;  // Excel/PDF with summary
}

export type ChecklistAction =
  | 'add_toys'
  | 'confirm'
  | 'lock'
  | 'request_modification'
  | 'approve_modification'
  | 'export'
  | 'delete';

export interface ChecklistPermissions {
  canAddToys: boolean;
  canConfirm: boolean;
  canLock: boolean;
  canRequestModification: boolean;
  canApproveModification: boolean;
  canExport: boolean;
  canDelete: boolean;
}