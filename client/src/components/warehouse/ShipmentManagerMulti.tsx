"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useMultiWarehouseStore } from "@/stores/multiWarehouseStore";

interface ShipmentItem {
  id: string;
  toyId: string;
  toyName: string;
  toyCode: string;
  quantity: number;
  unitPrice: number;
}

interface Shipment {
  id: string;
  shipmentNumber: string;
  customerId: string;
  customerName: string;
  status: "pending" | "preparing" | "ready" | "shipped" | "delivered";
  items: ShipmentItem[];
  totalAmount: number;
  createdAt: string;
  shippedAt?: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

interface ShipmentManagerMultiProps {
  workspaceId: string;
}

export function ShipmentManagerMulti({ workspaceId }: ShipmentManagerMultiProps) {
  const { workspaceTabs, customerWorkspaces } = useMultiWarehouseStore();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const workspace = workspaceTabs?.find(w => w.id === workspaceId);
  const workspaceData = customerWorkspaces?.[workspaceId];

  useEffect(() => {
    if (workspace) {
      loadShipments();
    }
  }, [workspace]);

  const loadShipments = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API call
      setShipments([
        {
          id: "1",
          shipmentNumber: "SHP-001",
          customerId: "cust1",
          customerName: "Aziz Karimov",
          status: "preparing",
          items: [
            {
              id: "item1",
              toyId: "toy1",
              toyName: "Robot o'yinchoq",
              toyCode: "TOY001",
              quantity: 5,
              unitPrice: 50000
            }
          ],
          totalAmount: 250000,
          createdAt: new Date().toISOString(),
          estimatedDelivery: new Date(Date.now() + 86400000 * 3).toISOString()
        },
        {
          id: "2",
          shipmentNumber: "SHP-002", 
          customerId: "cust2",
          customerName: "Madina Toshmatova",
          status: "ready",
          items: [
            {
              id: "item2",
              toyId: "toy2",
              toyName: "Mashina o'yinchoq",
              toyCode: "TOY002",
              quantity: 3,
              unitPrice: 75000
            }
          ],
          totalAmount: 225000,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          estimatedDelivery: new Date(Date.now() + 86400000 * 2).toISOString()
        }
      ]);
    } catch (error) {
      console.error("Yuboruvlarni yuklashda xato:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Kutilmoqda";
      case "preparing": return "Tayyorlanmoqda";
      case "ready": return "Tayyor";
      case "shipped": return "Yuborildi";
      case "delivered": return "Yetkazildi";
      default: return "Noma'lum";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "preparing": return "bg-blue-100 text-blue-800";
      case "ready": return "bg-green-100 text-green-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleUpdateStatus = async (shipmentId: string, newStatus: string) => {
    setShipments(prev =>
      prev.map(shipment =>
        shipment.id === shipmentId
          ? { 
              ...shipment, 
              status: newStatus as any,
              shippedAt: newStatus === "shipped" ? new Date().toISOString() : shipment.shippedAt
            }
          : shipment
      )
    );
  };

  const handleViewDetails = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setShowDetailsModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <LoadingSpinner />
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Yuboruv boshqaruvi - {workspace?.customerName}
          </h3>
          <Button onClick={() => setShowCreateModal(true)}>
            Yangi yuboruv yaratish
          </Button>
        </div>

        <div className="space-y-4">
          {shipments.map((shipment) => (
            <div
              key={shipment.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{shipment.shipmentNumber}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(shipment.status)}`}>
                      {getStatusText(shipment.status)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <div>Mijoz: {shipment.customerName}</div>
                    <div>Mahsulotlar: {shipment.items.length} ta</div>
                    <div>Umumiy summa: {formatCurrency(shipment.totalAmount)}</div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Yaratildi: {new Date(shipment.createdAt).toLocaleString("uz-UZ")}
                    {shipment.estimatedDelivery && (
                      <span className="ml-4">
                        Yetkazish: {new Date(shipment.estimatedDelivery).toLocaleDateString("uz-UZ")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(shipment)}
                  >
                    Batafsil
                  </Button>
                  
                  {shipment.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(shipment.id, "preparing")}
                    >
                      Tayyorlashni boshlash
                    </Button>
                  )}
                  
                  {shipment.status === "preparing" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(shipment.id, "ready")}
                    >
                      Tayyor deb belgilash
                    </Button>
                  )}
                  
                  {shipment.status === "ready" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(shipment.id, "shipped")}
                    >
                      Yuborish
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {shipments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Hozircha yuboruvlar yo'q
          </div>
        )}
      </Card>

      {/* Shipment Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`Yuboruv tafsilotlari - ${selectedShipment?.shipmentNumber}`}
      >
        {selectedShipment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mijoz</label>
                <p>{selectedShipment.customerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Holat</label>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedShipment.status)}`}>
                  {getStatusText(selectedShipment.status)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mahsulotlar</label>
              <div className="space-y-2">
                {selectedShipment.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <div className="font-medium">{item.toyName}</div>
                      <div className="text-sm text-gray-600">{item.toyCode}</div>
                    </div>
                    <div className="text-right">
                      <div>{item.quantity} ta</div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(item.unitPrice)} / ta
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center font-semibold">
                <span>Umumiy summa:</span>
                <span>{formatCurrency(selectedShipment.totalAmount)}</span>
              </div>
            </div>

            {selectedShipment.trackingNumber && (
              <div>
                <label className="block text-sm font-medium mb-1">Kuzatuv raqami</label>
                <p className="font-mono">{selectedShipment.trackingNumber}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Shipment Modal - Placeholder */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Yangi yuboruv yaratish"
      >
        <div className="text-center py-8">
          <p className="text-gray-500">
            Yangi yuboruv yaratish funksiyasi ishlab chiqilmoqda...
          </p>
        </div>
      </Modal>
    </>
  );
}