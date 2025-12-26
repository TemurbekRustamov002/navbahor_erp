"use client";
import { useState } from "react";
import { useMultiWarehouseStore } from "@/stores/multiWarehouseStore";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import {
  X,
  MoreHorizontal,
  Copy,
  Archive,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
  Package
} from "lucide-react";

export function WorkspaceTabs() {
  const {
    workspaceTabs,
    activeTabId,
    setActiveTab,
    closeTab,
    customerWorkspaces,
    updateTabStatus
  } = useMultiWarehouseStore();

  const { toast } = useToast();
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Package className="h-3 w-3" />;
      case 'checklist_ready': return <CheckCircle className="h-3 w-3" />;
      case 'scanning': return <Clock className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'shipped': return <Truck className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-primary';
      case 'checklist_ready': return 'text-emerald-600';
      case 'scanning': return 'text-amber-500';
      case 'completed': return 'text-primary';
      case 'shipped': return 'text-slate-400';
      default: return 'text-muted-foreground';
    }
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    const workspace = customerWorkspaces[tabId];

    // Check if there are unsaved changes
    if (workspace?.checklists.some(c => c.status === 'draft')) {
      if (!window.confirm("Bu workspace'da tugallanmagan jarayonlar bor. Haqiqatan ham yopmoqchimisiz?")) {
        return;
      }
    }

    closeTab(tabId);
    toast.success("Workspace yopildi");
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTabId(tabId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault();
    if (!draggedTabId || draggedTabId === targetTabId) return;

    // Reorder tabs logic would go here
    setDraggedTabId(null);
  };

  const getWorkspaceProgress = (tabId: string) => {
    const workspace = customerWorkspaces[tabId];
    if (!workspace || workspace.checklists.length === 0) return 0;

    const totalItems = workspace.checklists.reduce((sum, checklist) => sum + checklist.items.length, 0);
    const scannedItems = workspace.completedScans.length;

    return totalItems > 0 ? (scannedItems / totalItems) * 100 : 0;
  };

  return (
    <div className="bg-secondary/30 backdrop-blur-md px-4 py-2 border-b border-border shadow-sm">
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
        {workspaceTabs.map((tab) => {
          const workspace = customerWorkspaces[tab.id];
          const progress = getWorkspaceProgress(tab.id);
          const isActive = tab.id === activeTabId;

          return (
            <div
              key={tab.id}
              className={cn(
                "group relative flex items-center gap-3 px-5 py-3 rounded-2xl transition-all cursor-pointer min-w-[220px] max-w-[280px]",
                isActive
                  ? "bg-white glass-card shadow-xl border-primary/20 scale-[1.02] z-10"
                  : "bg-background/40 hover:bg-white/80 border-transparent hover:border-border"
              )}
              onClick={() => handleTabClick(tab.id)}
              draggable
              onDragStart={(e) => handleDragStart(e, tab.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, tab.id)}
            >
              {/* Status Indicator */}
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                isActive ? "bg-primary/10" : "bg-white/50 shadow-inner"
              )}>
                <div className={getStatusColor(tab.status)}>
                  {getStatusIcon(tab.status)}
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-black text-[12px] uppercase tracking-tight truncate transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {tab.customerName}
                  </span>
                  {tab.unreadNotifications > 0 && (
                    <span className="bg-primary text-white text-[8px] font-black rounded-full h-4 w-4 flex items-center justify-center shadow-lg shadow-primary/20 animate-bounce">
                      {tab.unreadNotifications}
                    </span>
                  )}
                </div>

                {/* Progress bar for scanning */}
                {workspace?.checklists.length > 0 && (
                  <div className="relative w-full h-1 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out",
                        progress === 100 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-primary"
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  <span>{workspace?.checklists.length || 0} checklist</span>
                  {workspace?.checklists.length > 0 && (
                    <span className="opacity-30">•</span>
                  )}
                  {workspace?.checklists.length > 0 && (
                    <span>{workspace.completedScans.length} ok</span>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleCloseTab(e, tab.id)}
                className={cn(
                  "flex-shrink-0 h-7 w-7 p-0 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all",
                  isActive ? "opacity-40 hover:opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              >
                <X className="h-3.5 w-3.5" />
              </Button>

              {/* Active tab glow line */}
              {isActive && (
                <div className="absolute -bottom-1 left-6 right-6 h-1 bg-primary rounded-full blur-[1px]" />
              )}
            </div>
          );
        })}

        {/* New Tab Button placeholder or Spacer */}
        <div className="flex-shrink-0 w-8" />
      </div>

      {/* Tab shortcuts hint - prestigious version */}
      {workspaceTabs.length > 0 && (
        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 mt-2 px-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[9px] border border-border">Ctrl + 1-9</kbd> Tez almashtirish
          </div>
          <div className="w-1 h-1 bg-border rounded-full" />
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[9px] border border-border">Ctrl + T</kbd> Yangi tab
          </div>
        </div>
      )}
    </div>
  );
}