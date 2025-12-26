// Lab Service for Backend Integration
import { apiClient } from '../api';
import type { LabSample, LabStatus, LabGradeUz } from '@/types/lab';

export interface CreateLabSampleRequest {
  sourceType: 'toy';
  sourceId: string;
  productType: 'tola' | 'lint' | 'siklon' | 'uluk';
  markaId: string;
  markaLabel: string;
  moisture: number;
  trash: number;
  navi: 1 | 2 | 3 | 4 | 5;
  grade: LabGradeUz;
  strength: number;
  lengthMm: number;
  comment?: string;
  analyst?: string;
}

export interface UpdateLabSampleRequest extends Partial<CreateLabSampleRequest> {
  status?: LabStatus;
  showToSales?: boolean;
  approver?: string;
}

export interface LabQuery {
  markaId?: string;
  productType?: string;
  status?: LabStatus;
  analyst?: string;
  page?: number;
  limit?: number;
}

export interface LabListResponse {
  items: LabSample[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

class LabService {
  async getAllSamples(query: LabQuery = {}): Promise<LabListResponse> {
    try {
      const params = new URLSearchParams();
      if (query.markaId) params.append('markaId', query.markaId);
      if (query.productType) params.append('productType', query.productType);
      if (query.status) params.append('status', query.status);
      if (query.analyst) params.append('analyst', query.analyst);
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());

      const response = await apiClient.get<LabListResponse>(`/lab/results?${params.toString()}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch lab samples');
    }
  }


  async createSample(sampleData: {
    toyId: string;
    moisture: number;
    trash: number;
    navi: number;
    grade: LabGradeUz;
    strength: number;
    lengthMm: number;
    comment?: string;
  }): Promise<LabSample> {
    try {
      const response = await apiClient.post<LabSample>('/lab/sample', sampleData);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create lab sample');
    }
  }

  async bulkCreateSamples(sampleData: {
    toyIds: string[];
    moisture: number;
    trash: number;
    navi: number;
    grade: LabGradeUz;
    strength: number;
    lengthMm: number;
    comment?: string;
  }): Promise<any> {
    try {
      const response = await apiClient.post<any>('/lab/bulk-samples', sampleData);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to bulk create lab samples');
    }
  }

  async updateSample(toyId: string, updates: UpdateLabSampleRequest): Promise<LabSample> {
    try {
      // Update to use the correct backend endpoint pattern
      const response = await apiClient.post<LabSample>(`/lab/sample`, {
        toyId,
        ...updates
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update lab sample');
    }
  }

  async deleteSample(toyId: string): Promise<void> {
    try {
      await apiClient.delete(`/lab/results/${toyId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete lab sample');
    }
  }

  async updateSampleStatus(toyId: string, status: LabStatus, approver?: string): Promise<LabSample> {
    try {
      if (status === 'APPROVED') {
        await this.approveSample(toyId);
      } else if (status === 'REJECTED') {
        await this.rejectSample(toyId, approver ? `Rejected by ${approver}` : undefined);
      }
      // Return updated sample
      return await this.getSampleByToyId(toyId) as LabSample;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update sample status');
    }
  }

  async approveSample(toyId: string): Promise<{ ok: boolean }> {
    try {
      const response = await apiClient.put<{ ok: boolean }>(`/lab/${toyId}/approve`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to approve lab sample');
    }
  }

  async rejectSample(toyId: string, reason?: string): Promise<{ ok: boolean }> {
    try {
      const response = await apiClient.put<{ ok: boolean }>(`/lab/${toyId}/reject`, { reason });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reject lab sample');
    }
  }


  async getSampleByToyId(toyId: string): Promise<LabSample | null> {
    try {
      const response = await apiClient.get<LabSample>(`/lab/results/${toyId}`);
      return response;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch sample by toy ID');
    }
  }

  async toggleWarehouse(toyId: string): Promise<{ ok: boolean; showToWarehouse: boolean }> {
    try {
      const response = await apiClient.patch<{ ok: boolean; showToWarehouse: boolean }>(`/lab/results/${toyId}/toggle-warehouse`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to toggle warehouse visibility');
    }
  }

  async getStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    approvalRate: number;
  }> {
    try {
      const response = await apiClient.get<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        approvalRate: number;
      }>('/lab/stats');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch lab stats');
    }
  }

  // Export functions
  private getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async exportResultsToExcel(query: any = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (query.status) params.append('status', query.status);
      if (query.from) params.append('from', query.from);
      if (query.to) params.append('to', query.to);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lab/export/excel?${params.toString()}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) throw new Error('Excel eksport xatosi');
      return await response.blob();
    } catch (error: any) {
      throw new Error(error.message || 'Excel eksport qilishda xatolik');
    }
  }

  async exportCertificatePDF(toyId: string): Promise<Blob> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lab/results/${toyId}/export/certificate`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) throw new Error('Sertifikat yaratishda xatolik');
      return await response.blob();
    } catch (error: any) {
      throw new Error(error.message || 'Sifat sertifikatini yuklab olishda xatolik');
    }
  }

  async getSamplesByMarka(markaId: string): Promise<LabSample[]> {
    try {
      const response = await apiClient.get<LabListResponse>(`/lab/results?markaId=${markaId}`);
      return response.items;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch samples by marka');
    }
  }
}

export const labService = new LabService();