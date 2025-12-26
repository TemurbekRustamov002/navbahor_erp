"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { Button } from "./Button";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: "border-emerald-100 bg-emerald-50/80 text-emerald-900 shadow-xl shadow-emerald-500/10",
  error: "border-rose-100 bg-rose-50/80 text-rose-900 shadow-xl shadow-rose-500/10",
  warning: "border-amber-100 bg-amber-50/80 text-amber-900 shadow-xl shadow-amber-500/10",
  info: "border-primary/10 bg-white/80 text-foreground shadow-xl shadow-primary/10",
};

export function Toast({ id, type, title, message, duration = 5000, onClose, action }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = toastIcons[type];

  useEffect(() => {
    setIsVisible(true);

    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 200);
  };

  const toastContent = (
    <div
      className={cn(
        "fixed top-8 right-8 z-[100] w-full max-w-[400px] transform transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)",
        isVisible ? "translate-x-0 opacity-100 scale-100" : "translate-x-12 opacity-0 scale-95"
      )}
      role="alert"
      aria-live="polite"
    >
      <div
        className={cn(
          "flex items-center p-6 rounded-[2rem] border-2 backdrop-blur-xl",
          toastStyles[type]
        )}
      >
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg mr-4 rotate-3 group-hover:rotate-0 transition-transform",
          {
            'bg-emerald-500 text-white': type === 'success',
            'bg-rose-500 text-white': type === 'error',
            'bg-amber-500 text-white': type === 'warning',
            'bg-primary text-white': type === 'info',
          }
        )}>
          <Icon size={24} />
        </div>

        <div className="flex-1 min-w-0 pr-4">
          {title && (
            <h4 className="text-sm font-black uppercase tracking-tight mb-1">{title}</h4>
          )}
          <p className="text-[11px] font-black uppercase tracking-tight opacity-70 leading-relaxed">{message}</p>
          {action && (
            <div className="mt-4">
              <Button
                variant="default"
                size="sm"
                onClick={action.onClick}
                className="text-[9px] h-10 px-6 rounded-xl bg-white text-foreground hover:bg-foreground hover:text-white font-black uppercase tracking-widest transition-all"
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="h-10 w-10 p-0 rounded-xl hover:bg-black/5 transition-all text-muted-foreground/40 hover:text-foreground"
          aria-label="Yopish"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );

  return typeof window !== 'undefined'
    ? createPortal(toastContent, document.body)
    : null;
}

// Toast manager hook
interface ToastData {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const toast = {
    success: (message: string, options?: Partial<Omit<ToastData, 'id' | 'type' | 'message'>>) =>
      addToast({ type: 'success', message, ...options }),
    error: (message: string, options?: Partial<Omit<ToastData, 'id' | 'type' | 'message'>>) =>
      addToast({ type: 'error', message, ...options }),
    warning: (message: string, options?: Partial<Omit<ToastData, 'id' | 'type' | 'message'>>) =>
      addToast({ type: 'warning', message, ...options }),
    info: (message: string, options?: Partial<Omit<ToastData, 'id' | 'type' | 'message'>>) =>
      addToast({ type: 'info', message, ...options }),
  };

  const ToastContainer = () => (
    <>
      {toasts.map(toastData => (
        <Toast
          key={toastData.id}
          {...toastData}
          onClose={removeToast}
        />
      ))}
    </>
  );

  return { toast, ToastContainer };
}