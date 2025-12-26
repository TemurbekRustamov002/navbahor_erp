"use client";
import { useEffect } from "react";
import { useChecklistStore } from "@/stores/checklistStore";
import { useBackendToyStore } from "@/stores/backendToyStore";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { useBackendLabStore } from "@/stores/backendLabStore";
import { useBackendCustomerStore } from "@/stores/backendCustomerStore";

// This component preloads demo data for checklist functionality
export function ChecklistPreloader() {
  const { toys } = useBackendToyStore();
  const { markas } = useBackendMarkaStore();
  const { samples, addSampleLocal } = useBackendLabStore();
  const { customers } = useBackendCustomerStore();

  useEffect(() => {
    // Add demo data if empty
    if (toys.length === 0) {
      // Create demo toys
      const demoToys = [
        {
          id: "toy-demo-1",
          markaId: "marka-demo-1",
          brutto: 223.5,
          tara: 3.5,
          netto: 220.0,
          scaleModel: "JADEVER-JWI-3000W",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          orderNo: 1,
          operatorId: "operator-1",
          productType: "tola",
          reserved: false,
          sold: false
        },
        {
          id: "toy-demo-2",
          markaId: "marka-demo-1",
          brutto: 225.2,
          tara: 3.5,
          netto: 221.7,
          scaleModel: "JADEVER-JWI-3000W",
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          orderNo: 2,
          operatorId: "operator-1",
          productType: "tola",
          reserved: false,
          sold: false
        },
        {
          id: "toy-demo-3",
          markaId: "marka-demo-2",
          brutto: 224.8,
          tara: 3.5,
          netto: 221.3,
          scaleModel: "JADEVER-JWI-3000W",
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          orderNo: 3,
          operatorId: "operator-2",
          productType: "lint",
          reserved: false,
          sold: false
        }
      ];

      // demoToys.forEach(toy => addToy(toy));
    }

    if (markas.length === 0) {
      // Create demo markas
      const demoMarkas = [
        {
          id: "marka-demo-1",
          productType: "tola" as const,
          sex: "valikli" as const,
          number: 101,
          ptm: "S-6524",
          selection: "C-6524",
          pickingType: "qol" as const,
          capacity: 220,
          used: 50,
          showOnScale: true,
          status: "active" as const,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "marka-demo-2",
          productType: "lint" as const,
          number: 102,
          ptm: "L-3421",
          selection: "L-3421",
          pickingType: "mashina" as const,
          capacity: 220,
          used: 75,
          showOnScale: true,
          status: "active" as const,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      // demoMarkas.forEach(marka => addMarka(marka));
    }

    if (samples.length === 0) {
      // Create demo lab samples
      const demoSamples = [
        {
          id: "lab-demo-1",
          sourceType: "toy" as const,
          sourceId: "toy-demo-1",
          productType: "tola" as const,
          markaId: "marka-demo-1",
          markaLabel: "101 - S-6524",
          moisture: 8.5,
          trash: 2.1,
          navi: 3,
          grade: "Oliy",
          strength: 28.5,
          lengthMm: 32.0,
          comment: "Sifat juda yaxshi",
          status: "approved" as const,
          showToSales: true,
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          analyst: "lab-analyst-1",
          approver: "lab-supervisor"
        },
        {
          id: "lab-demo-2",
          sourceType: "toy" as const,
          sourceId: "toy-demo-2",
          productType: "tola" as const,
          markaId: "marka-demo-1",
          markaLabel: "101 - S-6524",
          moisture: 8.2,
          trash: 2.3,
          navi: 3,
          grade: "YAXSHI",
          strength: 27.8,
          lengthMm: 31.5,
          comment: "Standart sifat",
          status: "approved" as const,
          showToSales: true,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          analyst: "lab-analyst-1",
          approver: "lab-supervisor"
        },
        {
          id: "lab-demo-3",
          sourceType: "toy" as const,
          sourceId: "toy-demo-3",
          productType: "lint" as const,
          markaId: "marka-demo-2",
          markaLabel: "102 - L-3421",
          moisture: 7.8,
          trash: 1.9,
          navi: 4,
          grade: "Oliy",
          strength: 30.2,
          lengthMm: 33.5,
          comment: "A'lo sifat",
          status: "approved" as const,
          showToSales: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          analyst: "lab-analyst-2",
          approver: "lab-supervisor"
        }
      ];

      // demoSamples.forEach(sample => addSampleLocal(sample));
    }

    if (customers.length === 0) {
      // Create demo customers
      const demoCustomers = [
        {
          id: "customer-demo-1",
          name: "Andijon Tekstil LLC",
          contact: "+998901234567",
          address: "Andijon shahar, Tekstil ko'chasi 15",
          type: "manufacturer"
        },
        {
          id: "customer-demo-2",
          name: "O'zbekiston Paxta Eksport",
          contact: "+998907654321",
          address: "Toshkent shahar, Paxta ko'chasi 28",
          type: "exporter"
        },
        {
          id: "customer-demo-3",
          name: "Namangan Tola Zavodi",
          contact: "+998909876543",
          address: "Namangan shahar, Sanoat ko'chasi 42",
          type: "manufacturer"
        }
      ];

      // demoCustomers.forEach(customer => addCustomer(customer));
    }
  }, [toys.length, markas.length, samples.length, customers.length]);

  return null; // This component only preloads data
}