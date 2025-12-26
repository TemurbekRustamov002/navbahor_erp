import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Checklist,
  ChecklistItem,
  ChecklistSummary,
  ToySelectionCriteria,
  ChecklistTemplate,
  ChecklistPermissions
} from '@/types/checklist';
import { Toy } from '@/types/toy';
import { Marka } from '@/types/marka';
import { LabSample } from '@/types/lab';

interface ChecklistStore {
  // State
  checklists: Checklist[];
  currentChecklist: Checklist | null;
  templates: ChecklistTemplate[];
  isLoading: boolean;
  error: string | null;

  // Actions
  createChecklist: (workspaceId: string, customerId: string, customerName: string) => Checklist;
  addToyToChecklist: (checklistId: string, toy: Toy, marka: Marka, labResult: LabSample) => void;
  removeToyFromChecklist: (checklistId: string, toyId: string) => void;
  confirmChecklist: (checklistId: string, userId: string) => void;
  lockChecklist: (checklistId: string) => void;
  requestModification: (checklistId: string, reason: string, userId: string) => void;
  approveModification: (checklistId: string, userId: string) => void;

  // Selection helpers
  getAvailableToysForMarka: (markaId: string, grade: string, toys: Toy[], labSamples: LabSample[]) => Toy[];
  createSelectionCriteria: (markaId: string, markaLabel: string, grade: string, quantity: number, availableToys: Toy[]) => ToySelectionCriteria;
  bulkAddToys: (checklistId: string, criteria: ToySelectionCriteria[], toys: Toy[], markas: Marka[], labSamples: LabSample[]) => void;

  // Templates
  saveAsTemplate: (checklist: Checklist, name: string, userId: string) => ChecklistTemplate;
  loadTemplate: (templateId: string) => ToySelectionCriteria[] | null;

  // Export
  generateQRCodesFile: (checklist: Checklist) => Promise<Blob>;
  generateSummaryFile: (checklist: Checklist) => Promise<Blob>;
  exportChecklist: (checklistId: string) => Promise<{ qrCodesFile: Blob; summaryFile: Blob }>;

  // Permissions
  getPermissions: (checklist: Checklist, userRole: string) => ChecklistPermissions;

  // Utilities
  calculateSummary: (items: ChecklistItem[]) => ChecklistSummary[];
  setCurrentChecklist: (checklist: Checklist | null) => void;
  clearError: () => void;
}

