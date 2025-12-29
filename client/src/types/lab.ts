export type LabGradeUz = "OLIY" | "YAXSHI" | "ORTA" | "ODDIY" | "IFLOS";
export type LabStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ProductType = "TOLA" | "LINT" | "SIKLON" | "ULUK";

export interface LabSample {
  id: string;
  toyId: string;             // Direct reference to toy - MAIN FIELD

  moisture: number;          // Namlik %
  trash: number;             // Ifloslik %
  navi: 1 | 2 | 3 | 4 | 5;           // Navi
  grade: LabGradeUz;         // Sinf
  strength: number;          // Pishiqligi
  lengthMm: number;          // Uzunlik mm
  micronaire?: number;      // Mikroneyr
  operatorName?: string;     // Labchi (Analyst)
  comment?: string;

  status: LabStatus;
  showToWarehouse: boolean;  // Backend field
  createdAt: string;
  updatedAt: string;

  // Backend relations
  toy?: {
    qrUid: string;
    orderNo: number;
    productType: ProductType;
    markaId: string;
  };

  // Legacy/computed fields for compatibility
  sourceId?: string;         // Legacy field for compatibility (same as toyId)
  sourceType?: string;       // Legacy field
  productType?: ProductType; // computed from toy relation
  markaId?: string;          // computed from toy relation
  markaLabel?: string;       // computed field
  analyst?: string | null;
  approver?: string | null;
  showToSales?: boolean;     // Legacy field for compatibility
}