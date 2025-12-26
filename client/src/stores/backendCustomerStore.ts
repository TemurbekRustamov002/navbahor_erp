// Backend-integrated Customer Store
"use client";
import { create } from "zustand";
import { persist } from 'zustand/middleware';
import { customersService } from '@/lib/services';
import type { Customer } from "@/types/customer";

import type { CustomersQuery } from '@/lib/services/customers.service';

type CustomerState = {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;

  // API methods
  fetchCustomers: (query?: CustomersQuery) => Promise<void>;
  createCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;

  // Local methods for demo/offline mode
  addCustomer: (customer: Customer) => void;
  updateCustomerLocal: (id: string, updates: Partial<Customer>) => void;
  deleteCustomerLocal: (id: string) => void;

  // Utility methods
  findCustomerById: (id: string) => Customer | undefined;
  searchCustomers: (query: string) => Customer[];
  getCustomersByType: (type: string) => Customer[];
  getCustomerStats: (id: string) => Promise<any>;
  fetchCustomerStatsBatch: (ids: string[]) => Promise<Record<string, any>>;
  getCustomerReports: (id: string) => Promise<any[]>;
  getCustomerDocuments: (id: string) => Promise<any[]>;
  fetchCustomerById: (id: string) => Promise<Customer | undefined>;
};

export const useBackendCustomerStore = create<CustomerState>()(
  (set, get) => ({
    customers: [],
    isLoading: false,
    error: null,

    // API Methods
    fetchCustomers: async (query) => {
      console.log('🔄 Fetching customers from backend API...', query);
      set({ isLoading: true, error: null });
      try {
        const response = await customersService.getAllCustomers(query || {});

        // Deduplicate by ID just in case
        const uniqueItems = Array.from(new Map(response.items.map(item => [item.id, item])).values());

        console.log('✅ Customers loaded from backend:', uniqueItems.length);
        set({ customers: uniqueItems, isLoading: false });
      } catch (error: any) {
        console.error('❌ Failed to fetch customers from backend:', error.message);
        set({
          error: `Backend error: ${error.message}`,
          isLoading: false,
          customers: []
        });
      }
    },

    createCustomer: async (customerData) => {
      set({ isLoading: true, error: null });
      try {
        const newCustomer = await customersService.createCustomer(customerData);
        set((state) => {
          // Prepend new customer and remove any existing with same ID
          const filtered = state.customers.filter(c => c.id !== newCustomer.id);
          return {
            customers: [newCustomer, ...filtered],
            isLoading: false,
          };
        });
        return true;
      } catch (error: any) {
        console.error('❌ Failed to create customer on backend:', error.message);
        set({ isLoading: false, error: error.message });
        throw error;
      }
    },

    updateCustomer: async (id, updates) => {
      set({ isLoading: true, error: null });
      try {
        const updated = await customersService.updateCustomer(id, updates);
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? updated : c
          ),
          isLoading: false,
        }));
        return true;
      } catch (error: any) {
        console.error('❌ Failed to update customer on backend:', error.message);
        set({ isLoading: false, error: error.message });
        throw error;
      }
    },

    deleteCustomer: async (id) => {
      set({ isLoading: true, error: null });
      try {
        await customersService.deleteCustomer(id);
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
          isLoading: false,
        }));
        return true;
      } catch (error: any) {
        console.error('❌ Failed to delete customer on backend:', error.message);
        set({ isLoading: false, error: error.message });
        throw error;
      }
    },

    // Local methods
    addCustomer: (customer) =>
      set((state) => ({ customers: [customer, ...state.customers] })),

    updateCustomerLocal: (id, updates) =>
      set((state) => ({
        customers: state.customers.map((c) =>
          c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
        ),
      })),

    deleteCustomerLocal: (id) =>
      set((state) => ({
        customers: state.customers.filter((c) => c.id !== id),
      })),

    // Utility methods
    findCustomerById: (id) => {
      return get().customers.find(c => c.id === id);
    },

    searchCustomers: (query) => {
      const { customers } = get();
      const lowercaseQuery = query.toLowerCase();
      return customers.filter(customer =>
        customer.name.toLowerCase().includes(lowercaseQuery) ||
        customer.legalName?.toLowerCase().includes(lowercaseQuery) ||
        customer.director?.toLowerCase().includes(lowercaseQuery) ||
        customer.contactName?.toLowerCase().includes(lowercaseQuery) ||
        customer.contactPhone?.includes(query) ||
        customer.tin?.includes(query) ||
        customer.contactEmail?.toLowerCase().includes(lowercaseQuery)
      );
    },

    getCustomersByType: (type) => {
      // Customer type does not have 'type' property, return all customers for now
      return get().customers;
    },

    getCustomerStats: async (id) => {
      try {
        return await customersService.getCustomerStats(id);
      } catch (error) {
        console.error("Failed to fetch customer stats:", error);
        return {
          totalOrders: 0,
          totalVolume: 0,
          lastOrderDate: null,
          averageOrderValue: 0
        };
      }
    },

    fetchCustomerStatsBatch: async (ids) => {
      try {
        return await customersService.getCustomerStatsBatch(ids);
      } catch (error) {
        console.error("Failed to fetch customer batch stats:", error);
        return {};
      }
    },

    getCustomerReports: async (id) => {
      try {
        return await customersService.getCustomerReports(id);
      } catch (error) {
        console.error("Failed to fetch customer reports:", error);
        return [];
      }
    },

    getCustomerDocuments: async (id) => {
      try {
        return await customersService.getCustomerDocuments(id);
      } catch (error) {
        console.error("Failed to fetch customer documents:", error);
        return [];
      }
    },

    fetchCustomerById: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const customer = await customersService.getCustomerById(id);
        set((state) => {
          const filtered = state.customers.filter(c => c.id !== id);
          return {
            customers: [customer, ...filtered],
            isLoading: false
          };
        });
        return customer;
      } catch (error: any) {
        set({ isLoading: false, error: error.message });
        return undefined;
      }
    },
  })
);