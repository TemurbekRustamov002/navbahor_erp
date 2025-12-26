"use client";
import { useBackendMarkaStore } from "./backendMarkaStore";

export const useMarkaStore = () => {
  const backend = useBackendMarkaStore();

  return {
    ...backend,
    // Add aliases for old names if necessary
    addMarka: backend.createMarka,
    toggleShow: backend.toggleScale,
    pauseMarka: (id: string) => backend.updateStatus(id, 'PAUSED'),
    closeMarka: (id: string) => backend.updateStatus(id, 'CLOSED'),
    getFilteredMarkas: () => {
      // Logic from old store
      return backend.markas;
    },
    // Mock methods that might be needed for compatibility but should be replaced later
    incrementUsed: (id: string) => { },
    decrementUsed: (id: string) => { },
    addSelectionVariety: (variety: string) => { },
  };
};