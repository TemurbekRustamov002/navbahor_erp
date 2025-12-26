// Customers Service for Backend Integration
import { apiClient } from '../api';
import type {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerStats,
  CustomerWithStats,
  CustomerListResponse
} from '@/types/customer';

export interface CustomersQuery {
  search?: string;
  page?: number;
  size?: number;
}

class CustomersService {
  async getAllCustomers(query: CustomersQuery = {}): Promise<CustomerListResponse> {
    try {
      const params = new URLSearchParams();
      if (query.search) params.append('search', query.search);
      if (query.page) params.append('page', query.page.toString());
      if (query.size) params.append('size', query.size.toString());

      const response = await apiClient.get<CustomerListResponse>(`/customers?${params.toString()}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch customers');
    }
  }

  async getCustomerById(id: string): Promise<Customer> {
    try {
      const response = await apiClient.get<Customer>(`/customers/${id}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch customer');
    }
  }

  async createCustomer(customerData: CreateCustomerDto): Promise<Customer> {
    try {
      const response = await apiClient.post<Customer>('/customers', customerData);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create customer');
    }
  }

  async updateCustomer(id: string, updates: UpdateCustomerDto): Promise<Customer> {
    try {
      const response = await apiClient.put<Customer>(`/customers/${id}`, updates);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update customer');
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    try {
      await apiClient.delete(`/customers/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete customer');
    }
  }

  async getCustomerStats(id: string): Promise<CustomerStats> {
    try {
      const response = await apiClient.get<CustomerStats>(`/customers/${id}/stats`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch customer stats');
    }
  }

  async getCustomerStatsBatch(ids: string[]): Promise<Record<string, CustomerStats>> {
    try {
      const response = await apiClient.post<Record<string, CustomerStats>>('/customers/stats/batch', { ids });
      return response;
    } catch (error: any) {
      console.error('Batch stats error', error);
      // Return empty object on fail to not break UI
      return {};
    }
  }

  async getCustomerReports(id: string): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>(`/customers/${id}/reports`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch customer reports');
    }
  }

  async getCustomerDocuments(id: string): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>(`/customers/${id}/documents`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch customer documents');
    }
  }

  async createCustomerReport(id: string, reportData: any): Promise<any> {
    try {
      const response = await apiClient.post<any>(`/customers/${id}/reports`, reportData);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create customer report');
    }
  }

  async uploadCustomerDocument(id: string, documentData: any): Promise<any> {
    try {
      const response = await apiClient.post<any>(`/customers/${id}/documents`, documentData);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload customer document');
    }
  }
}

export const customersService = new CustomersService();