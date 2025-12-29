"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/Toast";

const CLEANER_VERSION = "v1.3-production-ready";

export function SystemCleaner() {
    const { toast } = useToast();
    const ranOnce = useRef(false);

    useEffect(() => {
        if (ranOnce.current) return;

        const currentVersion = localStorage.getItem("navbahor-system-version");

        if (currentVersion !== CLEANER_VERSION) {
            console.log("System version mismatch. Cleaning legacy storage...");

            // List of keys to clear (Add any potential legacy keys)
            const keysToClear = [
                "navbahor-checklist-storage",
                "navbahor-toy-storage",
                "navbahor-marka-storage",
                "navbahor-lab-storage",
                "navbahor-customer-storage",
                "navbahor-warehouse-storage",
                "navbahor-admin-storage",
                "navbahor-audit-storage",
                "multi-warehouse-store",
                "navbahor-storage",
                "zustand-store",
                "recent-scales",
                "toy-storage",
                "marka-storage",
                "lab-storage",
                "customer-storage",
                "warehouse-storage"
            ];

            let clearedCount = 0;
            keysToClear.forEach(key => {
                if (localStorage.getItem(key)) {
                    localStorage.removeItem(key);
                    clearedCount++;
                }
            });

            // Clear specific legacy items if they exist as raw JSON
            if (localStorage.getItem("markas")) localStorage.removeItem("markas");
            if (localStorage.getItem("toys")) localStorage.removeItem("toys");

            localStorage.setItem("navbahor-system-version", CLEANER_VERSION);

            if (clearedCount > 0) {
                toast.info("Tizim yangilandi va eski ma'lumotlar tozalandi.");
                // Optional: reload to ensure clean state
                // window.location.reload();
            }

            console.log(`System cleaned. Removed ${clearedCount} legacy keys.`);
        }

        ranOnce.current = true;
    }, [toast]);

    return null;
}
