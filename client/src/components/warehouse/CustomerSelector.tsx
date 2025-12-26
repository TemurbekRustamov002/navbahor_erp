"use client";
import { useState } from "react";
import { useWarehouseBackendStore } from '@/stores/warehouseBackendStore';
import { useBackendCustomerStore } from '@/stores/backendCustomerStore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { cn } from "@/lib/utils";
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Building,
  CheckCircle,
  User
} from "lucide-react";

export function CustomerSelector() {
  const { customers, createCustomer, addCustomer } = useBackendCustomerStore();
  const {
    selectedCustomer,
    setSelectedCustomer,
    createOrder,
    deleteOrder,
    currentOrder,
    currentChecklist,
    setCurrentStep,
    loading,
    error
  } = useWarehouseBackendStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showChangeCustomerConfirm, setShowChangeCustomerConfirm] = useState(false);
  const [isChangingCustomer, setIsChangingCustomer] = useState(false);

  // New customer form
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    region: ""
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(search.toLowerCase()) ||
    customer.legalName?.toLowerCase().includes(search.toLowerCase())
  );

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const handleSelectCustomer = async (customer: typeof customers[0]) => {
    try {
      setIsCreatingOrder(true);
      setSelectedCustomer(customer);

      // Create warehouse order for selected customer
      await createOrder(customer.id);

      toast.success(`${customer.name} uchun order yaratildi`);
    } catch (error: any) {
      toast.error(error.message || "Order yaratishda xatolik");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name.trim() || !newCustomer.company.trim()) {
      toast.error("Ism va kompaniya nomi majburiy");
      return;
    }

    try {
      const tempCustomer: any = {
        id: crypto.randomUUID(),
        name: newCustomer.name,
        legalName: newCustomer.company,
        contactName: newCustomer.name,
        contactEmail: newCustomer.email,
        contactPhone: newCustomer.phone,
        address: `${newCustomer.address}, ${newCustomer.city}, ${newCustomer.region}`,
        notes: `Company: ${newCustomer.company}`,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      addCustomer(tempCustomer);
      setSelectedCustomer(tempCustomer);

      try {
        await createCustomer({
          name: newCustomer.name,
          legalName: newCustomer.company,
          contactName: newCustomer.name,
          contactEmail: newCustomer.email,
          contactPhone: newCustomer.phone,
          address: `${newCustomer.address}, ${newCustomer.city}, ${newCustomer.region}`,
          notes: `Company: ${newCustomer.company}`,
          isActive: true
        });
      } catch (backendError) {
        console.log('⚠️ Backend sync failed, using local');
      }
    } catch (error) {
      toast.error("Mijoz yaratishda xatolik");
      return;
    }
    setNewCustomer({ name: "", company: "", email: "", phone: "", address: "", city: "", region: "" });
    setShowAddForm(false);
    toast.success("Yangi mijoz qo'shildi");
  };

  return (
    <div className="h-full p-8 lg:p-10 overflow-y-auto scrollbar-none bg-transparent">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        {/* Navbahor Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-none">Mijozni <span className="text-primary italic">Tanlash</span></h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">Logistika va jo&apos;natish uchun buyurtmachi</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative group min-w-[320px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" strokeWidth={2.5} />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Mijozni qidirish..."
                className="pl-12 h-12 rounded-xl bg-white/50 border-slate-100 focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-[11px] uppercase tracking-wider placeholder:normal-case placeholder:font-medium placeholder:text-slate-300 shadow-inner"
              />
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="h-12 px-8 rounded-xl bg-primary text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#047857] shadow-xl shadow-primary/20 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" strokeWidth={3} />
              Yangi Mijoz
            </Button>
          </div>
        </div>

        {/* Selected Customer Highlight - Premium Glass Card */}
        {selectedCustomer && (
          <div className="relative group animate-in zoom-in-95 duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-emerald-400/5 blur-[40px] opacity-40 rounded-[2.5rem]"></div>
            <div className="relative bg-white/60 backdrop-blur-md border border-white/60 p-8 flex flex-col md:flex-row items-center justify-between gap-8 rounded-[2rem] shadow-xl shadow-primary/5">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-lg border border-slate-50 text-primary flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
                  <Building size={24} strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight uppercase leading-none">{selectedCustomer.name}</h3>
                    <div className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-widest border border-primary/20">Aktiv</div>
                  </div>
                  <p className="text-primary font-bold uppercase tracking-[0.2em] text-[10px]">{selectedCustomer.legalName}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => currentOrder ? setShowChangeCustomerConfirm(true) : setSelectedCustomer(null)}
                className="h-10 px-6 rounded-xl border-slate-200 bg-white/50 font-bold uppercase tracking-widest text-[9px] text-slate-500 hover:bg-white hover:text-primary hover:border-primary/30 transition-all"
              >
                Mijozni O&apos;zgartirish
              </Button>
            </div>
          </div>
        )}

        {/* Add Customer Form - Modern Layout */}
        {showAddForm && (
          <div className="bg-white/90 backdrop-blur-md border border-slate-100 rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-top-6 duration-500">
            <div className="p-8 border-b border-slate-50 bg-white/40">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-primary/5 rounded-xl flex items-center justify-center">
                  <Plus className="h-5 w-5 text-primary" strokeWidth={3} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-none uppercase">Yangi Mijoz Qo&apos;shish</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Mijoz ma&apos;lumotlarini to&apos;ldiring</p>
                </div>
              </div>
            </div>
            <div className="p-8 lg:p-10 space-y-8 bg-slate-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { label: "F.I.SH *", key: "name", placeholder: "Ism sharif" },
                  { label: "Kompaniya *", key: "company", placeholder: "Yuridik nomi" },
                  { label: "Telefon", key: "phone", placeholder: "+998..." },
                  { label: "Manzil", key: "address", placeholder: "Ko'cha, uy..." }
                ].map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{field.label}</Label>
                    <Input
                      placeholder={field.placeholder}
                      value={(newCustomer as any)[field.key]}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="h-12 rounded-xl bg-white border-slate-100 font-bold focus:ring-4 focus:ring-primary/5 transition-all text-sm uppercase placeholder:normal-case placeholder:font-medium placeholder:text-slate-300 shadow-sm"
                    />
                  </div>
                ))}
                <div className="lg:col-span-2 flex items-end justify-end gap-3 pt-6">
                  <Button variant="ghost" onClick={() => setShowAddForm(false)} className="h-12 px-8 rounded-xl font-bold uppercase text-[9px] tracking-widest text-slate-400 hover:text-slate-600 hover:bg-white transition-all">Bekor Qilish</Button>
                  <Button onClick={handleAddCustomer} className="h-12 px-10 rounded-xl bg-primary text-white font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20 hover:bg-[#047857] active:scale-95 transition-all">Mijozni Saqlash</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {filteredCustomers.map((customer) => {
            const isSelected = selectedCustomer?.id === customer.id;
            return (
              <div
                key={customer.id}
                className={cn(
                  "group relative cursor-pointer border rounded-[2rem] overflow-hidden transition-all duration-500",
                  isSelected
                    ? "bg-slate-900 border-slate-900 shadow-2xl scale-[1.02] z-10"
                    : "bg-white border-slate-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 shadow-sm"
                )}
                onClick={() => !isCreatingOrder && !loading && handleSelectCustomer(customer)}
              >
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                      isSelected ? "bg-primary text-white shadow-lg shadow-primary/30 rotate-12" : "bg-primary/5 text-primary group-hover:rotate-6 shadow-inner"
                    )}>
                      <Building className="h-5 w-5" strokeWidth={2.5} />
                    </div>
                    {isSelected && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/40 animate-in zoom-in">
                        <CheckCircle size={16} strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <h3 className={cn(
                      "text-lg font-bold tracking-tight line-clamp-1 transition-all duration-500 uppercase",
                      isSelected ? "text-white" : "text-slate-900 group-hover:text-primary"
                    )}>
                      {customer.name}
                    </h3>
                    <p className={cn(
                      "text-[9px] font-bold uppercase tracking-[0.25em] transition-all duration-500",
                      isSelected ? "text-primary/70" : "text-slate-400 group-hover:text-primary/70"
                    )}>
                      {customer.legalName}
                    </p>
                  </div>

                  <div className={cn(
                    "space-y-3 pt-6 border-t transition-all duration-500",
                    isSelected ? "border-white/10" : "border-slate-50"
                  )}>
                    <div className="flex items-center gap-3">
                      <Phone className={cn("h-3.5 w-3.5", isSelected ? "text-primary/70" : "text-slate-300")} strokeWidth={2.5} />
                      <span className={cn("text-[10px] font-bold font-mono tracking-tighter", isSelected ? "text-white/70" : "text-slate-500")}>
                        {customer.contactPhone || '—'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className={cn("h-3.5 w-3.5", isSelected ? "text-primary/70" : "text-slate-300")} strokeWidth={2.5} />
                      <span className={cn("text-[10px] font-bold truncate tracking-tight uppercase leading-none", isSelected ? "text-white/60" : "text-slate-400")}>
                        {customer.address || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {isCreatingOrder && isSelected && (
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-[2px] transition-all z-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent shadow-lg shadow-primary/20"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State Redesign */}
        {filteredCustomers.length === 0 && (
          <div className="py-24 text-center bg-white border border-dashed border-slate-200 rounded-[2.5rem] shadow-inner">
            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users size={32} className="text-slate-200" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight uppercase leading-none">Mijoz Topilmadi</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 mb-10 max-w-xs mx-auto">Qidiruv natijasida hech qanday mos mijoz topilmadi</p>
            <Button onClick={() => setShowAddForm(true)} variant="outline" className="h-12 px-10 rounded-xl font-bold uppercase tracking-widest text-[10px] border-slate-200 text-slate-600 hover:text-primary hover:border-primary/20 transition-all">
              <Plus size={16} className="mr-2" strokeWidth={3} />
              Yangi Mijoz Qo&apos;shish
            </Button>
          </div>
        )}

        <ConfirmModal
          isOpen={showChangeCustomerConfirm}
          onClose={() => setShowChangeCustomerConfirm(false)}
          onConfirm={async () => {
            try { setIsChangingCustomer(true); if (currentOrder) await deleteOrder(currentOrder.id); setSelectedCustomer(null); setCurrentStep("customer"); toast.success("Mijoz o'zgartirildi"); }
            catch (e: any) { toast.error("Xatolik"); }
            finally { setIsChangingCustomer(false); setShowChangeCustomerConfirm(false); }
          }}
          title="Mijozni O'zgartirish"
          message="Joriy buyurtma o'chiriladi. Davom ettirasizmi?"
          confirmText="Ha, o'zgartirish"
          cancelText="Yo'q, qolsin"
          type="danger"
          isLoading={isChangingCustomer}
        />
      </div>
    </div>
  );
}