"use client";
import { useState, useEffect } from "react";
import { useMultiWarehouseStore } from "@/stores/multiWarehouseStore";
import { WorkspaceTabs } from "./WorkspaceTabs";
import { CustomerSelectorModal } from "./CustomerSelectorModal";
import { WorkspaceContent } from "./WorkspaceContent";
import { WorkspaceStats } from "./WorkspaceStats";
import { NotificationPanel } from "./NotificationPanel";
import { ChecklistPreloader } from "./ChecklistPreloader";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import {
  Plus,
  Users,
  BarChart3,
  Bell,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Package
} from "lucide-react";

export function MultiWarehouseLayout() {
  const {
    workspaceTabs,
    activeTabId,
    customerWorkspaces,
    setActiveTab,
    getWorkspaceStats,
    cleanupInactiveTabs
  } = useMultiWarehouseStore();

  const { toast } = useToast();
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const activeWorkspace = activeTabId ? customerWorkspaces[activeTabId] : null;
  const stats = getWorkspaceStats();

  // Auto-cleanup old tabs every hour
  useEffect(() => {
    const cleanup = () => cleanupInactiveTabs();
    const interval = setInterval(cleanup, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, [cleanupInactiveTabs]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 't':
            e.preventDefault();
            setShowCustomerModal(true);
            break;
          case 'w':
            if (e.shiftKey && activeTabId) {
              e.preventDefault();
              // Close active tab logic would go here
            }
            break;
          case '`':
            e.preventDefault();
            setShowStats(!showStats);
            break;
        }
      }

      // Tab switching with Ctrl+Number
      if ((e.ctrlKey || e.metaKey) && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        if (workspaceTabs[tabIndex]) {
          setActiveTab(workspaceTabs[tabIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, workspaceTabs, setActiveTab, showStats]);

  const getTotalNotifications = () => {
    return workspaceTabs.reduce((sum, tab) => sum + tab.unreadNotifications, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'checklist_ready': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'scanning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'shipped': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden font-sans">
      <ChecklistPreloader />

      {/* Top Bar - Prestigious Design */}
      <div className="flex-shrink-0 border-b border-slate-100 bg-white/80 backdrop-blur-xl z-50">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left section - Branding & Live Metrics */}
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-4 group">
                <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20 group-hover:scale-105 transition-all">
                  <Package size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight leading-none">Multi <span className="text-primary italic">Terminal</span></h1>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">Live Workspace <span className="text-slate-200 ml-1">v2.4</span></span>
                  </div>
                </div>
              </div>

              <div className="h-10 w-px bg-slate-100" />

              {/* Quick Metrics Dashboard style */}
              <div className="flex items-center gap-8">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 leading-none">Terminallar</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-900 font-mono tracking-tighter leading-none">{stats.activeTabs}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 leading-none">Reestr</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-900 font-mono tracking-tighter leading-none">{stats.totalChecklists}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 leading-none">Progres</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-900 font-mono tracking-tighter leading-none">{stats.scannedItems} <span className="text-sm text-slate-200">/ {stats.totalItems}</span></span>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(11,174,74,0.5)]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right section - Actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={cn(
                    "w-11 h-11 rounded-2xl transition-all border",
                    showNotifications ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
                  )}
                >
                  <Bell size={18} strokeWidth={2.5} />
                </Button>
                {getTotalNotifications() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-bold rounded-lg h-5 w-5 flex items-center justify-center shadow-lg border-2 border-white">
                    {getTotalNotifications()}
                  </span>
                )}
              </div>

              {/* Stats Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStats(!showStats)}
                className={cn(
                  "w-11 h-11 rounded-2xl transition-all border",
                  showStats ? "bg-slate-900 text-white border-slate-900 shadow-xl" : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
                )}
              >
                <BarChart3 size={18} strokeWidth={2.5} />
              </Button>

              <div className="h-10 w-px bg-slate-100 mx-2" />

              {/* Add New Workspace Button */}
              <Button
                onClick={() => setShowCustomerModal(true)}
                className="h-11 px-6 rounded-2xl bg-primary hover:bg-[#047857] text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 flex items-center gap-3 active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" strokeWidth={3} />
                Yangi Terminal
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Panel with Animation */}
      {showStats && (
        <div className="flex-shrink-0 animate-in slide-in-from-top-12 duration-500">
          <WorkspaceStats />
        </div>
      )}

      {/* Multi-Tab Switcher Area */}
      {workspaceTabs.length > 0 && (
        <div className="flex-shrink-0 border-b border-border bg-background">
          <WorkspaceTabs />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex bg-background/50">
        {/* Workspace Content View */}
        <div className="flex-1 min-h-0 relative">
          {activeWorkspace ? (
            <div className="h-full animate-in fade-in zoom-in-95 duration-700">
              <WorkspaceContent workspace={activeWorkspace} />
            </div>
          ) : workspaceTabs.length === 0 ? (
            <div className="h-full flex items-center justify-center p-12">
              <div className="text-center max-w-2xl bg-white/40 backdrop-blur-3xl p-16 rounded-[4rem] border border-white/50 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
                <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 group-hover:scale-110 transition-transform duration-700">
                  <Users className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-3xl font-black text-foreground uppercase tracking-tight mb-4">
                  Ish Stoli Bo'sh
                </h3>
                <p className="text-label-premium opacity-50 mb-12">
                  Bir nechta mijozlar bilan bir vaqtda ishlash, alohida checklistlar yaratish va yuklash jarayonlarini kuzatish uchun yangi mijoz qo'shing.
                </p>
                <div className="space-y-6">
                  <Button
                    onClick={() => setShowCustomerModal(true)}
                    className="h-16 px-12 rounded-3xl bg-primary hover:bg-green-700 text-white font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-primary/30 w-full"
                  >
                    <Plus className="h-5 w-5 mr-4" />
                    Birinchi Mijozni Tanlang
                  </Button>
                  <div className="flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-widest text-muted-foreground/30">
                    <span>Qisqa yo'l:</span>
                    <kbd className="px-2 py-1 bg-white rounded-lg border border-border shadow-sm">Ctrl + T</kbd>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center bg-white/20 backdrop-blur-lg p-12 rounded-[3rem] border border-white/30">
                <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">Workspace Tanlang</h3>
                <p className="text-label-premium opacity-40 uppercase tracking-widest">
                  Chapdan yoki yuqoridan faol workspace'ni tanlang
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Sidebars (Notifications, Settings etc) */}
        {showNotifications && (
          <div className="w-[380px] border-l border-border bg-white/40 backdrop-blur-2xl animate-in slide-in-from-right-8 duration-500">
            <NotificationPanel />
          </div>
        )}
      </div>

      {/* Global Modals */}
      <CustomerSelectorModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
      />
    </div>
  );
}