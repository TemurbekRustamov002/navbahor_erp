"use client";
import { useMultiWarehouseStore } from "@/stores/multiWarehouseStore";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  AlertCircle,
  Clock,
  Trash2
} from "lucide-react";

export function NotificationPanel() {
  const {
    workspaceTabs,
    customerWorkspaces,
    markNotificationRead,
    clearNotifications,
    setActiveTab
  } = useMultiWarehouseStore();

  // Get all notifications across workspaces
  const allNotifications = workspaceTabs.flatMap(tab => {
    const workspace = customerWorkspaces[tab.id];
    return workspace?.notifications.map(notification => ({
      ...notification,
      customerName: tab.customerName,
      tabId: tab.id
    })) || [];
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const unreadNotifications = allNotifications.filter(n => !n.read);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <div className="p-2 bg-emerald-50 rounded-xl"><CheckCircle className="h-4 w-4 text-emerald-600" /></div>;
      case 'warning': return <div className="p-2 bg-amber-50 rounded-xl"><AlertTriangle className="h-4 w-4 text-amber-600" /></div>;
      case 'error': return <div className="p-2 bg-rose-50 rounded-xl"><AlertCircle className="h-4 w-4 text-rose-600" /></div>;
      case 'info':
      default: return <div className="p-2 bg-blue-50 rounded-xl"><Info className="h-4 w-4 text-blue-600" /></div>;
    }
  };

  const getNotificationStyles = (type: string, read: boolean) => {
    if (read) return "bg-white/40 border-border opacity-60";

    switch (type) {
      case 'success': return "bg-emerald-50/50 border-emerald-100 shadow-xl shadow-emerald-500/5";
      case 'warning': return "bg-amber-50/50 border-amber-100 shadow-xl shadow-amber-500/5";
      case 'error': return "bg-rose-50/50 border-rose-100 shadow-xl shadow-rose-500/5";
      default: return "bg-blue-50/50 border-blue-100 shadow-xl shadow-blue-500/5";
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markNotificationRead(notification.id);
    }

    // Switch to the workspace that generated this notification
    setActiveTab(notification.tabId);
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Hozir';
    if (minutes < 60) return `${minutes} daqiqa oldin`;
    if (hours < 24) return `${hours} soat oldin`;
    return `${days} kun oldin`;
  };

  return (
    <div className="h-full flex flex-col bg-white/40 backdrop-blur-3xl">
      {/* Header */}
      <div className="flex-shrink-0 p-8 border-b border-border bg-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-foreground text-white flex items-center justify-center shadow-xl">
              <Bell size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Xabarnoma</h3>
              {unreadNotifications.length > 0 && (
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">
                  {unreadNotifications.length} ta o'qilmagan
                </div>
              )}
            </div>
          </div>

          {allNotifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                workspaceTabs.forEach(tab => {
                  clearNotifications(tab.id);
                });
              }}
              className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-destructive hover:text-white transition-all"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Tozalash
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-6">
        {allNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-30 group">
            <div className="w-24 h-24 bg-secondary rounded-[2.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-700">
              <Bell size={48} className="text-muted-foreground" />
            </div>
            <h4 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">Hozircha Jimjitlik</h4>
            <p className="text-label-premium">
              Hech qanday yangi bildirishnoma mavjud emas
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {allNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "relative p-5 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]",
                  getNotificationStyles(notification.type, notification.read)
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className={cn(
                        "text-sm font-black uppercase tracking-tight truncate",
                        notification.read ? "text-muted-foreground" : "text-foreground"
                      )}>
                        {notification.title}
                      </h5>
                      {!notification.read && (
                        <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_8px_rgba(11,174,74,0.5)] animate-pulse" />
                      )}
                    </div>

                    <p className={cn(
                      "text-[11px] leading-relaxed",
                      notification.read ? "text-muted-foreground/60" : "text-foreground/70"
                    )}>
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-border/10">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                        {notification.customerName}
                      </span>
                      <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(notification.timestamp)}</span>
                      </div>
                    </div>

                    {notification.action && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          notification.action?.onClick();
                        }}
                        className="mt-4 w-full h-10 rounded-xl bg-white text-foreground hover:bg-foreground hover:text-white font-black uppercase tracking-widest text-[9px] shadow-sm transition-all"
                      >
                        {notification.action.label}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {allNotifications.length > 0 && (
        <div className="flex-shrink-0 border-t border-border bg-white/20 p-6">
          <div className="text-[9px] font-black text-muted-foreground/30 text-center uppercase tracking-[0.2em]">
            Batafsil ko'rish uchun workspace'ga bosing
          </div>
        </div>
      )}
    </div>
  );
}