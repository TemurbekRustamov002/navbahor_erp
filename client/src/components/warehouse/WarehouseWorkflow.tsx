"use client";
import { useState, useEffect } from "react";
import { CustomerSelector } from "./CustomerSelector";
import { ToysByBrands } from "./ToysByBrands";
import { ChecklistManager } from "./ChecklistManager";
import { ScannerInterface } from "./ScannerInterface";
import { ShipmentManager } from "./ShipmentManager";
import { useWarehouseBackendStore } from "@/stores/warehouseBackendStore";
import { useBackendToyStore } from "@/stores/backendToyStore";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { useBackendCustomerStore } from "@/stores/backendCustomerStore";
import { cn } from "@/lib/utils";
import {
  Users,
  Package,
  ClipboardCheck,
  Scan,
  Truck,
  ArrowRight,
  CheckCircle
} from "lucide-react";

type WorkflowStep = "customer" | "toys" | "checklist" | "scanning" | "shipment";

const steps = [
  { id: "customer", label: "Mijoz tanlash", icon: Users, description: "Mijozni tanlang" },
  { id: "toys", label: "Toylar ko'rish", icon: Package, description: "Tasdiqlangan toylar" },
  { id: "checklist", label: "Checklist yaratish", icon: ClipboardCheck, description: "Yuklash ro'yxati" },
  { id: "scanning", label: "QR Skanerlash", icon: Scan, description: "Urovo skaner" },
  { id: "shipment", label: "Yuborish", icon: Truck, description: "Hujjatlar va jo'natish" }
] as const;

