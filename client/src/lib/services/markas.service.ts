// Markas Service for Backend Integration
import { apiClient } from '../api';
import { simpleApiClient } from '../apiClient';
import type { Marka, ProductType, SexType, MarkaStatus } from '@/types/marka';

export interface CreateMarkaRequest {
  number: number;
  productType: ProductType;
  sex?: SexType;
  ptm: string;
  selection: string;
  pickingType: string;
  capacity?: number;
  showOnScale?: boolean;
  notes?: string;
  createdBy?: string;
}

export interface UpdateMarkaRequest extends Partial<CreateMarkaRequest> {
  status?: MarkaStatus;
  used?: number;
}

export interface MarkaQuery {
  productType?: ProductType;
  status?: MarkaStatus;
  showOnScale?: boolean;
  withUntestedToys?: boolean;
  page?: number;
  limit?: number;
}

export interface MarkasListResponse {
  items: Marka[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface MarkaOptionsResponse {
  ptm: string[];
  pickingType: string[];
  selection: string[];
}

export interface MarkaStats {
  totalMarkas: number;
  activeMarkas: number;
  totalCapacity: number;
  usedCapacity: number;
  utilizationRate: number;
  byProductType: Record<ProductType, number>;
  byStatus: Record<MarkaStatus, number>;
}

class MarkasService {
  async getAllMarkas(query: MarkaQuery = {}): Promise<MarkasListResponse> {
    try {
      const params = new URLSearchParams();
      if (query.productType) params.append('productType', query.productType);
      if (query.status) params.append('status', query.status);
      if (query.showOnScale !== undefined) params.append('showOnScale', query.showOnScale.toString());
      if (query.withUntestedToys) params.append('withUntestedToys', query.withUntestedToys.toString());
      const page = query.page || 1;
      const limit = query.limit || 100;
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      let response;
      try {
        response = await apiClient.get<MarkasListResponse>(`/markas?${params.toString()}`);
      } catch (authError: any) {
        if (authError.response?.status === 401) {
          console.log('🔄 Auth failed, trying with simple client...');
          response = await simpleApiClient.get<MarkasListResponse>(`/markas?${params.toString()}`);
        } else {
          throw authError;
        }
      }

      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch markas');
    }
  }

  async getMarkaById(id: string): Promise<Marka> {
    try {
      const response = await apiClient.get<Marka>(`/markas/${id}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch marka');
    }
  }

  async createMarka(markaData: CreateMarkaRequest): Promise<Marka> {
    try {
      const response = await apiClient.post<Marka>('/markas', markaData);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create marka');
    }
  }

  async updateMarka(id: string, updates: UpdateMarkaRequest): Promise<Marka> {
    try {
      const response = await apiClient.put<Marka>(`/markas/${id}`, updates);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update marka');
    }
  }

  async deleteMarka(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/markas/${id}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete marka');
    }
  }

  async toggleMarkaScale(id: string): Promise<Marka> {
    try {
      console.log('🔄 Toggling scale visibility for marka:', id);
      const response = await apiClient.patch<Marka>(`/markas/${id}/toggle-scale`);
      console.log('✅ Scale toggle response:', response);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to toggle marka scale visibility');
    }
  }

  async updateMarkaStatus(id: string, status: MarkaStatus): Promise<Marka> {
    try {
      const response = await apiClient.patch<Marka>(`/markas/${id}/status`, { status });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update marka status');
    }
  }

  async getMarkaOptions(): Promise<MarkaOptionsResponse> {
    try {
      let response;
      try {
        response = await apiClient.get<MarkaOptionsResponse>('/markas/options');
      } catch (authError: any) {
        if (authError.response?.status === 401 || authError.response?.status === 403) {
          response = await simpleApiClient.get<MarkaOptionsResponse>('/markas/options');
        } else {
          throw authError;
        }
      }
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch marka options');
    }
  }

  async getMarkaStats(): Promise<MarkaStats> {
    try {
      const response = await apiClient.get<MarkaStats>('/markas/stats');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch marka statistics');
    }
  }

  async getMarkaToys(id: string): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>(`/markas/${id}/toys`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch marka toys');
    }
  }

  async getScaleVisibleMarkas(): Promise<Marka[]> {
    try {
      const response = await apiClient.get<MarkasListResponse>('/markas?showOnScale=true');
      return response.items;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch scale visible markas');
    }
  }

  async exportMarkasToExcel(query?: MarkaQuery): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (query?.productType) params.append('productType', query.productType);
      if (query?.status) params.append('status', query.status);
      if (query?.withUntestedToys) params.append('withUntestedToys', query.withUntestedToys.toString());

      return await apiClient.get<Blob>(`/markas/export/excel?${params.toString()}`, {
        responseType: 'blob',
      });
    } catch (error: any) {
      throw new Error(error.message || 'Excel eksport qilishda xatolik');
    }
  }

  async exportSelectedMarkasToExcel(markaIds: string[]): Promise<Blob> {
    try {
      return await apiClient.post<Blob>('/markas/export/excel/selected', { markaIds }, {
        responseType: 'blob',
      });
    } catch (error: any) {
      throw new Error(error.message || 'Tanlangan markalarni eksport qilishda xatolik');
    }
  }

  async exportMarkaPassportPDF(markaId: string): Promise<Blob> {
    try {
      return await apiClient.get<Blob>(`/markas/${markaId}/export/pdf`, {
        responseType: 'blob',
      });
    } catch (error: any) {
      throw new Error(error.message || 'PDF passport yaratishda xatolik');
    }
  }

  async getMarkaQRCode(markaId: string): Promise<{ qrCode: string }> {
    try {
      const response = await apiClient.get<{ qrCode: string }>(`/markas/${markaId}/qr-code`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate QR code');
    }
  }

  async downloadMarkaLabel(markaId: string): Promise<Blob> {
    try {
      return await apiClient.get<Blob>(`/markas/${markaId}/label`, {
        responseType: 'blob',
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to download marka label');
    }
  }
}

export const markasService = new MarkasService();