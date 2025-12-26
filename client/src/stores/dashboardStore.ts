import { create } from 'zustand';
import { apiClient } from '@/lib/api';

export interface DashboardStats {
    users: number;
    markas: number;
    toys: number;
    customers: number;
    labResults: number;
    orders: number;
    shipments: number;
    totalInventoryWeight: number;
}

export interface Activity {
    id: string;
    type: 'package' | 'flask' | 'users' | 'truck' | 'activity' | 'scale';
    title: string;
    description: string;
    time: string;
    status: 'success' | 'warning' | 'error' | 'info';
}

interface DashboardState {
    stats: DashboardStats | null;
    recentActivities: Activity[];
    weeklyPerformance: { name: string; value: number }[];
    isLoading: boolean;
    error: string | null;

    fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    stats: null,
    recentActivities: [],
    weeklyPerformance: [],
    isLoading: false,
    error: null,

    fetchDashboardData: async () => {
        set({ isLoading: true, error: null });
        try {
            // Use the admin/stats/dashboard endpoint
            const response = await apiClient.get('/admin/stats/dashboard');
            set({
                stats: response.data.stats,
                recentActivities: response.data.recentActivities,
                weeklyPerformance: response.data.weeklyPerformance,
                isLoading: false
            });
        } catch (error: any) {
            console.error('Failed to fetch dashboard data:', error);
            set({ error: error.message, isLoading: false });
        }
    },
}));
