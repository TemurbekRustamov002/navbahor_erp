"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useMultiWarehouseStore } from "@/stores/multiWarehouseStore";

interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  assignedTo?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
}

interface ChecklistManagerMultiProps {
  workspaceId: string;
}

export function ChecklistManagerMulti({ workspaceId }: ChecklistManagerMultiProps) {
  const { workspaceTabs, customerWorkspaces } = useMultiWarehouseStore();
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
  }>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  })

  const workspace = workspaceTabs?.find(w => w.id === workspaceId);
  const workspaceData = customerWorkspaces?.[workspaceId];

  useEffect(() => {
    if (workspace) {
      loadChecklists();
    }
  }, [workspace]);

  const loadChecklists = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API call
      setChecklists([
        {
          id: "1",
          title: "Inventar sanovi",
          description: "Oylik inventar sanovi o'tkazish",
          isCompleted: false,
          priority: "high",
          dueDate: "2024-01-15"
        },
        {
          id: "2", 
          title: "Xavfsizlik tekshiruvi",
          description: "Ombor xavfsizligini tekshirish",
          isCompleted: true,
          priority: "medium",
          dueDate: "2024-01-10"
        },
        {
          id: "3",
          title: "Yangi mahsulotlar qabuli",
          description: "Kelgan yangi partiyani qabul qilish",
          isCompleted: false,
          priority: "medium",
          dueDate: "2024-01-12"
        }
      ]);
    } catch (error) {
      console.error("Cheklistni yuklashda xato:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async (itemId: string) => {
    setChecklists(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, isCompleted: !item.isCompleted }
          : item
      )
    );
  };

  const handleAddItem = async () => {
    if (!newItem.title.trim()) return;

    const item: ChecklistItem = {
      id: Date.now().toString(),
      title: newItem.title,
      description: newItem.description,
      isCompleted: false,
      priority: newItem.priority,
      dueDate: newItem.dueDate
    };

    setChecklists(prev => [...prev, item]);
    setNewItem({ title: "", description: "", priority: "medium", dueDate: "" });
    setShowAddModal(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    setChecklists(prev => prev.filter(item => item.id !== itemId));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "low": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high": return "Yuqori";
      case "medium": return "O'rta";
      case "low": return "Past";
      default: return "O'rta";
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
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Cheklista - {workspace?.customerName}
          </h3>
          <Button onClick={() => setShowAddModal(true)}>
            Yangi vazifa qo'shish
          </Button>
        </div>

        <div className="space-y-3">
          {checklists.map((item) => (
            <div
              key={item.id}
              className={`p-4 border rounded-lg transition-all ${
                item.isCompleted ? "bg-gray-50 opacity-75" : "bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={item.isCompleted}
                  onChange={() => handleToggleComplete(item.id)}
                  className="mt-1 h-5 w-5 text-blue-600 rounded border-gray-300"
                />
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${
                      item.isCompleted ? "line-through text-gray-500" : ""
                    }`}>
                      {item.title}
                    </h4>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(item.priority)}`}>
                        {getPriorityText(item.priority)}
                      </span>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        O'chirish
                      </Button>
                    </div>
                  </div>
                  
                  {item.description && (
                    <p className={`text-sm mt-1 ${
                      item.isCompleted ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {item.description}
                    </p>
                  )}
                  
                  {item.dueDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      Muddat: {new Date(item.dueDate).toLocaleDateString("uz-UZ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {checklists.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Hozircha vazifalar yo'q
          </div>
        )}
      </Card>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Yangi vazifa qo'shish"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Vazifa nomi *
            </label>
            <Input
              value={newItem.title}
              onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Vazifa nomini kiriting"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Tavsif
            </label>
            <textarea
              value={newItem.description}
              onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Vazifa tavsifini kiriting"
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Muhimlik darajasi
            </label>
            <select
              value={newItem.priority}
              onChange={(e) => setNewItem(prev => ({ 
                ...prev, 
                priority: e.target.value as "low" | "medium" | "high"
              }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="low">Past</option>
              <option value="medium">O'rta</option>
              <option value="high">Yuqori</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Muddat
            </label>
            <Input
              type="date"
              value={newItem.dueDate}
              onChange={(e) => setNewItem(prev => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
            >
              Bekor qilish
            </Button>
            <Button onClick={handleAddItem}>
              Qo'shish
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}