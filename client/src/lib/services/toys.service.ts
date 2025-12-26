// Toys Service for Backend Integration
import { apiClient } from '../api';
import type { Toy, ProductType } from '@/types/toy';

export interface CreateToyRequest {
  markaId: string;
  productType: ProductType;
  brutto: number;
  tara: number;
  netto: number;
  orderNo?: number; // Backend tomonidan avtomatik aniqlanadi
  operatorId?: string;
}

export interface ToysListResponse {
  items: Toy[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ToysQuery {
  markaId?: string;
  productType?: ProductType;
  labStatus?: string;
  withoutLabResult?: boolean;
  page?: number;
  limit?: number;
}

class ToysService {
  async getAllToys(query: ToysQuery = {}): Promise<ToysListResponse> {
    try {
      const params = new URLSearchParams();
      if (query.markaId) params.append('markaId', query.markaId);
      if (query.productType) params.append('productType', query.productType);
      if (query.labStatus) params.append('labStatus', query.labStatus);
      if (query.withoutLabResult) params.append('withoutLabResult', query.withoutLabResult.toString());
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());

      const response = await apiClient.get<ToysListResponse>(`/toys?${params.toString()}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch toys');
    }
  }

  async getToyById(id: string): Promise<Toy> {
    try {
      const response = await apiClient.get<Toy>(`/toys/${id}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch toy');
    }
  }

  async createToy(toyData: CreateToyRequest): Promise<Toy> {
    try {
      const response = await apiClient.post<Toy>('/toys', toyData);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create toy');
    }
  }

  async updateToy(id: string, updates: Partial<Toy>): Promise<Toy> {
    try {
      const response = await apiClient.put<Toy>(`/toys/${id}`, updates);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update toy');
    }
  }

  async deleteToy(id: string): Promise<void> {
    try {
      await apiClient.delete(`/toys/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete toy');
    }
  }

  async getScaleAvailableToys(): Promise<Toy[]> {
    try {
      const response = await apiClient.get<Toy[]>('/toys/scale/available');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch scale available toys');
    }
  }

  async markToyPrinted(id: string): Promise<Toy> {
    try {
      const response = await apiClient.put<Toy>(`/toys/${id}/print`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark toy as printed');
    }
  }

  async getToysByMarka(markaId: string): Promise<Toy[]> {
    try {
      const response = await apiClient.get<ToysListResponse>(`/toys?markaId=${markaId}`);
      return response.items;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch toys by marka');
    }
  }

  getQRCodeUrl(qrUid: string): string {
    return `/toys/qrcode/${qrUid}`;
  }
}

export const toysService = new ToysService();