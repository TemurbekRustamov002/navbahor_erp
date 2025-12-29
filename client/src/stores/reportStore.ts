import { create } from 'zustand';
import { apiClient } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

interface DashboardStats {
    production: { type: string; count: number; weight: number }[];
    inventory: { status: string; count: number; weight: number }[];
    quality: { grade: string; count: number }[];
    recentShipments: { date: string; total: number }[];
}

interface ReportStore {
    stats: DashboardStats | null;
    productionData: any[];
    inventoryData: any[];
    shipmentData: any[];
    markaSummaryData: any[];
    isLoading: boolean;
    error: string | null;

    fetchDashboardStats: () => Promise<void>;
    fetchProductionReport: (filters: any) => Promise<void>;
    fetchInventoryReport: (filters: any) => Promise<void>;
    fetchShipmentReport: (filters: any) => Promise<void>;
    fetchMarkaSummaryReport: (filters: any) => Promise<void>;
    exportReport: (type: 'pdf' | 'excel', filters?: any) => void;
    exportShipments: (filters?: any) => void;
    exportMarkaSummary: (filters?: any) => void;
}

export const useReportStore = create<ReportStore>((set) => ({
    stats: null,
    productionData: [],
    inventoryData: [],
    shipmentData: [],
    markaSummaryData: [],
    isLoading: false,
    error: null,

    fetchDashboardStats: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.get('/reports/dashboard');
            set({ stats: response as any, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchProductionReport: async (filters: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.get('/reports/production', { params: filters });
            set({ productionData: response as any, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchInventoryReport: async (filters: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.get('/reports/inventory', { params: filters });
            set({ inventoryData: response as any, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchShipmentReport: async (filters: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.get('/reports/shipments', { params: filters });
            set({ shipmentData: response as any, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchMarkaSummaryReport: async (filters: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.get('/reports/marka-summary', { params: filters });
            set({ markaSummaryData: response as any, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    exportReport: (type: 'pdf' | 'excel', filters: any = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, String(value));
        });
        const endpoint = type === 'pdf' ? 'export-pdf' : 'export-excel';
        const url = `${API_URL}/reports/${endpoint}?${params.toString()}`;
        window.open(url, '_blank');
    },

    exportShipments: (filters: any = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, String(value));
        });
        const url = `${API_URL}/reports/export-shipments?${params.toString()}`;
        window.open(url, '_blank');
    },

    exportMarkaSummary: (filters: any = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, String(value));
        });
        const url = `${API_URL}/reports/export-marka-summary?${params.toString()}`;
        window.open(url, '_blank');
    }
}));
