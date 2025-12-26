"use client";
import { useEffect, useState } from "react";
import { printingService, type PrinterStatusResponse } from "@/lib/services/printing.service";

export function PrinterStatus({ pollMs = 15000 }: { pollMs?: number }) {
  const [status, setStatus] = useState<PrinterStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await printingService.getStatus();
      setStatus(res);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Printer status error");
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const t = setInterval(fetchStatus, pollMs);
    return () => clearInterval(t);
  }, [pollMs]);

  if (loading) {
    return (
      <div className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Printerna tekshirilmoqda...</div>
    );
  }

  if (error) {
    return (
      <div className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-800">Printer: xatolik</div>
    );
  }

  if (!status) {
    return (
      <div className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-800">Printer: noma'lum</div>
    );
  }

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-medium ${status.reachable ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
      {status.reachable ? 'Printer ulangan' : 'Printer uzilgan'} · {status.mode} · {status.message}
    </div>
  );
}
