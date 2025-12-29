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

export const useDashboardStore = create<DashboardState>((set, get) => ({
    stats: null,
    recentActivities: [],
    weeklyPerformance: [],
    isLoading: false,
    error: null,

    fetchDashboardData: async () => {
        const { isLoading } = get();
        if (isLoading) return;

        set({ isLoading: true, error: null });
        try {
            // Use the admin/stats/dashboard endpoint
            const response = await apiClient.get('/admin/stats/dashboard');

            // Handle different potential response structures
            const statsData = response.stats || response.data?.stats || response.data || null;
            const activitiesData = response.recentActivities || response.data?.recentActivities || [];
            const performanceData = response.weeklyPerformance || response.data?.weeklyPerformance || [];

            set({
                stats: statsData,
                recentActivities: activitiesData,
                weeklyPerformance: performanceData,
                isLoading: false
            });
        } catch (error: any) {
            console.error('Failed to fetch dashboard data:', error);
            set({ error: error.message, isLoading: false });
        }
    },
}));
