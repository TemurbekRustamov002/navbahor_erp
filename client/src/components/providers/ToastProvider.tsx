"use client";
import { useToast } from "@/components/ui/Toast";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { ToastContainer } = useToast();
  
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}