export const useChecklistStore = create<ChecklistStore>()(
  persist(
    (set, get) => ({
      // Initial state
      checklists: [],
      currentChecklist: null,
      templates: [],
      isLoading: false,
      error: null,

      // Create new checklist
      createChecklist: (workspaceId: string, customerId: string, customerName: string) => {
        const newChecklist: Checklist = {
          id: `checklist-${Date.now()}`,
          workspaceId,
          customerId,
          customerName,
          items: [],
          summary: [],
          status: 'draft',
          createdAt: new Date().toISOString(),
          createdBy: 'current-user', // Should be from auth store
          totalItems: 0,
          totalWeight: 0,
        };

        set((state) => ({
          checklists: [...state.checklists, newChecklist],
          currentChecklist: newChecklist,
        }));

        return newChecklist;
      },

      // Add single toy to checklist
      addToyToChecklist: (checklistId: string, toy: Toy, marka: Marka, labResult: LabSample) => {
        set((state) => {
          const checklistIndex = state.checklists.findIndex(c => c.id === checklistId);
          if (checklistIndex === -1) return state;

          const checklist = state.checklists[checklistIndex];
          if (checklist.status !== 'draft') return state; // Can't modify locked checklists

          // Check if toy already exists
          if (checklist.items.some(item => item.toyId === toy.id)) return state;

          const newItem: ChecklistItem = {
            id: `item-${Date.now()}-${Math.random()}`,
            toyId: toy.id,
            markaId: marka.id,
            markaLabel: `${marka.number} - ${marka.ptm}`,
            qrCode: `QR-${toy.id}-${Date.now()}`,
            weight: toy.netto,
            grade: labResult.grade,
            qualityScore: labResult.strength,
            addedAt: new Date().toISOString(),
            position: checklist.items.length + 1,
          };

          const updatedItems = [...checklist.items, newItem];
          const updatedSummary = get().calculateSummary(updatedItems);

          const updatedChecklist: Checklist = {
            ...checklist,
            items: updatedItems,
            summary: updatedSummary,
            totalItems: updatedItems.length,
            totalWeight: updatedItems.reduce((sum, item) => sum + item.weight, 0),
          };

          const updatedChecklists = [...state.checklists];
          updatedChecklists[checklistIndex] = updatedChecklist;

          return {
            checklists: updatedChecklists,
            currentChecklist: state.currentChecklist?.id === checklistId ? updatedChecklist : state.currentChecklist,
          };
        });
      },

      // Remove toy from checklist
      removeToyFromChecklist: (checklistId: string, toyId: string) => {
        set((state) => {
          const checklistIndex = state.checklists.findIndex(c => c.id === checklistId);
          if (checklistIndex === -1) return state;

          const checklist = state.checklists[checklistIndex];
          if (checklist.status !== 'draft') return state;

          const updatedItems = checklist.items.filter(item => item.toyId !== toyId);
          const updatedSummary = get().calculateSummary(updatedItems);

          const updatedChecklist: Checklist = {
            ...checklist,
            items: updatedItems,
            summary: updatedSummary,
            totalItems: updatedItems.length,
            totalWeight: updatedItems.reduce((sum, item) => sum + item.weight, 0),
          };

          const updatedChecklists = [...state.checklists];
          updatedChecklists[checklistIndex] = updatedChecklist;

          return {
            checklists: updatedChecklists,
            currentChecklist: state.currentChecklist?.id === checklistId ? updatedChecklist : state.currentChecklist,
          };
        });
      },

      // Confirm checklist
      confirmChecklist: (checklistId: string, userId: string) => {
        set((state) => {
          const checklistIndex = state.checklists.findIndex(c => c.id === checklistId);
          if (checklistIndex === -1) return state;

          const checklist = state.checklists[checklistIndex];
          if (checklist.status !== 'draft') return state;

          const updatedChecklist: Checklist = {
            ...checklist,
            status: 'confirmed',
            confirmedAt: new Date().toISOString(),
            confirmedBy: userId,
          };

          const updatedChecklists = [...state.checklists];
          updatedChecklists[checklistIndex] = updatedChecklist;

          return {
            checklists: updatedChecklists,
            currentChecklist: state.currentChecklist?.id === checklistId ? updatedChecklist : state.currentChecklist,
          };
        });
      },

      // Lock checklist
      lockChecklist: (checklistId: string) => {
        set((state) => {
          const checklistIndex = state.checklists.findIndex(c => c.id === checklistId);
          if (checklistIndex === -1) return state;

          const checklist = state.checklists[checklistIndex];
          if (checklist.status !== 'confirmed') return state;

          const updatedChecklist: Checklist = {
            ...checklist,
            status: 'locked',
            lockedAt: new Date().toISOString(),
          };

          const updatedChecklists = [...state.checklists];
          updatedChecklists[checklistIndex] = updatedChecklist;

          return {
            checklists: updatedChecklists,
            currentChecklist: state.currentChecklist?.id === checklistId ? updatedChecklist : state.currentChecklist,
          };
        });
      },

      // Request modification
      requestModification: (checklistId: string, reason: string, userId: string) => {
        set((state) => {
          const checklistIndex = state.checklists.findIndex(c => c.id === checklistId);
          if (checklistIndex === -1) return state;

          const checklist = state.checklists[checklistIndex];
          if (checklist.status !== 'locked') return state;

          const updatedChecklist: Checklist = {
            ...checklist,
            status: 'modification_requested',
            modificationRequestedAt: new Date().toISOString(),
            modificationReason: reason,
          };

          const updatedChecklists = [...state.checklists];
          updatedChecklists[checklistIndex] = updatedChecklist;

          // Here you would normally send notification to admin
          console.log(`Modification request sent to admin for checklist ${checklistId}: ${reason}`);

          return {
            checklists: updatedChecklists,
            currentChecklist: state.currentChecklist?.id === checklistId ? updatedChecklist : state.currentChecklist,
          };
        });
      },

      // Approve modification (admin only)
      approveModification: (checklistId: string, userId: string) => {
        set((state) => {
          const checklistIndex = state.checklists.findIndex(c => c.id === checklistId);
          if (checklistIndex === -1) return state;

          const checklist = state.checklists[checklistIndex];
          if (checklist.status !== 'modification_requested') return state;

          const updatedChecklist: Checklist = {
            ...checklist,
            status: 'draft', // Back to editable state
            modificationReason: undefined,
            modificationRequestedAt: undefined,
          };

          const updatedChecklists = [...state.checklists];
          updatedChecklists[checklistIndex] = updatedChecklist;

          return {
            checklists: updatedChecklists,
            currentChecklist: state.currentChecklist?.id === checklistId ? updatedChecklist : state.currentChecklist,
          };
        });
      },

      // Get available toys for specific marka and grade
      getAvailableToysForMarka: (markaId: string, grade: string, toys: Toy[], labSamples: LabSample[]) => {
        return toys.filter(toy => {
          // Check if toy belongs to marka
          if (toy.markaId !== markaId) return false;

          // Check if toy is not sold/reserved
          if (toy.sold || toy.reserved) return false;

          // Check if toy has approved lab result with specified grade
          const labResult = labSamples.find(sample =>
            sample.sourceId === toy.id &&
            sample.status === 'APPROVED' &&
            sample.grade === grade
          );

          return !!labResult;
        });
      },

      // Create selection criteria
      createSelectionCriteria: (markaId: string, markaLabel: string, grade: string, quantity: number, availableToys: Toy[]) => {
        return {
          markaId,
          markaLabel,
          grade,
          quantity,
          availableCount: availableToys.length,
          selectedToys: [],
        };
      },

      // Bulk add toys based on criteria
      bulkAddToys: (checklistId: string, criteria: ToySelectionCriteria[], toys: Toy[], markas: Marka[], labSamples: LabSample[]) => {
        const checklist = get().checklists.find(c => c.id === checklistId);
        if (!checklist || checklist.status !== 'draft') return;

        criteria.forEach(criterion => {
          const availableToys = get().getAvailableToysForMarka(criterion.markaId, criterion.grade, toys, labSamples);
          const marka = markas.find(m => m.id === criterion.markaId);

          if (!marka) return;

          // Select toys up to the requested quantity
          const toysToAdd = availableToys.slice(0, criterion.quantity);

          toysToAdd.forEach(toy => {
            const labResult = labSamples.find(sample =>
              sample.sourceId === toy.id &&
              sample.status === 'APPROVED'
            );

            if (labResult) {
              get().addToyToChecklist(checklistId, toy, marka, labResult);
            }
          });
        });
      },

      // Calculate summary
      calculateSummary: (items: ChecklistItem[]): ChecklistSummary[] => {
        const markaGroups = items.reduce((acc, item) => {
          if (!acc[item.markaId]) {
            acc[item.markaId] = {
              markaId: item.markaId,
              markaLabel: item.markaLabel,
              totalToys: 0,
              grades: {},
              totalWeight: 0,
              averageQuality: 0,
            };
          }

          const group = acc[item.markaId];
          group.totalToys++;
          group.grades[item.grade] = (group.grades[item.grade] || 0) + 1;
          group.totalWeight += item.weight;

          return acc;
        }, {} as Record<string, ChecklistSummary>);

        // Calculate average quality for each group
        Object.values(markaGroups).forEach(group => {
          const groupItems = items.filter(item => item.markaId === group.markaId);
          group.averageQuality = groupItems.reduce((sum, item) => sum + item.qualityScore, 0) / groupItems.length;
        });

        return Object.values(markaGroups);
      },

      // Save as template
      saveAsTemplate: (checklist: Checklist, name: string, userId: string) => {
        const template: ChecklistTemplate = {
          id: `template-${Date.now()}`,
          name,
          criteria: checklist.summary.map(summary => ({
            markaId: summary.markaId,
            markaLabel: summary.markaLabel,
            grade: Object.keys(summary.grades)[0] || 'Yaxshi', // Default grade
            quantity: summary.totalToys,
            availableCount: 0,
            selectedToys: [],
          })),
          createdAt: new Date().toISOString(),
          createdBy: userId,
          usedCount: 0,
        };

        set((state) => ({
          templates: [...state.templates, template],
        }));

        return template;
      },

      // Load template
      loadTemplate: (templateId: string) => {
        const template = get().templates.find(t => t.id === templateId);
        return template?.criteria || null;
      },

      // Generate QR codes file
      generateQRCodesFile: async (checklist: Checklist): Promise<Blob> => {
        const { generateQRCodesContent } = await import('@/lib/utils/export');
        const content = generateQRCodesContent(checklist);
        return new Blob([content], { type: 'text/plain; charset=utf-8' });
      },

      // Generate summary file
      generateSummaryFile: async (checklist: Checklist): Promise<Blob> => {
        const { generateSummaryContent } = await import('@/lib/utils/export');
        const content = generateSummaryContent(checklist);
        return new Blob([content], { type: 'text/plain; charset=utf-8' });
      },

      // Export checklist
      exportChecklist: async (checklistId: string) => {
        const checklist = get().checklists.find(c => c.id === checklistId);
        if (!checklist) throw new Error('Checklist not found');

        const { validateChecklistForExport, generateFilename, downloadFile } = await import('@/lib/utils/export');

        // Validate checklist
        const validation = validateChecklistForExport(checklist);
        if (!validation.isValid) {
          throw new Error(`Export xatosi: ${validation.errors.join(', ')}`);
        }

        const qrCodesFile = await get().generateQRCodesFile(checklist);
        const summaryFile = await get().generateSummaryFile(checklist);

        // Auto-download files
        const qrContent = await qrCodesFile.text();
        const summaryContent = await summaryFile.text();

        downloadFile(qrContent, generateFilename(checklist, 'qr'));
        downloadFile(summaryContent, generateFilename(checklist, 'summary'));

        return { qrCodesFile, summaryFile };
      },

      // Get permissions based on user role
      getPermissions: (checklist: Checklist, userRole: string): ChecklistPermissions => {
        const isAdmin = userRole === 'ADMIN';
        const isWarehouseManager = userRole === 'WAREHOUSE_MANAGER';

        return {
          canAddToys: checklist.status === 'draft' && (isAdmin || isWarehouseManager),
          canConfirm: checklist.status === 'draft' && (isAdmin || isWarehouseManager),
          canLock: checklist.status === 'confirmed' && isAdmin,
          canRequestModification: checklist.status === 'locked' && (isAdmin || isWarehouseManager),
          canApproveModification: checklist.status === 'modification_requested' && isAdmin,
          canExport: checklist.status !== 'draft',
          canDelete: checklist.status === 'draft' && isAdmin,
        };
      },

      // Utilities
      setCurrentChecklist: (checklist: Checklist | null) => {
        set({ currentChecklist: checklist });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'navbahor-checklist-storage',
      version: 1,
    }
  )
);