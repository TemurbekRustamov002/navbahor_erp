// Backend-integrated Marka Store with Caching
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { markasService, MarkaQuery } from "@/lib/services/markas.service";
import { Marka, ProductType, MarkaStatus, SexType } from "@/types/marka";

const CACHE_DURATION = 30000; // 30 seconds;

type MarkaState = {
  markas: Marka[];
  isLoading: boolean;
  error: string | null;
  filters: Record<string, any>;
  stats: any | null;
  lastFetched: number | null;

  // Backend methods
  fetchMarkas: (query?: MarkaQuery, force?: boolean) => Promise<void>;
  createMarka: (markaData: {
    number: number;
    productType: ProductType;
    sex?: SexType;
    ptm: string;
    selection: string;
    pickingType: 'qol' | 'mashina';
    capacity?: number;
    showOnScale?: boolean;
    notes?: string;
    createdBy?: string;
  }) => Promise<Marka>;
  updateMarka: (id: string, updates: Partial<Marka>) => Promise<Marka>;
  deleteMarka: (id: string) => Promise<{ success: boolean; message: string }>;
  toggleScale: (id: string) => Promise<void>;
  updateStatus: (id: string, status: MarkaStatus) => Promise<void>;
  fetchStats: () => Promise<void>;

  // Local methods for demo/offline mode
  addMarkaLocal: (marka: Marka) => void;
  updateMarkaLocal: (id: string, updates: Partial<Marka>) => void;
  deleteMarkaLocal: (id: string) => void;

  // Utility methods
  getMarkaById: (id: string) => Marka | undefined;
  getScaleVisibleMarkas: () => Marka[];
  getScaleVisibleMarkasScoped: () => Marka[];
  getMarkasByProductType: (productType: ProductType) => Marka[];
  getActiveMarkas: () => Marka[];
  clearError: () => void;
  toggleScaleVisibility: (id: string) => void;

  // Filters
  setFilters: (filters: Record<string, any>) => void;
};

export const useBackendMarkaStore = create<MarkaState>()(
  (set, get) => ({
    markas: [],
    isLoading: false,
    error: null,
    filters: {},
    stats: null,
    lastFetched: null,

    // Backend methods
    fetchMarkas: async (query = {}, force = false) => {
      const { lastFetched, isLoading } = get();
      if (!force && lastFetched && (Date.now() - lastFetched < CACHE_DURATION)) return;
      if (isLoading) return;

      set({ isLoading: true, error: null });
      try {
        const response = await markasService.getAllMarkas(query);
        // Handle different response formats (Array vs Object with items)
        const markas = Array.isArray(response) ? response : (response as any).items || [];
        set({ markas, isLoading: false, lastFetched: Date.now() });
      } catch (error: any) {
        set({ error: error.message || 'Failed to fetch markas', isLoading: false });
      }
    },

    createMarka: async (markaData) => {
      set({ isLoading: true, error: null });
      try {
        const response = await markasService.createMarka(markaData as any);
        const newMarka = (response as any).data || response;
        set((s) => ({
          markas: [newMarka, ...s.markas],
          isLoading: false
        }));
        return newMarka;
      } catch (error: any) {
        set({ isLoading: false, error: error.message });
        throw error;
      }
    },

    updateMarka: async (id, updates) => {
      set({ isLoading: true, error: null });
      try {
        const response = await markasService.updateMarka(id, updates);
        const updatedMarka = (response as any).data || response;
        set((s) => ({
          markas: s.markas.map((m) => m.id === id ? updatedMarka : m),
          isLoading: false
        }));
        return updatedMarka;
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },

    deleteMarka: async (id: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await markasService.deleteMarka(id);
        set((s) => ({
          markas: s.markas.filter((m) => m.id !== id),
          isLoading: false
        }));
        return { success: true, message: response.message || 'Marka deleted' };
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },

    toggleScale: async (id) => {
      if (!id) return;
      set({ isLoading: true, error: null });
      try {
        const response = await markasService.toggleMarkaScale(id);
        const updatedMarka = (response as any).data || response;
        set((s) => ({
          markas: s.markas.map((m) => m.id === id ? updatedMarka : m),
          isLoading: false
        }));
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
      }
    },

    updateStatus: async (id, status) => {
      if (!id) return;
      set({ isLoading: true, error: null });
      try {
        const response = await markasService.updateMarkaStatus(id, status);
        const updatedMarka = (response as any).data || response;
        set((s) => ({
          markas: s.markas.map((m) => m.id === id ? updatedMarka : m),
          isLoading: false
        }));
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
      }
    },

    fetchStats: async () => {
      set({ isLoading: true, error: null });
      try {
        const stats = await markasService.getMarkaStats();
        set({ stats, isLoading: false });
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
      }
    },

    // Local methods
    addMarkaLocal: (marka) => set((s) => ({ markas: [marka, ...s.markas] })),
    updateMarkaLocal: (id, updates) =>
      set((s) => ({
        markas: s.markas.map((m) =>
          m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
        ),
      })),
    deleteMarkaLocal: (id) =>
      set((s) => ({
        markas: s.markas.filter((m) => m.id !== id),
      })),

    // Utility methods
    getMarkaById: (id) => get().markas.find(m => m.id === id),
    getScaleVisibleMarkas: () => get().markas.filter(m => m.showOnScale && m.status === 'ACTIVE'),
    getScaleVisibleMarkasScoped: () => {
      const base = get().markas.filter(m => m.showOnScale && m.status === 'ACTIVE');
      // Simple scoped logic
      return base;
    },
    getMarkasByProductType: (productType) => get().markas.filter(m => m.productType === productType),
    getActiveMarkas: () => get().markas.filter(m => m.status === 'ACTIVE'),
    clearError: () => set({ error: null }),
    toggleScaleVisibility: (id) =>
      set((s) => ({
        markas: s.markas.map((m) =>
          m.id === id ? { ...m, showOnScale: !m.showOnScale, updatedAt: new Date().toISOString() } : m
        ),
      })),

    setFilters: (filters) => set((state) => ({
      filters: { ...state.filters, ...filters }
    })),
  })
);