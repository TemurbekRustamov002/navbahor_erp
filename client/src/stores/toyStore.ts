"use client";
import { useBackendToyStore } from "./backendToyStore";

export const useToyStore = () => {
  const backend = useBackendToyStore();

  return {
    ...backend,
    addToy: backend.createToy,
    // Add any other aliases
  };
};