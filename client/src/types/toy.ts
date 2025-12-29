export type ProductType = "TOLA" | "LINT" | "SIKLON" | "ULUK";

export interface Toy {
  id: string;
  qrUid: string;
  markaId: string;

  brutto: number;
  tara: number;
  netto: number;
  createdAt: string;
  updatedAt: string;
  orderNo: number;
  productType: ProductType;
  printed: boolean;
  labStatus: "PENDING" | "APPROVED" | "REJECTED";
  readyForWarehouse: boolean;
  status: "IN_STOCK" | "RESERVED" | "SHIPPED" | "RETURNED" | "WASTE";
  brigade?: string;

  // Backend relations
  marka?: {
    number: number;
    productType: ProductType;
    status: string;
  };
  labResult?: {
    grade: string;
    moisture: number;
    trash: number;
    status: string;
  };

  // Frontend-specific fields
  reserved?: boolean;   // ombor cheklistida band qilingan (local flag)
  sold?: boolean;       // chiqib ketgan (ombor chiqimi)
  scaleModel?: string;  // deprecated field
  operatorId?: string | null; // deprecated field
}