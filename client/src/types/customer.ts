export interface Customer {
  id: string;
  name: string;
  legalName?: string;
  tin?: string;
  address?: string;
  director?: string;
  bankName?: string;
  bankAccount?: string;
  mfo?: string;
  oked?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerStats {
  totalOrders: number;
  totalVolume: number;
  lastOrderDate?: string;
  averageOrderValue: number;
}

export interface CustomerWithStats extends Customer {
  stats: CustomerStats;
}

export interface CustomerListResponse {
  items: Customer[];
  total: number;
  page: number;
  size: number;
}

export interface CreateCustomerDto {
  name: string;
  legalName?: string;
  tin?: string;
  address?: string;
  director?: string;
  bankName?: string;
  bankAccount?: string;
  mfo?: string;
  oked?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> { }

export interface CustomerReport {
  id: string;
  customerId: string;
  title: string;
  description?: string;
  reportData: any;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDocument {
  id: string;
  customerId: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}