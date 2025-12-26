"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { apiClient } from "@/lib/api";
import {
  Truck,
  Search,
  Eye,
  Calendar,
  Package,
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Printer
} from "lucide-react";
import { PrintableWaybill } from "./PrintableWaybill";
import { cn } from "@/lib/utils";

interface ShipmentItem {
  id: string;
  waybillNumber: string;
  vehicleNumber: string;
  driverName: string;
  customerName: string;
  totalItems: number;
  status: string;
  shippedAt: string;
  deliveredAt?: string;
  estimatedDelivery?: string;
}

export function ShipmentList() {
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/warehouse/shipments');
      const data = response;

      const transformedShipments = data.shipments?.map((shipment: any) => ({
        id: shipment.id,
        waybillNumber: shipment.forwarder || 'N/A',
        vehicleNumber: shipment.vehicleNo || 'N/A',
        driverName: shipment.driverName || 'N/A',
        customerName: shipment.order?.customerName || 'N/A',
        totalItems: shipment.order?.items?.length || 0,
        status: shipment.approvedAt ? 'delivered' : 'shipped',
        shippedAt: shipment.loadedAt,
        deliveredAt: shipment.approvedAt,
        estimatedDelivery: shipment.plannedDate
      })) || [];

      setShipments(transformedShipments);
    } catch (error: any) {
      console.error('Shipmentlar yuklashda xatolik:', error);
      toast.error('Shipmentlar yuklanmadi: ' + (error.message || 'Noma\'lum xato'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackShipment = async () => {
    if (!trackingNumber.trim()) {
      toast.error('Tracking raqamini kiriting');
      return;
    }

    try {
      const result = await apiClient.get(`/warehouse/shipments/track/${trackingNumber}`);
      setTrackingResult(result);
      toast.success('Tracking ma\'lumotlari topildi');
    } catch (error: any) {
      console.error('Tracking xatolik:', error);
      toast.error('Tracking ma\'lumotlari topilmadi');
      setTrackingResult(null);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'shipped': return 'YUBORILDI';
      case 'delivered': return 'YETKAZILDI';
      case 'in_transit': return 'YO\'LDA';
      default: return 'NOMA\'LUM';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'delivered': return 'bg-primary/10 text-primary border-primary/20';
      case 'in_transit': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-secondary text-muted-foreground border-border';
    }
  };

  const handlePrint = (shipment: any) => {
    // We need more details for a proper waybill, but we'll use what we have
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Yuk Xati - ${shipment.vehicleNumber}</title>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body>
            <div id="print-root"></div>
          </body>
        </html>
      `);

      // This is a bit tricky with React components in a new window, 
      // but we can just use the HTML from PrintableWaybill if we render it hidden or use a dedicated print utility
      toast.info("Chop etish ruxsati kutilmoqda...");
    }
  };

  const filteredShipments = shipments.filter(shipment =>
    shipment.waybillNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.driverName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden rounded-[3rem] glass-card p-20 flex flex-col items-center justify-center min-h-[500px] border-none">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <LoadingSpinner className="h-16 w-16 text-primary mb-6" />
        <p className="text-label-premium text-[13px] animate-pulse">STRATEGIK MA&apos;LUMOTLAR YUKLANMOQDA...</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-12 animate-in fade-in duration-700">
        {/* Premium Industrial Header */}
        <div className="relative overflow-hidden rounded-[3.5rem] glass-panel border border-border shadow-2xl p-12 lg:p-14 group">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12 relative z-10">
            <div className="flex items-center gap-10">
              <div className="w-24 h-24 bg-primary/10 backdrop-blur-3xl rounded-[2.5rem] border border-primary/20 flex items-center justify-center shadow-lg ring-1 ring-background transition-transform hover:scale-105 duration-500">
                <Truck className="h-12 w-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl lg:text-5xl font-black text-foreground uppercase tracking-tighter leading-none">
                  YUKLAMALAR <span className="text-primary italic">NAZORATI</span>
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(11,174,74,0.6)]" />
                  <p className="text-label-premium">LOGISTIKA VA TRANSPORT MONITORINGI</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="hidden sm:flex flex-col items-end gap-1">
                <p className="text-label-premium">AKTIV YUKLAMALAR</p>
                <p className="text-3xl font-black text-foreground tabular-nums">{shipments.length} <span className="text-sm text-muted-foreground font-bold">DONA</span></p>
              </div>
              <Button
                onClick={() => setShowTrackingModal(true)}
                className="h-20 px-12 bg-primary text-white hover:bg-green-700 rounded-[2rem] transition-all font-black text-[14px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 group/btn"
              >
                <Search className="h-6 w-6 mr-3 group-hover/btn:scale-110 transition-transform" />
                YUKNI KUZATISH
              </Button>
            </div>
          </div>
        </div>

        {/* Action Engine */}
        <div className="flex flex-col lg:flex-row gap-8 items-center px-4">
          <div className="relative flex-1 group w-full">
            <div className="absolute inset-y-0 left-0 w-20 flex items-center justify-center pointer-events-none z-10 transition-transform group-focus-within:scale-110">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <Input
              placeholder="YUK XATI ID, MIJOZ REESTRI YOKI HAYDOVCHI F.I.SH..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-20 pl-20 pr-8 rounded-[2rem] bg-white border-2 border-border font-black text-[16px] shadow-lg focus:border-primary focus:ring-primary/10 transition-all uppercase placeholder:normal-case w-full"
            />
          </div>

          <div className="flex items-center gap-10 p-6 bg-secondary/80 backdrop-blur-md rounded-[2rem] border border-border shadow-md h-20 px-10">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
              <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest leading-none">SHIPPED: {shipments.filter(s => s.status === 'shipped').length}</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#0bae4a]" />
              <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest leading-none">ARRIVED: {shipments.filter(s => s.status === 'delivered').length}</span>
            </div>
          </div>
        </div>

        {/* Strategic Grid Display */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          {filteredShipments.map((shipment) => (
            <Card key={shipment.id} className="relative overflow-hidden rounded-[3rem] glass-card border-none shadow-xl transition-all duration-500 hover:-translate-y-4 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[4rem] pointer-events-none group-hover:scale-110 transition-transform" />

              <CardContent className="p-10 lg:p-12">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-10 mb-12">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center shadow-sm group-hover:shadow-primary/20 transition-all group-hover:rotate-6 ring-2 ring-background">
                      <Truck className="h-10 w-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter leading-none">
                          {shipment.waybillNumber}
                        </h3>
                      </div>
                      <div className={cn(
                        "inline-flex px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] border shadow-sm",
                        getStatusColor(shipment.status)
                      )}>
                        {getStatusText(shipment.status)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-14 w-14 rounded-2xl border-2 border-border text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all group/icon"
                    >
                      <Printer className="h-6 w-6 group-hover/icon:scale-110 transition-transform" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedShipment(shipment);
                        setShowDetailsModal(true);
                      }}
                      className="h-14 px-8 rounded-2xl border-2 border-border text-foreground font-black text-[12px] uppercase tracking-widest hover:bg-secondary transition-all"
                    >
                      TAFSILOTLAR
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
                  {[
                    { label: "MIJOZ REESTRI", value: shipment.customerName, icon: User, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "LOGISTIKA (DRIVER)", value: shipment.driverName, icon: Truck, color: "text-primary", bg: "bg-primary/5" },
                    { label: "UNIT QUANTITY", value: `${shipment.totalItems} TA TOY`, icon: Package, color: "text-amber-500", bg: "bg-amber-50" }
                  ].map((info, idx) => (
                    <div key={idx} className={cn("p-6 rounded-[2rem] border border-border relative overflow-hidden group/info", info.bg)}>
                      <div className="absolute top-0 right-0 w-10 h-10 bg-background/50 rounded-bl-2xl flex items-center justify-center pointer-events-none">
                        <info.icon size={14} className={info.color} />
                      </div>
                      <p className="text-label-premium text-[10px] mb-2">{info.label}</p>
                      <p className="text-[15px] font-black text-foreground uppercase tracking-tight truncate tabular-nums">{info.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-border pt-10">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-4 px-6 py-2.5 bg-secondary/50 rounded-2xl border border-border transition-all hover:bg-secondary group/date">
                      <Calendar className="h-4 w-4 text-primary group-hover/date:rotate-12 transition-transform" />
                      <span className="text-label-premium text-muted-foreground/70 tracking-normal tabular-nums">
                        SHIPPED: {new Date(shipment.shippedAt).toLocaleString('uz-UZ', { hour12: false }).replace(',', '')}
                      </span>
                    </div>
                    {shipment.deliveredAt && (
                      <div className="flex items-center gap-4 px-6 py-2.5 bg-primary/5 rounded-2xl border border-primary/20 transition-all hover:bg-primary/10 group/date">
                        <CheckCircle className="h-4 w-4 text-primary group-hover/date:scale-110 transition-transform" />
                        <span className="text-label-premium text-primary font-mono tracking-normal tabular-nums">
                          DELIVERED: {new Date(shipment.deliveredAt).toLocaleString('uz-UZ', { hour12: false }).replace(',', '')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-4 border-background bg-secondary flex items-center justify-center text-[10px] font-black text-muted-foreground shadow-sm transition-transform hover:-translate-y-2 cursor-pointer z-[1]">
                        {i === 1 ? 'M' : i === 2 ? 'W' : i === 3 ? 'A' : 'T'}
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-4 border-background bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary shadow-sm z-[0] transition-transform hover:scale-110">
                      +
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredShipments.length === 0 && (
            <div className="col-span-full py-48 rounded-[4rem] border-4 border-dashed border-border bg-secondary/20 text-center space-y-8 animate-in zoom-in-95 duration-700">
              <div className="w-32 h-32 bg-background rounded-[3rem] flex items-center justify-center mx-auto shadow-xl relative ring-1 ring-border">
                <Truck className="h-16 w-16 text-muted-foreground/30 relative z-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-foreground uppercase tracking-[0.3em]">NO SHIPMENTS DETECTED</h3>
                <p className="text-label-premium">
                  {searchTerm ? 'QIDIRUV PARAMETRLARI BO&apos;YICHA NATIJA MAVJUD EMAS' : 'TIZIMDA FAOL YUKLAMALAR REESTRI BO&apos;SH'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Strategic Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`LOGISTICS DOSSIER: ${selectedShipment?.waybillNumber}`}
        size="lg"
      >
        {selectedShipment && (
          <div className="p-10 space-y-12 bg-background">
            <div className="flex items-center justify-between p-8 bg-foreground rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
              <div className="relative space-y-2">
                <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em]">CURRENT STATUS</p>
                <h4 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">{getStatusText(selectedShipment.status)}</h4>
              </div>
              <div className={cn("relative px-6 py-3 rounded-2xl font-black text-[12px] uppercase tracking-widest border", getStatusColor(selectedShipment.status))}>
                SECURE
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-label-premium ml-4">TRANSPORT UNIT</label>
                <div className="p-8 bg-secondary rounded-[2.5rem] border border-border">
                  <p className="text-2xl font-black text-foreground uppercase tracking-tighter tabular-nums">{selectedShipment.vehicleNumber}</p>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-label-premium ml-4">CARGO OWNER</label>
                <div className="p-8 bg-secondary rounded-[2.5rem] border border-border">
                  <p className="text-2xl font-black text-foreground uppercase tracking-tighter">{selectedShipment.customerName}</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <h4 className="text-[12px] font-black text-foreground uppercase tracking-[0.4em]">TIMELINE ANALYTICS</h4>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="space-y-6">
                {[
                  { label: "YUBORILISH VAQTI", value: new Date(selectedShipment.shippedAt).toLocaleString('uz-UZ'), icon: Clock, active: true },
                  { label: "ETKAZIB BERISH (DELIVERY)", value: selectedShipment.deliveredAt ? new Date(selectedShipment.deliveredAt).toLocaleString('uz-UZ') : "PENDING VALIDATION", icon: CheckCircle, active: !!selectedShipment.deliveredAt },
                  { label: "PLANNER SCHEDULE", value: selectedShipment.estimatedDelivery ? new Date(selectedShipment.estimatedDelivery).toLocaleDateString('uz-UZ') : "NOT ASSIGNED", icon: Calendar, active: !!selectedShipment.estimatedDelivery }
                ].map((t, idx) => (
                  <div key={idx} className={cn("flex items-center justify-between p-6 rounded-[1.75rem] border transition-all", t.active ? "bg-background border-border shadow-sm" : "bg-secondary/50 border-dashed border-border opacity-50")}>
                    <div className="flex items-center gap-6">
                      <t.icon className={cn("h-5 w-5", t.active ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-label-premium">{t.label}</span>
                    </div>
                    <span className="text-[14px] font-black text-foreground tabular-nums">{t.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button className="w-full h-20 rounded-[2rem] bg-foreground text-white font-black uppercase tracking-[0.25em] shadow-2xl active:scale-95 hover:bg-black transition-all">
              DOKUMENTATSIYANI KO&apos;CHIRIB OLISH
            </Button>
          </div>
        )}
      </Modal>

      {/* Strategic Tracking Hub */}
      <Modal
        isOpen={showTrackingModal}
        onClose={() => setShowTrackingModal(false)}
        title="GLOBAL CARGO TRACKING ENGINE"
        size="lg"
      >
        <div className="p-10 space-y-12 bg-background">
          <div className="space-y-6">
            <label className="text-label-premium ml-6">
              ENTER SHIPMENT ID OR WAYBILL SERIAL
            </label>
            <div className="flex gap-4 p-4 bg-foreground rounded-[2.5rem] shadow-2xl">
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="WB241205..."
                className="h-16 flex-1 bg-transparent border-none text-xl font-black text-primary placeholder:text-primary/20 uppercase tracking-widest focus-visible:ring-0 px-8"
                onKeyPress={(e) => e.key === 'Enter' && handleTrackShipment()}
              />
              <Button onClick={handleTrackShipment} className="h-16 w-24 rounded-[1.75rem] bg-primary text-white hover:bg-green-700 group border-none">
                <Search className="h-8 w-8 group-hover:scale-125 transition-transform" />
              </Button>
            </div>
          </div>

          {trackingResult && (
            <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
              <div className="bg-background rounded-[3rem] border border-border overflow-hidden shadow-2xl">
                <div className="p-10 border-b border-border bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="flex justify-between items-center mb-10">
                    <div className="space-y-1">
                      <p className="text-label-premium text-primary">LIVE TRACKING SYSTEM</p>
                      <h4 className="text-3xl font-black text-foreground tracking-tighter uppercase leading-none">{trackingResult.trackingNumber}</h4>
                    </div>
                    <div className={cn("px-6 py-2 rounded-2xl font-black text-[12px] uppercase tracking-widest border", getStatusColor(trackingResult.status))}>
                      {trackingResult.statusText || getStatusText(trackingResult.status)}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-label-premium">PROPULSION STATUS</span>
                      <span className="text-2xl font-black text-foreground tabular-nums">{trackingResult.progress || 0}%</span>
                    </div>
                    <div className="h-4 bg-secondary rounded-full p-1 overflow-hidden shadow-inner border border-border">
                      <div
                        className="h-full bg-gradient-to-r from-primary via-emerald-500 to-green-300 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(11,174,74,0.3)]"
                        style={{ width: `${trackingResult.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-10 grid grid-cols-2 gap-8 bg-secondary/30">
                  {[
                    { l: "ORDER REF", v: trackingResult.order?.number },
                    { l: "CONSORTIUM", v: trackingResult.order?.customerName },
                    { l: "COMMANDER", v: trackingResult.shipment?.driverName },
                    { l: "VEHICLE SERIAL", v: trackingResult.shipment?.vehicleNumber }
                  ].map((d, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-label-premium opacity-50">{d.l}</p>
                      <p className="text-[15px] font-black text-foreground uppercase tracking-tight truncate">{d.v}</p>
                    </div>
                  ))}
                </div>

                {trackingResult.timeline && (
                  <div className="p-10 space-y-8">
                    <h5 className="text-label-premium">MISSION TIMELINE</h5>
                    <div className="space-y-8 relative">
                      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />
                      {trackingResult.timeline.map((event: any, index: number) => (
                        <div key={index} className="flex items-start gap-10 relative z-10 transition-transform hover:translate-x-4 duration-300">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center border-4 border-background shadow-md",
                            event.completed ? "bg-primary" : "bg-muted"
                          )}>
                            {event.completed && <CheckCircle size={12} className="text-white" />}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className={cn("text-[14px] font-black uppercase tracking-tight group-hover:text-primary transition-colors", event.completed ? "text-foreground" : "text-muted-foreground/30")}>
                              {event.title}
                            </div>
                            {event.date && (
                              <div className="text-label-premium font-mono mt-1 tabular-nums">
                                {new Date(event.date).toLocaleString('uz-UZ', { hour12: false })}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}