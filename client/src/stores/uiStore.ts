"use client";
import { create } from "zustand";
import type { ProductType, MarkaStatus } from "@/types/marka";

export interface MarkaFilter {
  search: string;
  productTypes: ProductType[];
  sex: "all" | "valikli" | "arrali";
  status: "all" | MarkaStatus;
  showOnScale: "all" | "only" | "hidden";
  numberFrom?: number;
  numberTo?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface LabFilter {
  search: string;
  productTypes: ProductType[];
  status: "all" | "pending" | "approved" | "rejected";
  showToSales: "all" | "only" | "hidden";
  dateFrom?: string;
  dateTo?: string;
  analyst?: string;
}

type UIState = {
  markaFilter: MarkaFilter;
  labFilter: LabFilter;
  setMarkaFilter: (filter: Partial<MarkaFilter>) => void;
  setLabFilter: (filter: Partial<LabFilter>) => void;
  resetMarkaFilter: () => void;
  resetLabFilter: () => void;
};

const defaultMarkaFilter: MarkaFilter = {
  search: "",
  productTypes: [],
  sex: "all",
  status: "all",
  showOnScale: "all",
};

const defaultLabFilter: LabFilter = {
  search: "",
  productTypes: [],
  status: "all",
  showToSales: "all",
};

export const useUIStore = create<UIState>((set) => ({
  markaFilter: defaultMarkaFilter,
  labFilter: defaultLabFilter,
  
  setMarkaFilter: (filter) =>
    set((s) => ({
      markaFilter: { ...s.markaFilter, ...filter },
    })),
    
  setLabFilter: (filter) =>
    set((s) => ({
      labFilter: { ...s.labFilter, ...filter },
    })),
    
  resetMarkaFilter: () =>
    set(() => ({ markaFilter: defaultMarkaFilter })),
    
  resetLabFilter: () =>
    set(() => ({ labFilter: defaultLabFilter })),
}));