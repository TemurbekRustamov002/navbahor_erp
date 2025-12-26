"use client";
import { useBackendCustomerStore } from "./backendCustomerStore";

export const useCustomerStore = () => {
  const backend = useBackendCustomerStore();

  return {
    ...backend,
    addCustomer: backend.createCustomer,
    updateCustomerLocal: backend.updateCustomer,
    deleteCustomerLocal: backend.deleteCustomer,
    findCustomerById: backend.findCustomerById,
  };
};