// Backend-integrated Lab Store with Caching (Matches Marka/Tarozi patterns)
"use client";
import { create } from "zustand";
import { persist } from 'zustand/middleware';
import { labService } from '@/lib/services';
import type { LabSample, LabStatus, LabGradeUz } from "@/types/lab";

const CACHE_DURATION = 30000; // 30 seconds - same as marka store

interface LabState {
  samples: LabSample[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  stats: any | null;
  filters: Record<string, any>;

  // Backend methods (matching marka store pattern)
  fetchSamples: (query?: { status?: LabStatus; markaId?: string }, force?: boolean) => Promise<void>;
  fetchStats: () => Promise<void>;
  createSample: (sampleData: {
    toyId: string;
    moisture: number;
    trash: number;
    navi: number;
    grade: LabGradeUz;
    strength: number;
    lengthMm: number;
    micronaire?: number;
    operatorName?: string;
    comment?: string;
  }) => Promise<{ success: boolean; message: string }>;
  bulkCreateSamples: (sampleData: {
    toyIds: string[];
    moisture: number;
    trash: number;
    navi: number;
    grade: LabGradeUz;
    strength: number;
    lengthMm: number;
    micronaire?: number;
    operatorName?: string;
    comment?: string;
  }) => Promise<{ success: boolean; message: string }>;
  updateSample: (toyId: string, updates: {
    moisture?: number;
    trash?: number;
    navi?: number;
    grade?: LabGradeUz;
    strength?: number;
    lengthMm?: number;
    micronaire?: number;
    operatorName?: string;
    comment?: string;
  }) => Promise<{ success: boolean; message: string }>;
  approveSample: (toyId: string) => Promise<{ success: boolean; message: string }>;
  rejectSample: (toyId: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  bulkApproveSamples: (toyIds: string[]) => Promise<{ success: boolean; message: string }>;
  bulkRejectSamples: (toyIds: string[], reason?: string) => Promise<{ success: boolean; message: string }>;
  toggleWarehouse: (toyId: string) => Promise<{ success: boolean; message: string }>;
  deleteSample: (identifier: string) => Promise<{ success: boolean; message: string }>;
  toggleShowToSales: (identifier: string) => Promise<{ success: boolean; message: string }>;
  upsertByToy: (sample: LabSample) => Promise<{ success: boolean; message: string }>;

  // Utility methods
  getSampleByToyId: (toyId: string) => LabSample | undefined;
  getSamplesByMarka: (markaId: string) => LabSample[];
  getSamplesByStatus: (status: LabStatus) => LabSample[];
  getPendingSamples: () => LabSample[];
  getApprovedSamples: () => LabSample[];
  getRejectedSamples: () => LabSample[];

  // Local methods for offline fallback
  addSampleLocal: (sample: LabSample) => void;
  updateSampleLocal: (toyId: string, updates: Partial<LabSample>) => void;
  removeSampleLocal: (toyId: string) => void;
}

export const useBackendLabStore = create<LabState>()(
  (set, get) => ({
    samples: [],
    isLoading: false,
    error: null,
    lastFetched: null,
    stats: null,
    filters: {},

    // Backend methods
    fetchSamples: async (query = {}, force = false) => {
      const { lastFetched, isLoading } = get();

      // Check cache validity - skip if data is fresh unless forced
      // Removed cache duration check for "real state" requirement
      if (!force && isLoading) {
        console.log('⏭️ Lab samples fetch already in progress, skipping...');
        return;
      }

      console.log('🔄 Fetching lab samples from backend API...', query);
      set({ isLoading: true, error: null });
      try {
        const response = await labService.getAllSamples(query);
        console.log('✅ Lab samples loaded from backend:', response.items?.length || 0);

        // Handle response format consistent with backend
        const samples = response.items || [];

        set({ samples, isLoading: false, lastFetched: Date.now() });
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch lab samples';
        console.error('❌ Failed to fetch lab samples from backend:', errorMessage);
        set({ error: errorMessage, isLoading: false });

        // Show user-friendly toast notification
        if (typeof window !== 'undefined') {
          console.error('Lab namunalarini yuklashda xatolik:', errorMessage);
        }
      }
    },

    fetchStats: async () => {
      set({ isLoading: true, error: null });
      try {
        console.log('🔄 Fetching lab stats from backend API...');
        const stats = await labService.getStats();
        console.log('✅ Lab stats loaded:', stats);
        set({ stats, isLoading: false });
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch lab stats';
        console.error('❌ Failed to fetch lab stats:', errorMessage);
        set({ error: errorMessage, isLoading: false });
      }
    },

    createSample: async (sampleData) => {
      set({ isLoading: true, error: null });
      try {
        console.log('🔄 Creating lab sample:', sampleData);

        const response = await labService.createSample(sampleData);
        console.log('✅ Create response:', response);

        // Force refresh samples after creating
        get().fetchSamples({}, true);

        set({ isLoading: false, error: null });
        return { success: true, message: 'Lab namunasi muvaffaqiyatli yaratildi' };
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create lab sample';
        console.error('❌ Failed to create lab sample:', errorMessage);
        set({ error: errorMessage, isLoading: false });

        throw new Error(errorMessage);
      }
    },

    bulkCreateSamples: async (sampleData) => {
      set({ isLoading: true, error: null });
      try {
        console.log('🔄 Bulk creating lab samples:', sampleData.toyIds.length);

        await labService.bulkCreateSamples(sampleData);

        // Force refresh samples after creating
        get().fetchSamples({}, true);

        set({ isLoading: false, error: null });
        return { success: true, message: `${sampleData.toyIds.length} ta lab namunasi muvaffaqiyatli yaratildi` };
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to bulk create lab samples';
        console.error('❌ Failed to bulk create lab samples:', errorMessage);
        set({ error: errorMessage, isLoading: false });

        throw new Error(errorMessage);
      }
    },

    updateSample: async (toyId: string, updates) => {
      set({ isLoading: true, error: null });
      try {
        console.log('🔄 Updating lab sample:', toyId, updates);

        const response = await labService.updateSample(toyId, updates as any);
        console.log('✅ Update response:', response);

        // Force refresh samples after updating
        get().fetchSamples({}, true);

        set({ isLoading: false, error: null });
        return { success: true, message: 'Lab namunasi muvaffaqiyatli yangilandi' };
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update lab sample';
        console.error('❌ Failed to update lab sample:', errorMessage);
        set({ error: errorMessage, isLoading: false });

        throw new Error(errorMessage);
      }
    },

    approveSample: async (toyId: string) => {
      set({ isLoading: true, error: null });
      try {
        console.log('✅ Approving lab sample:', toyId);

        const response = await labService.approveSample(toyId);
        console.log('✅ Approve response:', response);

        // Update local state
        set((state) => ({
          samples: state.samples.map(s =>
            s.toyId === toyId ? { ...s, status: 'APPROVED' as LabStatus, showToWarehouse: true } : s
          ),
          isLoading: false,
          error: null
        }));

        return { success: true, message: 'Lab namunasi tasdiqlandi' };
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to approve lab sample';
        console.error('❌ Failed to approve lab sample:', errorMessage);
        set({ error: errorMessage, isLoading: false });

        throw new Error(errorMessage);
      }
    },

    rejectSample: async (toyId: string, reason?: string) => {
      set({ isLoading: true, error: null });
      try {
        console.log('❌ Rejecting lab sample:', toyId, reason);

        await labService.rejectSample(toyId, reason);

        // Update local state
        set((state) => ({
          samples: state.samples.map(s =>
            s.toyId === toyId ? { ...s, status: 'REJECTED' as LabStatus, showToWarehouse: false } : s
          ),
          isLoading: false,
          error: null
        }));

        return { success: true, message: 'Lab namunasi rad etildi' };
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to reject lab sample';
        console.error('❌ Failed to reject lab sample:', errorMessage);
        set({ error: errorMessage, isLoading: false });

        throw new Error(errorMessage);
      }
    },

    bulkApproveSamples: async (toyIds: string[]) => {
      if (!toyIds.length) return { success: true, message: 'Tanlanganlar yo\'q' };
      set({ isLoading: true, error: null });
      try {
        console.log('✅ Bulk approving lab samples:', toyIds.length);

        // Use Promise.all to call approve for each toyId
        await Promise.all(toyIds.map(id => labService.approveSample(id)));

        // Update local state
        set((state) => ({
          samples: state.samples.map(s =>
            toyIds.includes(s.toyId) ? { ...s, status: 'APPROVED' as LabStatus, showToWarehouse: true } : s
          ),
          isLoading: false,
          error: null
        }));

        return { success: true, message: `${toyIds.length} ta namuna tasdiqlandi` };
      } catch (error: any) {
        const errorMessage = 'Ommaviy tasdiqlashda xatolik yuz berdi';
        set({ error: errorMessage, isLoading: false });
        throw new Error(errorMessage);
      }
    },

    bulkRejectSamples: async (toyIds: string[], reason?: string) => {
      if (!toyIds.length) return { success: true, message: 'Tanlanganlar yo\'q' };
      set({ isLoading: true, error: null });
      try {
        console.log('❌ Bulk rejecting lab samples:', toyIds.length);

        await Promise.all(toyIds.map(id => labService.rejectSample(id, reason)));

        // Update local state
        set((state) => ({
          samples: state.samples.map(s =>
            toyIds.includes(s.toyId) ? { ...s, status: 'REJECTED' as LabStatus, showToWarehouse: false } : s
          ),
          isLoading: false,
          error: null
        }));

        return { success: true, message: `${toyIds.length} ta namuna rad etildi` };
      } catch (error: any) {
        const errorMessage = 'Ommaviy rad etishda xatolik yuz berdi';
        set({ error: errorMessage, isLoading: false });
        throw new Error(errorMessage);
      }
    },

    toggleWarehouse: async (toyId: string) => {
      set({ isLoading: true, error: null });
      try {
        console.log('🔄 Toggling warehouse visibility:', toyId);

        const response = await labService.toggleWarehouse(toyId);
        console.log('✅ Toggle response:', response);

        // Update local state
        set((state) => ({
          samples: state.samples.map(s =>
            s.toyId === toyId ? { ...s, showToWarehouse: response.showToWarehouse } : s
          ),
          isLoading: false,
          error: null
        }));

        return { success: true, message: `Ombor ko'rinishi ${response.showToWarehouse ? 'yoqildi' : 'o\'chirildi'}` };
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to toggle warehouse visibility';
        console.error('❌ Failed to toggle warehouse visibility:', errorMessage);
        set({ error: errorMessage, isLoading: false });

        throw new Error(errorMessage);
      }
    },

    // Utility methods
    getSampleByToyId: (toyId: string) =>
      get().samples.find(s => s.toyId === toyId),

    getSamplesByMarka: (markaId: string) =>
      get().samples.filter(s => s.markaId === markaId),

    getSamplesByStatus: (status: LabStatus) =>
      get().samples.filter(s => s.status === status),

    getPendingSamples: () =>
      get().samples.filter(s => s.status === 'PENDING'),

    getApprovedSamples: () =>
      get().samples.filter(s => s.status === 'APPROVED'),

    getRejectedSamples: () =>
      get().samples.filter(s => s.status === 'REJECTED'),

    // Local methods for offline fallback
    addSampleLocal: (sample: LabSample) => {
      set((state) => ({
        samples: [sample, ...state.samples]
      }));
    },

    updateSampleLocal: (toyId: string, updates: Partial<LabSample>) => {
      set((state) => ({
        samples: state.samples.map(s =>
          s.toyId === toyId ? { ...s, ...updates } : s
        )
      }));
    },

    removeSampleLocal: (toyId: string) => {
      set((state) => ({
        samples: state.samples.filter(s => s.toyId !== toyId)
      }));
    },

    // Delete sample
    deleteSample: async (identifier: string) => {
      set({ isLoading: true, error: null });
      try {
        console.log('🗑️ Deleting lab sample:', identifier);

        // Resolve toyId (backend expects toyId)
        const sample = get().samples.find(s => s.id === identifier || s.toyId === identifier);
        const toyId = sample?.toyId || identifier;

        await labService.deleteSample(toyId);
        console.log('✅ Sample deleted successfully');

        // Remove from local state using both identifiers to be safe
        set((state) => ({
          samples: state.samples.filter(s => s.id !== identifier && s.toyId !== identifier),
          isLoading: false,
          error: null
        }));

        // Force refresh to ensure consistency
        get().fetchSamples({}, true);

        return { success: true, message: 'Lab namunasi o\'chirildi' };
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete lab sample';
        console.error('❌ Failed to delete lab sample:', errorMessage);
        set({ error: errorMessage, isLoading: false });

        throw new Error(errorMessage);
      }
    },

    // Toggle sales visibility
    toggleShowToSales: async (identifier: string) => {
      set({ isLoading: true, error: null });
      try {
        console.log('🔄 Toggling sales visibility:', identifier);

        const sample = get().samples.find(s => s.id === identifier || s.toyId === identifier);
        if (!sample) {
          throw new Error('Sample not found');
        }

        const toyId = sample.toyId || sample.sourceId;
        if (!toyId) {
          throw new Error('Toy ID not found');
        }

        const response = await labService.toggleWarehouse(toyId);
        console.log('✅ Toggle response:', response);

        // Update local state
        set((state) => ({
          samples: state.samples.map(s =>
            (s.id === identifier || s.toyId === identifier) ? {
              ...s,
              showToWarehouse: response.showToWarehouse,
              showToSales: response.showToWarehouse // Legacy compatibility
            } : s
          ),
          isLoading: false,
          error: null
        }));

        return { success: true, message: `Savdo ko'rinishi ${response.showToWarehouse ? 'yoqildi' : 'o\'chirildi'}` };
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to toggle sales visibility';
        console.error('❌ Failed to toggle sales visibility:', errorMessage);
        set({ error: errorMessage, isLoading: false });

        throw new Error(errorMessage);
      }
    },

    upsertByToy: async (sample: LabSample) => {
      const existing = get().samples.find(s => s.toyId === sample.toyId);
      const data = {
        toyId: sample.toyId,
        moisture: sample.moisture,
        trash: sample.trash,
        navi: sample.navi,
        grade: sample.grade,
        strength: sample.strength,
        lengthMm: sample.lengthMm,
        micronaire: sample.micronaire,
        operatorName: sample.operatorName,
        comment: sample.comment,
      };

      if (existing) {
        return get().updateSample(sample.toyId, data);
      } else {
        return get().createSample(data);
      }
    }
  })
);