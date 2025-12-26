"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useMultiWarehouseStore } from "@/stores/multiWarehouseStore";

interface ScannedItem {
  id: string;
  code: string;
  name: string;
  quantity: number;
  location: string;
  scannedAt: string;
}

interface ScannerInterfaceMultiProps {
  workspaceId: string;
  onItemScanned?: (item: ScannedItem) => void;
}

export function ScannerInterfaceMulti({ workspaceId, onItemScanned }: ScannerInterfaceMultiProps) {
  const { workspaceTabs, customerWorkspaces } = useMultiWarehouseStore();
  const [scanInput, setScanInput] = useState("");
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScannedItem[]>([]);
  const [scanMode, setScanMode] = useState<"single" | "batch">("single");

  const workspace = workspaceTabs?.find(w => w.id === workspaceId);
  const workspaceData = customerWorkspaces?.[workspaceId];

  useEffect(() => {
    loadScanHistory();
  }, [workspace]);

  const loadScanHistory = async () => {
    try {
      // Mock data - replace with actual API call
      setScanHistory([
        {
          id: "1",
          code: "TOY001",
          name: "O'yinchoq Robot",
          quantity: 5,
          location: workspace?.customerName || "",
          scannedAt: new Date().toISOString()
        },
        {
          id: "2",
          code: "TOY002", 
          name: "Mashina o'yinchoq",
          quantity: 3,
          location: workspace?.customerName || "",
          scannedAt: new Date(Date.now() - 3600000).toISOString()
        }
      ]);
    } catch (error) {
      console.error("Skan tarixini yuklashda xato:", error);
    }
  };

  const handleScan = async () => {
    if (!scanInput.trim()) return;

    setIsScanning(true);
    try {
      // Mock scanning - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newItem: ScannedItem = {
        id: Date.now().toString(),
        code: scanInput.toUpperCase(),
        name: `Mahsulot ${scanInput}`,
        quantity: Math.floor(Math.random() * 10) + 1,
        location: workspace?.customerName || "",
        scannedAt: new Date().toISOString()
      };

      if (scanMode === "single") {
        setScannedItems([newItem]);
      } else {
        setScannedItems(prev => [...prev, newItem]);
      }

      setScanHistory(prev => [newItem, ...prev]);
      setScanInput("");
      
      if (onItemScanned) {
        onItemScanned(newItem);
      }
    } catch (error) {
      console.error("Skanlashda xato:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleScan();
    }
  };

  const clearScannedItems = () => {
    setScannedItems([]);
  };

  const removeScannedItem = (itemId: string) => {
    setScannedItems(prev => prev.filter(item => item.id !== itemId));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Skaner interfeysi - {workspace?.customerName}
        </h3>

        {/* Scan Mode Selection */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={scanMode === "single" ? "default" : "outline"}
            onClick={() => setScanMode("single")}
            size="sm"
          >
            Yakka skan
          </Button>
          <Button
            variant={scanMode === "batch" ? "default" : "outline"}
            onClick={() => setScanMode("batch")}
            size="sm"
          >
            Ko'p skan
          </Button>
        </div>

        {/* Scanner Input */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <Input
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              onKeyPress={handleInputKeyPress}
              placeholder="Barcode yoki QR kodini skanling..."
              disabled={isScanning}
            />
          </div>
          <Button
            onClick={handleScan}
            disabled={!scanInput.trim() || isScanning}
          >
            {isScanning ? <LoadingSpinner size="sm" /> : "Skanlash"}
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600 mb-4">
          <p>• Barcode yoki QR kodni kamera bilan skanling</p>
          <p>• Yoki kodni qo'lda kiriting va Enter bosing</p>
          <p>• Yakka skan rejimida har safar yangi element o'rniga o'tkaziladi</p>
          <p>• Ko'p skan rejimida elementlar ro'yxatga qo'shiladi</p>
        </div>
      </Card>

      {/* Scanned Items */}
      {scannedItems.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Skan qilingan elementlar</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={clearScannedItems}
            >
              Tozalash
            </Button>
          </div>

          <div className="space-y-3">
            {scannedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-green-800">{item.name}</div>
                  <div className="text-sm text-green-600">
                    {item.code} • {item.quantity} ta • {item.location}
                  </div>
                  <div className="text-xs text-green-500">
                    {new Date(item.scannedAt).toLocaleString("uz-UZ")}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => removeScannedItem(item.id)}
                >
                  O'chirish
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Scan History */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Skan tarixi</h4>
        
        {scanHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Hozircha skan tarixi yo'q
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {scanHistory.map((item) => (
              <div
                key={`${item.id}-${item.scannedAt}`}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-600">
                    {item.code} • {item.quantity} ta
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    {new Date(item.scannedAt).toLocaleString("uz-UZ")}
                  </div>
                  <div className="text-xs text-gray-500">{item.location}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}