"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useMultiWarehouseStore } from "@/stores/multiWarehouseStore";

interface ToysByBrandsMultiProps {
  workspaceId: string;
  onToySelect?: (toy: any) => void;
}

export function ToysByBrandsMulti({ workspaceId, onToySelect }: ToysByBrandsMultiProps) {
  const { workspaceTabs, customerWorkspaces } = useMultiWarehouseStore();
  const [toys, setToys] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const workspace = workspaceTabs?.find(w => w.id === workspaceId);
  const workspaceData = customerWorkspaces?.[workspaceId];

  useEffect(() => {
    if (workspace) {
      loadBrands();
    }
  }, [workspace]);

  useEffect(() => {
    if (selectedBrand) {
      loadToysByBrand();
    }
  }, [selectedBrand, workspace]);

  const loadBrands = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API call
      setBrands([
        { id: "1", name: "Marka A", toyCount: 25 },
        { id: "2", name: "Marka B", toyCount: 18 },
        { id: "3", name: "Marka C", toyCount: 32 }
      ]);
    } catch (error) {
      console.error("Markalarni yuklashda xato:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadToysByBrand = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API call
      setToys([
        {
          id: "1",
          name: "O'yinchoq 1",
          code: "TOY001",
          brand: selectedBrand,
          quantity: 15,
          location: workspace?.customerName || ""
        },
        {
          id: "2", 
          name: "O'yinchoq 2",
          code: "TOY002",
          brand: selectedBrand,
          quantity: 8,
          location: workspace?.customerName || ""
        }
      ]);
    } catch (error) {
      console.error("O'yinchoqlarni yuklashda xato:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <LoadingSpinner />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        Markalar bo'yicha o'yinchoqlar - {workspace?.customerName}
      </h3>

      <div className="space-y-4">
        {/* Brand Selection */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {brands.map((brand) => (
            <Button
              key={brand.id}
              variant={selectedBrand === brand.id ? "default" : "outline"}
              className="p-3 text-left"
              onClick={() => setSelectedBrand(brand.id)}
            >
              <div>
                <div className="font-medium">{brand.name}</div>
                <div className="text-xs opacity-70">{brand.toyCount} ta</div>
              </div>
            </Button>
          ))}
        </div>

        {/* Toys List */}
        {selectedBrand && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">O'yinchoqlar</h4>
            <div className="space-y-2">
              {toys.map((toy) => (
                <div
                  key={toy.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-medium">{toy.name}</div>
                    <div className="text-sm text-gray-600">{toy.code}</div>
                  </div>
                  <div className="text-right mr-4">
                    <div className="font-medium">{toy.quantity} ta</div>
                    <div className="text-xs text-gray-500">{toy.location}</div>
                  </div>
                  {onToySelect && (
                    <Button
                      size="sm"
                      onClick={() => onToySelect(toy)}
                    >
                      Tanlash
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedBrand && toys.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Bu marka uchun o'yinchoqlar topilmadi
          </div>
        )}
      </div>
    </Card>
  );
}