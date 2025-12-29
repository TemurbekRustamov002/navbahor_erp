// Backend-integrated Toy Store
"use client";
import { create } from "zustand";
import { persist } from 'zustand/middleware';
import { toysService } from '@/lib/services/toys.service';
import type { Toy, ProductType } from "@/types/toy";

type ToyState = {
  toys: Toy[];
  isLoading: boolean;
  error: string | null;

  // Local state methods (for offline/demo mode)
  addToyLocal: (toy: Toy) => void;
  updateToyLocal: (id: string, updates: Partial<Toy>) => void;
  deleteToyLocal: (id: string) => void;

  // Backend methods
  fetchToys: (query?: { markaId?: string; productType?: ProductType; page?: number; limit?: number }) => Promise<void>;
  createToy: (toyData: { markaId: string; productType: ProductType; brutto: number; tara: number; netto: number; orderNo?: number; brigade?: string }) => Promise<Toy>;
  updateToy: (id: string, updates: Partial<Toy>) => Promise<Toy>;
  deleteToy: (id: string) => Promise<void>;
  fetchScaleAvailable: () => Promise<void>;
  markAsPrinted: (id: string) => Promise<void>;

  // Utility methods
  getToysByMarka: (markaId: string) => Toy[];
  getAvailableToys: () => Toy[];
  reserveToy: (id: string) => void;
  unreserveToy: (id: string) => void;
  markAsSold: (id: string) => void;
  getNextOrderNo: (markaId?: string) => number;
  clearError: () => void;
};

export const useBackendToyStore = create<ToyState>()(
  (set, get) => ({
    toys: [],
    isLoading: false,
    error: null,

    // Local state methods for offline/demo mode compatibility
    addToyLocal: (toy) => set((s) => ({ toys: [toy, ...s.toys] })),

    updateToyLocal: (id, updates) =>
      set((s) => ({
        toys: s.toys.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      })),

    deleteToyLocal: (id) =>
      set((s) => ({
        toys: s.toys.filter((t) => t.id !== id),
      })),

    // Backend methods
    fetchToys: async (query = {}) => {
      // Check if same call is already in progress
      if (get().isLoading) {
        console.log('⏭️ Toys fetch already in progress, skipping...');
        return;
      }

      console.log('🔄 Fetching toys from backend API...', query);
      set({ isLoading: true, error: null });

      try {
        const response = await toysService.getAllToys(query);
        console.log('✅ Raw API Response received:', response);

        // Handle standardized response format
        let toys: any[] = [];
        if (response && typeof response === 'object') {
          const responseAny = response as any;
          if (Array.isArray(response)) {
            // Direct array response
            toys = response;
          } else if (responseAny.items && Array.isArray(responseAny.items)) {
            // Paginated response with items array
            toys = responseAny.items;
          } else {
            console.warn('Unexpected toys response format:', response);
            toys = [];
          }
        } else {
          console.warn('Invalid toys response:', response);
          toys = [];
        }

        // Ensure toys is always an array
        if (!Array.isArray(toys)) {
          console.warn('Toys data is not an array, converting to empty array');
          toys = [];
        }

        console.log('✅ Toys loaded from backend:', toys.length);
        set({ toys, isLoading: false, error: null });
      } catch (error: any) {
        console.error('❌ Failed to fetch toys from backend:', error.message);
        set({
          error: `Backend error: ${error.message}`,
          isLoading: false,
          toys: []
        });
      }
    },

    createToy: async (toyData) => {
      console.log('🔄 Creating new toy via backend API...', toyData);
      set({ isLoading: true, error: null });
      try {
        const newToy = await toysService.createToy(toyData);
        console.log('✅ Toy created successfully:', newToy);
        set((s) => ({
          toys: [newToy, ...s.toys],
          isLoading: false
        }));
        // Auto-closure logic: if toy count reaches 220, close the marka
        if (newToy.orderNo >= 220) {
          console.log('🏁 Marka toy limit (220) reached. Auto-closing...');
          import('@/lib/services/markas.service').then(({ markasService }) => {
            markasService.updateMarkaStatus(newToy.markaId, 'CLOSED').catch(err => {
              console.error('Failed to auto-close marka:', err);
            });
          });
        }
        return newToy;
      } catch (error: any) {
        console.error('❌ Failed to create toy on backend:', error.message);
        set({ isLoading: false, error: error.message });
        throw error;
      }
    },

    updateToy: async (id, updates) => {
      set({ isLoading: true, error: null });
      try {
        const updatedToy = await toysService.updateToy(id, updates);
        set((s) => ({
          toys: s.toys.map((t) => t.id === id ? updatedToy : t),
          isLoading: false
        }));
        return updatedToy;
      } catch (error: any) {
        console.error('❌ Failed to update toy on backend:', error.message);
        set({ isLoading: false, error: error.message });
        throw error;
      }
    },

    deleteToy: async (id) => {
      set({ isLoading: true, error: null });
      try {
        await toysService.deleteToy(id);
        set((s) => ({
          toys: s.toys.filter((t) => t.id !== id),
          isLoading: false
        }));
      } catch (error: any) {
        console.error('❌ Failed to delete toy on backend:', error.message);
        set({ isLoading: false, error: error.message });
        throw error;
      }
    },

    fetchScaleAvailable: async () => {
      set({ isLoading: true, error: null });
      try {
        const scaleAvailable = await toysService.getScaleAvailableToys();
        // Filter current toys to show only scale available ones
        set((s) => ({
          toys: scaleAvailable,
          isLoading: false
        }));
      } catch (error: any) {
        console.warn('Failed to fetch scale available toys:', error.message);
        set({ error: error.message, isLoading: false });
      }
    },

    markAsPrinted: async (id) => {
      set({ isLoading: true, error: null });
      try {
        await toysService.markToyPrinted(id);
        set((s) => ({
          toys: s.toys.map((t) => t.id === id ? { ...t, printed: true } : t),
          isLoading: false
        }));
      } catch (error: any) {
        console.error('❌ Failed to mark toy as printed on backend:', error.message);
        set({ isLoading: false, error: error.message });
        throw error;
      }
    },

    // Utility methods (work with local state)
    getToysByMarka: (markaId) =>
      get().toys.filter(t => t.markaId === markaId),

    getAvailableToys: () =>
      get().toys.filter(t => !t.reserved && !t.sold),

    reserveToy: (id) =>
      set((s) => ({
        toys: s.toys.map((t) =>
          t.id === id ? { ...t, reserved: true } : t
        ),
      })),

    unreserveToy: (id) =>
      set((s) => ({
        toys: s.toys.map((t) =>
          t.id === id ? { ...t, reserved: false } : t
        ),
      })),

    markAsSold: (id) =>
      set((s) => ({
        toys: s.toys.map((t) =>
          t.id === id ? { ...t, sold: true, reserved: false } : t
        ),
      })),

    getNextOrderNo: (markaId?: string) => {
      if (!markaId) {
        // Fallback: barcha toylar orasidan max
        const toys = get().toys;
        if (toys.length === 0) return 1;
        return Math.max(...toys.map(t => t.orderNo || 0)) + 1;
      }

      // Faqat shu marka toylarini ko'rish
      const markaToys = get().toys.filter(t => t.markaId === markaId);
      if (markaToys.length === 0) return 1;
      return Math.max(...markaToys.map(t => t.orderNo || 0)) + 1;
    },

    clearError: () => set({ error: null }),
  })
);