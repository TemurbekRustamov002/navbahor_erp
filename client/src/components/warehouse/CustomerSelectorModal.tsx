"use client";
import { useState } from "react";
import { useMultiWarehouseStore } from "@/stores/multiWarehouseStore";
import { useBackendCustomerStore } from "@/stores/backendCustomerStore";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/Toast";
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
  User,
  Star,
  Clock
} from "lucide-react";

interface CustomerSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerSelectorModal({ isOpen, onClose }: CustomerSelectorModalProps) {
  const { createTab, workspaceTabs } = useMultiWarehouseStore();
  const { customers, createCustomer } = useBackendCustomerStore();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    legalName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(search.toLowerCase()) ||
    customer.legalName?.toLowerCase().includes(search.toLowerCase()) ||
    customer.address?.toLowerCase().includes(search.toLowerCase())
  );

  // Get customers already in workspace
  const customersInWorkspace = new Set(workspaceTabs.map(tab => tab.customerId));

  const handleSelectCustomer = (customer: typeof customers[0]) => {
    // Check if customer already has an active workspace
    if (customersInWorkspace.has(customer.id)) {
      const existingTab = workspaceTabs.find(tab => tab.customerId === customer.id);
      if (existingTab) {
        toast.warning(`${customer.name} uchun workspace allaqachon ochildi`, {
          action: {
            label: "Workspace'ga o'tish",
            onClick: () => {
              // Switch to existing workspace logic would go here
              onClose();
            }
          }
        });
        return;
      }
    }

    const tabId = createTab(customer);
    toast.success(`${customer.name} uchun yangi workspace yaratildi`);
    onClose();

    // Reset form
    setSearch("");
    setShowAddForm(false);
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name.trim() || !newCustomer.legalName.trim()) {
      toast.error("Ism va tashkilot nomi majburiy");
      return;
    }

    try {
      const success = await createCustomer({
        ...newCustomer,
        isActive: true
      });

      if (success) {
        toast.success("Yangi mijoz qo'shildi. Endi ro'yxatdan tanlang.");
        setShowAddForm(false);
        setSearch("");
        // Reset form
        setNewCustomer({
          name: "",
          legalName: "",
          contactEmail: "",
          contactPhone: "",
          address: "",
        });
      }
    } catch (error) {
      toast.error("Mijoz qo'shishda xatolik yuz berdi");
    }
  };

  const getCustomerStatus = (customerId: string) => {
    const workspace = workspaceTabs.find(tab => tab.customerId === customerId);
    if (!workspace) return null;

    return {
      isActive: true,
      status: workspace.status,
      lastActivity: workspace.lastActivity
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return { label: 'Faol', color: 'bg-blue-100 text-blue-800' };
      case 'checklist_ready': return { label: 'Checklist tayyor', color: 'bg-green-100 text-green-800' };
      case 'scanning': return { label: 'Skanerlash', color: 'bg-yellow-100 text-yellow-800' };
      case 'completed': return { label: 'Tugallangan', color: 'bg-purple-100 text-purple-800' };
      case 'shipped': return { label: 'Yuborilgan', color: 'bg-gray-100 text-gray-800' };
      default: return { label: 'Noma\'lum', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mijoz tanlash"
      description="Yangi workspace yaratish uchun mijoz tanlang"
      size="lg"
    >
      <div className="p-6 space-y-6">
        {/* Search and Add */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mijoz, kompaniya yoki shahar bo'yicha qidirish..."
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Yangi mijoz
          </Button>
        </div>

        {/* Add Customer Form */}
        {showAddForm && (
          <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Yangi mijoz qo'shish
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Ism Familiya *</Label>
                <Input
                  id="name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ahmad Karimov"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="legalName">Tashkilot *</Label>
                <Input
                  id="legalName"
                  value={newCustomer.legalName}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, legalName: e.target.value }))}
                  placeholder="Karimov Tekstil LLC"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={newCustomer.contactEmail}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="ahmad@karimov.uz"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Telefon</Label>
                <Input
                  id="contactPhone"
                  value={newCustomer.contactPhone}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+998901234567"
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Manzil</Label>
                <Input
                  id="address"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Mustaqillik ko'chasi 15"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Bekor qilish
              </Button>
              <Button onClick={handleAddCustomer}>
                <Plus className="h-4 w-4 mr-2" />
                Mijoz qo'shish
              </Button>
            </div>
          </div>
        )}

        {/* Customers Grid */}
        <div className="max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 gap-3">
            {filteredCustomers.map((customer) => {
              const customerStatus = getCustomerStatus(customer.id);
              const isInWorkspace = customersInWorkspace.has(customer.id);

              return (
                <div
                  key={customer.id}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm",
                    isInWorkspace
                      ? "border-primary bg-primary/5 cursor-not-allowed"
                      : "hover:border-primary/50 hover:bg-muted/50"
                  )}
                  onClick={() => !isInWorkspace && handleSelectCustomer(customer)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <h3 className="font-semibold">{customer.name}</h3>
                          <p className="text-sm text-muted-foreground">{customer.legalName}</p>
                        </div>

                        {/* Status badges */}
                        <div className="flex items-center gap-2">
                          {isInWorkspace && customerStatus && (
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                getStatusBadge(customerStatus.status).color
                              )}>
                                {getStatusBadge(customerStatus.status).label}
                              </span>
                              <Clock className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        {customer.contactPhone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{customer.contactPhone}</span>
                          </div>
                        )}
                        {customer.contactEmail && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate">{customer.contactEmail}</span>
                          </div>
                        )}
                        {customer.address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>{customer.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {isInWorkspace ? (
                      <div className="flex items-center gap-2 text-primary">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Faol workspace</span>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        <span className="text-sm">Tanlash uchun bosing</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCustomers.length === 0 && search && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium mb-2">Mijoz topilmadi</h3>
              <p className="text-muted-foreground mb-4">
                "{search}" bo'yicha hech qanday mijoz topilmadi
              </p>
              <Button onClick={() => setShowAddForm(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Yangi mijoz qo'shish
              </Button>
            </div>
          )}
        </div>

        {/* Current workspace count */}
        {workspaceTabs.length > 0 && (
          <div className="border-t pt-4">
            <div className="text-sm text-muted-foreground">
              Hozir {workspaceTabs.length} ta faol workspace mavjud
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}