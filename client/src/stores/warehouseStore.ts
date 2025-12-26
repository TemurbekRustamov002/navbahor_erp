"use client";
import { useWarehouseBackendStore } from "./warehouseBackendStore";

export const useWarehouseStore = () => {
  const backend = useWarehouseBackendStore();

  return {
    ...backend,
    // Add any necessary aliases to match old interface
    checklist: backend.currentChecklist,
    setChecklist: (checklist: any) => { }, // Backend handles this via createOrder/createChecklist
    createChecklist: backend.createChecklist,
    scanToy: (toyId: string, scannedBy: string) => backend.scanToy(backend.currentChecklist?.id || '', toyId, ''),
    shipments: [], // Backend shipments store might be needed
    createShipment: (data: any) => backend.finalizeShipment(backend.currentChecklist?.id || '', data),
  };
};