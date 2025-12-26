"use client";
import { simpleApiClient } from "../apiClient";

export interface PrinterStatusResponse {
  mode: "network" | "serial";
  reachable: boolean;
  message: string;
}

class PrintingService {
  async getStatus(): Promise<PrinterStatusResponse> {
    return await simpleApiClient.get<PrinterStatusResponse>(`/printing/status`);
  }
}

export const printingService = new PrintingService();