export function WarehouseWorkflow() {
  const {
    currentStep,
    setCurrentStep,
    selectedCustomer,
    currentOrder,
    currentChecklist,
    fetchOrders,
    fetchReadyToys,
    error,
    clearError
  } = useWarehouseBackendStore();
  const { fetchToys } = useBackendToyStore();
  const { fetchMarkas } = useBackendMarkaStore();
  const { fetchCustomers } = useBackendCustomerStore();

  // Fetch data on component mount
  useEffect(() => {
    fetchToys();
    fetchMarkas();
    fetchCustomers();
    fetchOrders();
    fetchReadyToys();
  }, [fetchToys, fetchMarkas, fetchCustomers, fetchOrders, fetchReadyToys]);

  // Clear error when step changes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Auto-advance logic
  useEffect(() => {
    if (currentStep === "customer" && selectedCustomer && currentOrder) {
      setCurrentStep("toys");
    } else if (currentStep === "toys" && currentOrder && currentOrder.items.length > 0) {
      // Stay on toys
    } else if (currentStep === "checklist" && currentChecklist && (currentChecklist.items?.length || 0) > 0) {
      setCurrentStep("scanning");
    }
  }, [currentStep, selectedCustomer, currentOrder, currentChecklist, setCurrentStep]);

  const getStepStatus = (stepId: WorkflowStep) => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    const stepIndex = steps.findIndex(s => s.id === stepId);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  const canAccessStep = (stepId: WorkflowStep) => {
    switch (stepId) {
      case "customer": return true;
      case "toys": return !!selectedCustomer;
      case "checklist": return !!currentOrder && currentOrder.items.length > 0;
      case "scanning": return !!currentChecklist && (currentChecklist.items?.length || 0) > 0;
      case "shipment":
        const totalItems = currentChecklist?.items?.length || 0;
        const scannedItems = currentChecklist?.items?.filter(item => item.scanned).length || 0;
        return scannedItems === totalItems && totalItems > 0;
      default: return false;
    }
  };

  return (
    <div className="h-full flex bg-[#f8fafc]">
      {/* Navbahor Workflow Sidebar - Glassmorphism */}
      <div className="w-80 bg-white/80 backdrop-blur-xl border-r border-slate-200 flex-shrink-0 flex flex-col relative z-20 shadow-xl shadow-slate-200/50">
        <div className="p-8 border-b border-slate-100 bg-white/40">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-3">CRM & Logistika</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner">
              <ClipboardCheck className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Ishchi <span className="text-primary italic">Oqim</span></h3>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-none">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id as WorkflowStep);
            const canAccess = canAccessStep(step.id as WorkflowStep);
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                onClick={() => canAccess && setCurrentStep(step.id as WorkflowStep)}
                disabled={!canAccess}
                className={cn(
                  "w-full group relative flex items-center gap-4 p-5 rounded-2xl transition-all duration-500 text-left border",
                  status === "current"
                    ? "bg-primary text-white shadow-xl shadow-primary/20 border-primary scale-[1.02] z-10"
                    : status === "completed"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100/80"
                      : "bg-white/50 text-slate-400 border-transparent hover:bg-white hover:border-slate-200",
                  !canAccess && "opacity-30 cursor-not-allowed grayscale"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-500",
                  status === "current" && "bg-white/20 ring-4 ring-white/10",
                  status === "completed" && "bg-white text-emerald-600 shadow-md",
                  status === "upcoming" && "bg-slate-100 group-hover:bg-white group-hover:scale-105"
                )}>
                  {status === "completed" ? (
                    <CheckCircle className="h-5 w-5" strokeWidth={2.5} />
                  ) : (
                    <Icon className={cn("h-5 w-5", status === "current" ? "animate-pulse" : "")} strokeWidth={2.5} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className={cn(
                    "text-[8px] font-bold uppercase tracking-[0.2em] block leading-none",
                    status === "current" ? "text-white/60" : "text-slate-400"
                  )}>Step 0{index + 1}</span>
                  <div className="font-bold uppercase tracking-widest text-[10px] mt-1.5">{step.label}</div>
                  <div className={cn(
                    "text-[9px] font-medium mt-1 line-clamp-1 opacity-70",
                    status === "current" ? "text-white" : "text-slate-500"
                  )}>
                    {step.description}
                  </div>
                </div>

                {canAccess && status !== "current" && (
                  <ArrowRight className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-all duration-300",
                    status === "completed" ? "text-emerald-500" : "text-slate-300 group-hover:translate-x-1 group-hover:text-primary"
                  )} strokeWidth={2.5} />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Summary - Glass Card */}
        {(selectedCustomer || currentOrder) && (
          <div className="p-6 border-t border-slate-100 bg-white/40 backdrop-blur-sm">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-4">Aktiv Ma&apos;lumot</h3>
            <div className="space-y-3">
              {selectedCustomer && (
                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-primary/20">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                    <Users size={18} strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] font-bold text-slate-400 uppercase leading-none mb-1">Buyurtmachi</p>
                    <p className="text-[11px] font-bold text-slate-900 truncate uppercase mt-0.5">{selectedCustomer.name}</p>
                  </div>
                </div>
              )}
              {currentOrder && (
                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-emerald-200">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Package size={18} strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] font-bold text-slate-400 uppercase leading-none mb-1">Buyurtma No</p>
                    <p className="text-[11px] font-mono font-bold text-emerald-600 mt-0.5">ORD-{currentOrder.number}</p>
                  </div>
                </div>
              )}
              {currentChecklist && (
                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-amber-200">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Scan size={18} strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] font-bold text-slate-400 uppercase leading-none mb-1">Tanlangan</p>
                    <p className="text-[11px] font-mono font-bold text-amber-700 mt-0.5">
                      {currentChecklist.items?.filter(item => item.scanned).length || 0} / {currentChecklist.items?.length || 0} TOY
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mx-5 mb-5 p-4 bg-rose-50 border border-rose-100 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">Tizim Xatoligi</p>
            </div>
            <p className="text-[11px] font-medium text-rose-700 leading-snug">{error}</p>
          </div>
        )}
      </div>

      {/* Main Content Area - Refined Spacing */}
      <div className="flex-1 min-h-0 relative bg-slate-50/50">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,theme(colors.primary.500/0.03),transparent_40%)]" />

        <div className="h-full flex flex-col p-6 lg:p-10">
          <div className="flex-1 bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden relative">
            {currentStep === "customer" && <CustomerSelector />}
            {currentStep === "toys" && <ToysByBrands />}
            {currentStep === "checklist" && <ChecklistManager />}
            {currentStep === "scanning" && <ScannerInterface />}
            {currentStep === "shipment" && <ShipmentManager />}
          </div>
        </div>
      </div>
    </div>
  );
}