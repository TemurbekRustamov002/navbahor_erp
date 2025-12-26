"use client";
import { useState } from "react";
import { CustomerWorkspace } from "@/stores/multiWarehouseStore";
import { useMultiWarehouseStore } from "@/stores/multiWarehouseStore";
import { ToysByBrandsMulti } from "./ToysByBrandsMulti";
import { ProfessionalChecklistManager } from "./ProfessionalChecklistManager";
import { ScannerInterfaceMulti } from "./ScannerInterfaceMulti";
import { ShipmentManagerMulti } from "./ShipmentManagerMulti";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import {
  Package,
  ClipboardCheck,
  Scan,
  Truck,
  ArrowRight,
  CheckCircle,
  Plus,
  Archive,
  RefreshCw
} from "lucide-react";

interface WorkspaceContentProps {
  workspace: CustomerWorkspace;
}

const stepConfig = [
  { id: 'toys', label: 'Toylar tanlash', icon: Package, description: 'Tasdiqlangan toylarni ko\'ring' },
  { id: 'checklist', label: 'Checklist', icon: ClipboardCheck, description: 'Yuklash ro\'yxati yarating' },
  { id: 'scanning', label: 'Skanerlash', icon: Scan, description: 'QR kod orqali tasdiqlash' },
  { id: 'shipment', label: 'Yuborish', icon: Truck, description: 'Hujjatlar va jo\'natish' }
] as const;

export function WorkspaceContent({ workspace }: WorkspaceContentProps) {
  const {
    setWorkspaceStep,
    updateTabStatus,
    addNotification,
    updateTabActivity
  } = useMultiWarehouseStore();

  const { toast } = useToast();
  const [showStepSelector, setShowStepSelector] = useState(false);

  const currentStepIndex = stepConfig.findIndex(step => step.id === workspace.currentStep);
  const canAccessStep = (stepId: string) => {
    switch (stepId) {
      case 'toys':
        return true;
      case 'checklist':
        return workspace.selectedToys.length > 0 || workspace.checklists.length > 0;
      case 'scanning':
        return workspace.checklists.some(c => c.items.length > 0);
      case 'shipment':
        return workspace.checklists.some(c => c.items.every((item: any) => item.isScanned));
      default:
        return false;
    }
  };

  const getStepStatus = (stepId: string) => {
    const stepIndex = stepConfig.findIndex(step => step.id === stepId);

    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    if (canAccessStep(stepId)) return 'available';
    return 'locked';
  };

  const handleStepChange = (stepId: string) => {
    if (!canAccessStep(stepId)) {
      toast.error("Bu bosqichga o'tish uchun oldingi bosqichlarni tugallang");
      return;
    }

    setWorkspaceStep(workspace.tabId, stepId as any);
    updateTabActivity(workspace.tabId);
    setShowStepSelector(false);

    // Update tab status based on step
    switch (stepId) {
      case 'checklist':
        if (workspace.checklists.length > 0) {
          updateTabStatus(workspace.tabId, 'checklist_ready');
        }
        break;
      case 'scanning':
        updateTabStatus(workspace.tabId, 'scanning');
        break;
      case 'shipment':
        updateTabStatus(workspace.tabId, 'completed');
        break;
    }
  };

  const getActiveChecklist = () => {
    return workspace.checklists.find(c => c.id === workspace.activeChecklistId) || workspace.checklists[0];
  };

  const getTotalProgress = () => {
    if (workspace.checklists.length === 0) return 0;
    const totalItems = workspace.checklists.reduce((sum, checklist) => sum + checklist.items.length, 0);
    const scannedItems = workspace.completedScans.length;
    return totalItems > 0 ? Math.round((scannedItems / totalItems) * 100) : 0;
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Workspace Header */}
      <div className="flex-shrink-0 border-b border-border bg-white/40 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between gap-12">
          <div className="flex items-center gap-12">
            {/* Customer Info */}
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{workspace.customer.name}</h2>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                {workspace.customer.legalName || 'N/A'} • {workspace.customer.address || 'N/A'}
              </div>
            </div>

            {/* Step Navigation */}
            <div className="flex items-center gap-2 bg-secondary/30 p-1.5 rounded-[1.5rem] border border-border">
              {stepConfig.map((step, index) => {
                const status = getStepStatus(step.id);
                const Icon = step.icon;

                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => handleStepChange(step.id)}
                      disabled={status === 'locked'}
                      className={cn(
                        "flex items-center gap-3 px-5 py-3 rounded-2xl transition-all text-[11px] font-black uppercase tracking-widest",
                        status === 'current' && "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.05]",
                        status === 'completed' && "bg-white text-emerald-600 hover:bg-emerald-50 border border-emerald-100",
                        status === 'available' && "bg-white/50 text-foreground hover:bg-white border border-transparent shadow-sm",
                        status === 'locked' && "bg-transparent text-muted-foreground/30 cursor-not-allowed"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", status === 'current' ? "text-white" : "text-primary")} />
                      <span>{step.label}</span>
                      {status === 'completed' && <CheckCircle className="h-3.5 w-3.5 ml-1" />}
                    </button>
                    {index < stepConfig.length - 1 && (
                      <div className="w-4 h-[2px] bg-border mx-1 opacity-50" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Workspace Stats - Prestigious Badge Style */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-xl border border-border">
                  <ClipboardCheck className="h-4 w-4 text-primary" />
                  <span className="text-[11px] font-black uppercase tracking-tighter">{workspace.checklists.length} <span className="opacity-40">CH/L</span></span>
                </div>
                {workspace.checklists.length > 0 && (
                  <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-xl border border-border">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-black uppercase tracking-tighter">
                      {workspace.checklists.reduce((sum, c) => sum + c.items.length, 0)} <span className="opacity-40">TOY</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Total Progress Ring/Indicator */}
            {workspace.checklists.length > 0 && (
              <div className="flex items-center gap-4 pl-6 border-l border-border">
                <div className="text-right">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Progress</p>
                  <p className="text-2xl font-black text-foreground">{getTotalProgress()}<span className="text-sm opacity-30">%</span></p>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-secondary flex items-center justify-center relative">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="18"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-primary"
                      strokeDasharray={113}
                      strokeDashoffset={113 - (113 * getTotalProgress()) / 100}
                    />
                  </svg>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Progress Loader - Subtle Bar */}
        {workspace.checklists.length > 0 && (
          <div className="absolute left-0 right-0 bottom-0 h-[2px] bg-border/20">
            <div
              className={cn(
                "h-full transition-all duration-1000 ease-in-out",
                getTotalProgress() === 100 ? "bg-emerald-500" : "bg-primary"
              )}
              style={{ width: `${getTotalProgress()}%` }}
            />
          </div>
        )}
      </div>

      {/* Step Content */}
      <div className="flex-1 min-h-0">
        {workspace.currentStep === 'toys' && (
          <ToysByBrandsMulti workspaceId={workspace.customer.id} />
        )}
        {workspace.currentStep === 'checklist' && (
          <ProfessionalChecklistManager
            workspaceId={workspace.tabId}
            customerId={workspace.customer.id}
            customerName={workspace.customer.name}
          />
        )}
        {workspace.currentStep === 'scanning' && (
          <ScannerInterfaceMulti workspaceId={workspace.customer.id} />
        )}
        {workspace.currentStep === 'shipment' && (
          <ShipmentManagerMulti workspaceId={workspace.customer.id} />
        )}
      </div>
    </div>
  );
}