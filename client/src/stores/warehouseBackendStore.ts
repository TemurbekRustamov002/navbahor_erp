import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api';
import { useAuthStore } from './authStore';

interface WarehouseOrder {
  id: string;
  number: string;
  status: string;
  customerId: string;
  customerName: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: WarehouseItem[];
  checklist?: WarehouseChecklist;
  createdAt: string;
  updatedAt: string;
}

interface WarehouseItem {
  id: string;
  orderId: string;
  toyId: string;
  markaId: string;
  productType: string;
  orderNo?: number; // Make optional to prevent undefined errors
  netto: number;
  toy?: {
    id: string;
    qrCode?: string;
    orderNo?: number;
  };
  marka?: {
    id: string;
    number?: number;
    productType?: string;
  };
}

interface WarehouseChecklist {
  id: string;
  code?: string;
  orderId: string;
  status: string;
  totalItems: number;
  scannedItems: number;
  items: ChecklistItem[];
  completedAt?: string;
}

interface ChecklistItem {
  id: string;
  checklistId: string;
  toyId: string;
  markaId: string;
  orderNo: number;
  productType: string;
  netto: number;
  brutto?: number;
  tara?: number;
  markaNo?: string | number;
  scanned: boolean;
  scannedAt?: string;
  qrCode?: string;
  actualQrCode?: string;
  toy: any;
  marka: any;
}

interface ReadyToysGroup {
  marka: {
    id: string;
    number: number;
    productType: string;
    status: string;
    ptm?: string;
  };
  toys: any[];
}

type WorkflowStep = "customer" | "toys" | "checklist" | "scanning" | "shipment";

interface WarehouseBackendState {
  // Current workflow state
  currentStep: WorkflowStep;
  selectedCustomer: any | null;
  currentOrder: WarehouseOrder | null;
  currentChecklist: WarehouseChecklist | null;

  // Data
  orders: WarehouseOrder[];
  checklists: any[];
  readyToys: ReadyToysGroup[];

  // Loading states
  loading: boolean;
  error: string | null;

  // Actions
  setCurrentStep: (step: WorkflowStep) => void;
  setSelectedCustomer: (customer: any) => void;

  // API actions
  fetchOrders: () => Promise<void>;
  fetchChecklists: () => Promise<void>;
  fetchReadyToys: () => Promise<void>;
  fetchChecklistById: (id: string) => Promise<WarehouseChecklist>;
  createOrder: (customerId: string) => Promise<WarehouseOrder>;
  addItemsToOrder: (orderId: string, toyIds: string[]) => Promise<void>;
  createChecklist: (orderId: string) => Promise<WarehouseChecklist>;
  scanToy: (checklistId: string, toyId: string, qrCode: string) => Promise<void>;
  completeChecklist: (checklistId: string) => Promise<void>;
  finalizeShipment: (checklistId: string, data: any) => Promise<any>;
  deleteOrder: (orderId: string) => Promise<void>;

  // Utilities
  reset: () => void;
  clearError: () => void;
}

