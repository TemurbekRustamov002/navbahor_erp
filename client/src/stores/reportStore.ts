import { create } from 'zustand';
import { apiClient } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface DashboardStats {
    production: { type: string; count: number; weight: number }[];
    inventory: { status: string; count: number; weight: number }[];
    quality: { grade: string; count: number }[];
    recentShipments: { date: string; total: number }[];
}

export interface ProductionItem {
    date: string;
    shift: string;
    brigade: string;
    toyNo: string;
    marka: string;
    netto: number;
    grade: string;
    moisture: number;
    trash: number;
    status: string;
    productType: string;
    department: string;
}

export interface InventoryItem {
    id: string;
    toyNo: string;
    marka: string;
    netto: number;
    grade: string;
    status: string;
    location: string;
    productType: string;
}

export interface ShipmentItem {
    date: string;
    destination: string;
    createdBy: string;
    customer: string;
    waybill: string;
    vehicle: string;
    markaNumber: number;
    orderNo: string;
    netto: number;
    grade: string;
    moisture: number;
    trash: number;
    strength: string;
}

export interface MarkaSummaryItem {
    number: string;
    department: string;
    productType: string;
    sex?: string;
    toyCount: number;
    totalNetto: number;
    toys: Array<{
        brigade: string;
        grade: string;
    }>;
}

type ReportFilters = Record<string, string | number | boolean | undefined>;

interface ReportStore {
    stats: DashboardStats | null;
    productionData: ProductionItem[];
    inventoryData: InventoryItem[];
    shipmentData: ShipmentItem[];
    markaSummaryData: MarkaSummaryItem[];
    isLoading: boolean;
    error: string | null;

    fetchDashboardStats: () => Promise<void>;
    fetchProductionReport: (filters: ReportFilters) => Promise<void>;
    fetchInventoryReport: (filters: ReportFilters) => Promise<void>;
    fetchShipmentReport: (filters: ReportFilters) => Promise<void>;
    fetchMarkaSummaryReport: (filters: ReportFilters) => Promise<void>;
    exportReport: (type: 'pdf' | 'excel', filters?: ReportFilters) => void;
    exportShipments: (filters?: ReportFilters) => void;
    exportMarkaSummary: (filters?: ReportFilters) => void;
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
            const response = await apiClient.get<DashboardStats>('/reports/dashboard');
            set({ stats: response as any, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchProductionReport: async (filters: ReportFilters) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.get<ProductionItem[]>('/reports/production', { params: filters });
            set({ productionData: response as any, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchInventoryReport: async (filters: ReportFilters) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.get<InventoryItem[]>('/reports/inventory', { params: filters });
            set({ inventoryData: response as any, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchShipmentReport: async (filters: ReportFilters) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.get<ShipmentItem[]>('/reports/shipments', { params: filters });
            set({ shipmentData: response as any, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchMarkaSummaryReport: async (filters: ReportFilters) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.get<MarkaSummaryItem[]>('/reports/marka-summary', { params: filters });
            set({ markaSummaryData: response as any, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    exportReport: (type: 'pdf' | 'excel', filters: ReportFilters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) params.append(key, String(value));
        });
        const endpoint = type === 'pdf' ? 'export-pdf' : 'export-excel';
        const url = `${API_URL}/reports/${endpoint}?${params.toString()}`;
        window.open(url, '_blank');
    },

    exportShipments: (filters: ReportFilters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) params.append(key, String(value));
        });
        const url = `${API_URL}/reports/export-shipments?${params.toString()}`;
        window.open(url, '_blank');
    },

    exportMarkaSummary: (filters: ReportFilters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) params.append(key, String(value));
        });
        const url = `${API_URL}/reports/export-marka-summary?${params.toString()}`;
        window.open(url, '_blank');
    }
}));
