// src/types/marka.ts

// mahsulot turlari
export type ProductType = "TOLA" | "LINT" | "SIKLON" | "ULUK";

export type SexType = "ARRALI" | "VALIKLI" | "UNIVERSAL";

export type MarkaDepartment = "ARRALI_SEX" | "VALIKLI_SEX" | "UNIVERSAL";

export type MarkaStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED";

export type LintGrade = "OLIY" | "ODDIY";
export type LintQuality = "YAXSHI" | "ORTA";

export interface Marka {
  id: string;
  
  // Asosiy ma'lumotlar
  number: number;                    // Avtomatik raqam
  productType: ProductType;          // TOLA, LINT, SIKLON, ULUK
  sex?: SexType;                    // ARRALI, VALIKLI, UNIVERSAL (optional, required for TOLA only)
  department: MarkaDepartment;       // Qaysi bo'limga tegishli
  
  // Mahsulot parametrlari
  selection?: string;               // Seleksion navi
  ptm?: string;                    // PTM qiymati
  pickingType?: string;            // terim turi: qol | mashina
  
  // Sig'im va foydalanish
  capacity: number;                // odatda 220 ta toy
  used: number;                   // hozirgi toylar soni
  
  // Holat
  status: MarkaStatus;
  showOnScale: boolean;           // tarozida ko'rinishi
  
  // Qo'shimcha
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  
  // Calculated fields from backend (toy count, etc.)
  toyCount?: number;              // computed field from backend
  _count?: {                      // Prisma count field
    toys: number;
  };
}