export const useWarehouseBackendStore = create<WarehouseBackendState>()(
  (set, get) => ({
    // Initial state
    currentStep: "customer",
    selectedCustomer: null,
    currentOrder: null,
    currentChecklist: null,
    orders: [],
    checklists: [],
    readyToys: [],
    loading: false,
    error: null,

    // Basic actions
    setCurrentStep: (step: WorkflowStep) => {
      set({ currentStep: step });
    },

    setSelectedCustomer: (customer: any) => {
      // Clear any existing order/checklist when selecting new customer
      set({
        selectedCustomer: customer,
        currentOrder: null,
        currentChecklist: null,
        error: null
      });
    },

    clearError: () => set({ error: null }),

    // API Actions
    fetchOrders: async () => {
      try {
        set({ loading: true, error: null });
        const response = await apiClient.get('/warehouse/orders');
        set({ orders: response.orders || response || [] });
      } catch (error: any) {
        console.error('Orders fetch error:', error);
        set({ error: error.response?.data?.message || 'Failed to fetch orders', orders: [] });
      } finally {
        set({ loading: false });
      }
    },

    fetchChecklists: async () => {
      try {
        set({ loading: true, error: null });
        const response = await apiClient.get('/warehouse/checklists');
        set({ checklists: response || [] });
      } catch (error: any) {
        console.error('Checklists fetch error:', error);
        set({ error: error.response?.data?.message || 'Failed to fetch checklists' });
      } finally {
        set({ loading: false });
      }
    },

    fetchChecklistById: async (id: string) => {
      try {
        set({ loading: true, error: null });
        const response = await apiClient.get(`/warehouse/checklists/${id}`);
        set({ currentChecklist: response });
        return response;
      } catch (error: any) {
        console.error('Checklist fetch by id error:', error);
        set({ error: error.response?.data?.message || 'Failed to fetch checklist details' });
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    fetchReadyToys: async () => {
      try {
        set({ loading: true, error: null });
        const response = await apiClient.get('/warehouse/toys/ready');
        // Handle different response formats
        const readyToysData = Array.isArray(response) ? response : response?.data || response?.readyToys || [];
        set({ readyToys: readyToysData });
      } catch (error: any) {
        console.error('Ready toys fetch error:', error);
        set({ error: error.response?.data?.message || 'Failed to fetch ready toys', readyToys: [] });
      } finally {
        set({ loading: false });
      }
    },

    createOrder: async (customerId: string): Promise<WarehouseOrder> => {
      try {
        set({ loading: true, error: null });
        const response = await apiClient.post('/warehouse/orders', { customerId });

        // Update orders list
        const { orders } = get();
        set({
          orders: [response, ...orders],
          currentOrder: response,
          currentChecklist: response.checklist || null
        });

        return response;
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || 'Failed to create order';
        set({ error: errorMsg });
        throw new Error(errorMsg);
      } finally {
        set({ loading: false });
      }
    },

    addItemsToOrder: async (orderId: string, toyIds: string[]) => {
      try {
        set({ loading: true, error: null });
        await apiClient.put(`/warehouse/orders/${orderId}/items`, { toyIds });

        // Refresh current order
        const updatedOrder = await apiClient.get(`/warehouse/orders/${orderId}`);
        set({ currentOrder: updatedOrder });

        // Update in orders list
        const { orders } = get();
        set({
          orders: orders.map(order =>
            order.id === orderId ? updatedOrder : order
          )
        });
      } catch (error: any) {
        set({ error: error.response?.data?.message || 'Failed to add items' });
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    createChecklist: async (orderId: string): Promise<WarehouseChecklist> => {
      try {
        set({ loading: true, error: null });
        const response = await apiClient.post(`/warehouse/orders/${orderId}/checklist`);

        set({
          currentChecklist: response,
          currentStep: "scanning"
        });

        return response;
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || 'Failed to create checklist';
        set({ error: errorMsg });
        throw new Error(errorMsg);
      } finally {
        set({ loading: false });
      }
    },

    scanToy: async (checklistId: string, toyId: string, qrCode: string) => {
      try {
        set({ loading: true, error: null });
        const response = await apiClient.put(`/warehouse/checklists/${checklistId}/scan`, {
          toyId,
          qrCode
        });

        set({ currentChecklist: response });

        // Don't auto-advance - let user manually proceed when ready
        // if (response.scannedItems === response.totalItems) {
        //   set({ currentStep: "shipment" });
        // }
      } catch (error: any) {
        set({ error: error.response?.data?.message || 'Failed to scan toy' });
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    finalizeShipment: async (checklistId: string, data: any) => {
      try {
        const { currentChecklist, currentOrder } = get();
        const authUser = useAuthStore.getState().user;

        if (!currentChecklist) throw new Error("Checklist topilmadi");

        set({ loading: true, error: null });

        // Map simple frontend data to complex backend DTO
        const names = (data.driverName || 'HAYDOVCHI').split(' ');
        const firstName = names[0] || 'HAYDOVCHI';
        const lastName = names.slice(1).join(' ') || 'MAS\'ULI';

        const shipmentDto = {
          orderId: currentChecklist.orderId,
          checklistId: checklistId,
          customerId: currentOrder?.customerId || currentChecklist.items?.[0]?.marka?.customerId || 'unknown',
          customerName: currentOrder?.customerName || currentChecklist.items?.[0]?.marka?.customerName || 'Noma\'lum Mijoz',
          driver: {
            firstName,
            lastName,
            licenseNumber: data.licenseNumber || 'N/A',
            phone: data.driverPhone || 'N/A',
            vehicleNumber: data.vehicleNumber,
            vehicleType: data.vehicleType || 'Yuk mashinasi'
          },
          waybillNumber: data.waybillNumber || `WB-${Date.now()}`,
          notes: data.notes,
          shippedBy: authUser?.id || 'unknown-user',
          documents: data.documents || {
            waybill: true,
            invoice: true,
            packing: true,
            quality: true
          }
        };

        const response = await apiClient.post('/warehouse/shipments', shipmentDto);

        // Clear all data after successful shipment
        set({
          currentOrder: null,
          currentChecklist: null,
          selectedCustomer: null,
          currentStep: "customer"
        });

        return response;
      } catch (error: any) {
        console.error('Shipment finalize error:', error);
        const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Failed to create shipment';
        set({ error: errorMsg });
        throw new Error(errorMsg);
      } finally {
        set({ loading: false });
      }
    },

    completeChecklist: async (checklistId: string) => {
      try {
        set({ loading: true, error: null });
        await apiClient.put(`/warehouse/checklists/${checklistId}/complete`);

        set({ currentStep: "shipment" });
      } catch (error: any) {
        set({ error: error.response?.data?.message || 'Failed to complete checklist' });
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    deleteOrder: async (orderId: string) => {
      try {
        set({ loading: true, error: null });
        await apiClient.delete(`/warehouse/orders/${orderId}`);

        // Remove from orders list
        const { orders } = get();
        set({
          orders: orders.filter(order => order.id !== orderId),
          currentOrder: null,
          currentChecklist: null
        });
      } catch (error: any) {
        set({ error: error.response?.data?.message || 'Failed to delete order' });
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    reset: () => {
      set({
        currentStep: "customer",
        selectedCustomer: null,
        currentOrder: null,
        currentChecklist: null,
        error: null
      });
    }
  })
);