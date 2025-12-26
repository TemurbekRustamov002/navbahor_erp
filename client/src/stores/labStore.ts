"use client";
import { useBackendLabStore } from "./backendLabStore";

export const useLabStore = () => {
  const backend = useBackendLabStore();

  return {
    ...backend,
    upsertByToy: backend.createSample,
    updateStatus: (id: string, status: any) => {
      // backend uses toyId for some methods, id for others. 
      // In backendLabStore, approveSample/rejectSample use toyId.
      if (status === 'APPROVED') return backend.approveSample(id);
      if (status === 'REJECTED') return backend.rejectSample(id);
    },
    findByToyId: backend.getSampleByToyId,
    removeSample: backend.deleteSample,
  };
};