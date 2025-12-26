import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Customer } from '@/types/customer';
import { Checklist, ChecklistItem } from '@/types/checklist';

export interface WorkspaceTab {
  id: string;
  customerId: string;
  customerName: string;
  isActive: boolean;
  createdAt: string;
  lastActivity: string;
  status: 'active' | 'checklist_ready' | 'scanning' | 'completed' | 'shipped';
  unreadNotifications: number;
}

export interface CustomerWorkspace {
  tabId: string;
  customer: Customer;
  checklists: Checklist[];
  activeChecklistId: string | null;
  currentStep: 'toys' | 'checklist' | 'scanning' | 'shipment';
  selectedToys: string[];
  completedScans: string[];
  notifications: WorkspaceNotification[];
}

export interface WorkspaceNotification {
  id: string;
  tabId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface MultiWarehouseState {
  // Workspace Management
  workspaceTabs: WorkspaceTab[];
  activeTabId: string | null;
  customerWorkspaces: Record<string, CustomerWorkspace>;

  // Tab Operations
  createTab: (customer: Customer) => string;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabStatus: (tabId: string, status: WorkspaceTab['status']) => void;
  updateTabActivity: (tabId: string) => void;

  // Workspace Operations
  setWorkspaceStep: (tabId: string, step: CustomerWorkspace['currentStep']) => void;
  setSelectedToys: (tabId: string, toyIds: string[]) => void;
  addChecklist: (tabId: string, checklist: Checklist) => void;
  setActiveChecklist: (tabId: string, checklistId: string) => void;
  removeChecklist: (tabId: string, checklistId: string) => void;

  // Scanning Operations
  scanToyInWorkspace: (tabId: string, toyId: string, scannedBy: string) => void;
  resetScansInWorkspace: (tabId: string) => void;

  // Notification System
  addNotification: (tabId: string, notification: Omit<WorkspaceNotification, 'id' | 'tabId' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (notificationId: string) => void;
  clearNotifications: (tabId: string) => void;

  // Bulk Operations
  scanToyAcrossWorkspaces: (toyId: string, scannedBy: string) => boolean;
  getWorkspaceByToy: (toyId: string) => string | null;
  getAllActiveChecklists: () => Checklist[];
  getWorkspaceStats: () => {
    totalTabs: number;
    activeTabs: number;
    totalChecklists: number;
    totalItems: number;
    scannedItems: number;
    pendingItems: number;
  };

  // Utilities
  generateTabId: () => string;
  cleanupInactiveTabs: () => void;
  exportWorkspaceData: () => string;
  importWorkspaceData: (data: string) => void;
}

export const useMultiWarehouseStore = create<MultiWarehouseState>()(
  persist(
    (set, get) => ({
      // Initial state
      workspaceTabs: [],
      activeTabId: null,
      customerWorkspaces: {},

      // Tab operations
      createTab: (customer) => {
        const tabId = get().generateTabId();
        const tab: WorkspaceTab = {
          id: tabId,
          customerId: customer.id,
          customerName: customer.name,
          isActive: true,
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          status: 'active',
          unreadNotifications: 0
        };

        const workspace: CustomerWorkspace = {
          tabId,
          customer,
          checklists: [],
          activeChecklistId: null,
          currentStep: 'toys',
          selectedToys: [],
          completedScans: [],
          notifications: []
        };

        set((state) => ({
          workspaceTabs: [...state.workspaceTabs, tab],
          customerWorkspaces: {
            ...state.customerWorkspaces,
            [tabId]: workspace
          },
          activeTabId: tabId
        }));

        return tabId;
      },

      closeTab: (tabId) => {
        set((state) => {
          const newTabs = state.workspaceTabs.filter(tab => tab.id !== tabId);
          const newWorkspaces = { ...state.customerWorkspaces };
          delete newWorkspaces[tabId];

          // Set new active tab
          let newActiveTabId = null;
          if (state.activeTabId === tabId && newTabs.length > 0) {
            newActiveTabId = newTabs[newTabs.length - 1].id;
          } else if (state.activeTabId !== tabId) {
            newActiveTabId = state.activeTabId;
          }

          return {
            workspaceTabs: newTabs,
            customerWorkspaces: newWorkspaces,
            activeTabId: newActiveTabId
          };
        });
      },

      setActiveTab: (tabId) => {
        set({ activeTabId: tabId });
        get().updateTabActivity(tabId);
      },

      updateTabStatus: (tabId, status) => {
        set((state) => ({
          workspaceTabs: state.workspaceTabs.map(tab =>
            tab.id === tabId ? { ...tab, status } : tab
          )
        }));
      },

      updateTabActivity: (tabId) => {
        set((state) => ({
          workspaceTabs: state.workspaceTabs.map(tab =>
            tab.id === tabId
              ? { ...tab, lastActivity: new Date().toISOString() }
              : tab
          )
        }));
      },

      // Workspace operations
      setWorkspaceStep: (tabId, step) => {
        set((state) => ({
          customerWorkspaces: {
            ...state.customerWorkspaces,
            [tabId]: {
              ...state.customerWorkspaces[tabId],
              currentStep: step
            }
          }
        }));
        get().updateTabActivity(tabId);
      },

      setSelectedToys: (tabId, toyIds) => {
        set((state) => ({
          customerWorkspaces: {
            ...state.customerWorkspaces,
            [tabId]: {
              ...state.customerWorkspaces[tabId],
              selectedToys: toyIds
            }
          }
        }));
      },

      addChecklist: (tabId, checklist) => {
        set((state) => {
          const workspace = state.customerWorkspaces[tabId];
          if (!workspace) return state;

          return {
            customerWorkspaces: {
              ...state.customerWorkspaces,
              [tabId]: {
                ...workspace,
                checklists: [...workspace.checklists, checklist],
                activeChecklistId: checklist.id
              }
            }
          };
        });

        get().updateTabStatus(tabId, 'checklist_ready');
        get().addNotification(tabId, {
          type: 'success',
          title: 'Checklist yaratildi',
          message: `${checklist.items.length} ta toy bilan yangi checklist yaratildi`
        });
      },

      setActiveChecklist: (tabId, checklistId) => {
        set((state) => ({
          customerWorkspaces: {
            ...state.customerWorkspaces,
            [tabId]: {
              ...state.customerWorkspaces[tabId],
              activeChecklistId: checklistId
            }
          }
        }));
      },

      removeChecklist: (tabId, checklistId) => {
        set((state) => {
          const workspace = state.customerWorkspaces[tabId];
          if (!workspace) return state;

          const updatedChecklists = workspace.checklists.filter(c => c.id !== checklistId);
          const newActiveId = workspace.activeChecklistId === checklistId
            ? (updatedChecklists.length > 0 ? updatedChecklists[0].id : null)
            : workspace.activeChecklistId;

          return {
            customerWorkspaces: {
              ...state.customerWorkspaces,
              [tabId]: {
                ...workspace,
                checklists: updatedChecklists,
                activeChecklistId: newActiveId
              }
            }
          };
        });
      },

      // Scanning operations
      scanToyInWorkspace: (tabId, toyId, scannedBy) => {
        set((state) => {
          const workspace = state.customerWorkspaces[tabId];
          if (!workspace) return state;

          const updatedChecklists = workspace.checklists.map(checklist => ({
            ...checklist,
            items: checklist.items.map(item =>
              item.toyId === toyId
                ? { ...item, isScanned: true, scannedAt: new Date().toISOString(), scannedBy }
                : item
            )
          }));

          return {
            customerWorkspaces: {
              ...state.customerWorkspaces,
              [tabId]: {
                ...workspace,
                checklists: updatedChecklists,
                completedScans: [...workspace.completedScans, toyId]
              }
            }
          };
        });

        get().addNotification(tabId, {
          type: 'success',
          title: 'Toy skanerlandi',
          message: `Toy ${toyId} muvaffaqiyatli skanerlandi`
        });
      },

      resetScansInWorkspace: (tabId) => {
        set((state) => {
          const workspace = state.customerWorkspaces[tabId];
          if (!workspace) return state;

          const updatedChecklists = workspace.checklists.map(checklist => ({
            ...checklist,
            items: checklist.items.map(item => ({
              ...item,
              isScanned: false,
              scannedAt: undefined,
              scannedBy: undefined
            }))
          }));

          return {
            customerWorkspaces: {
              ...state.customerWorkspaces,
              [tabId]: {
                ...workspace,
                checklists: updatedChecklists,
                completedScans: []
              }
            }
          };
        });
      },

      // Smart scanning across workspaces
      scanToyAcrossWorkspaces: (toyId, scannedBy) => {
        const workspaceTabId = get().getWorkspaceByToy(toyId);
        if (!workspaceTabId) return false;

        get().scanToyInWorkspace(workspaceTabId, toyId, scannedBy);
        return true;
      },

      getWorkspaceByToy: (toyId) => {
        const { customerWorkspaces } = get();
        for (const [tabId, workspace] of Object.entries(customerWorkspaces)) {
          for (const checklist of workspace.checklists) {
            if (checklist.items.some(item => item.toyId === toyId)) {
              return tabId;
            }
          }
        }
        return null;
      },

      // Notification system
      addNotification: (tabId, notification) => {
        const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        set((state) => {
          const workspace = state.customerWorkspaces[tabId];
          if (!workspace) return state;

          const newNotification: WorkspaceNotification = {
            ...notification,
            id: notificationId,
            tabId,
            timestamp: new Date().toISOString(),
            read: false
          };

          return {
            customerWorkspaces: {
              ...state.customerWorkspaces,
              [tabId]: {
                ...workspace,
                notifications: [newNotification, ...workspace.notifications.slice(0, 49)] // Keep last 50
              }
            },
            workspaceTabs: state.workspaceTabs.map(tab =>
              tab.id === tabId
                ? { ...tab, unreadNotifications: tab.unreadNotifications + 1 }
                : tab
            )
          };
        });
      },

      markNotificationRead: (notificationId) => {
        set((state) => {
          const newWorkspaces = { ...state.customerWorkspaces };
          let tabId: string | null = null;

          for (const [tId, workspace] of Object.entries(newWorkspaces)) {
            const notificationIndex = workspace.notifications.findIndex(n => n.id === notificationId);
            if (notificationIndex !== -1) {
              tabId = tId;
              newWorkspaces[tId] = {
                ...workspace,
                notifications: workspace.notifications.map((notif, index) =>
                  index === notificationIndex ? { ...notif, read: true } : notif
                )
              };
              break;
            }
          }

          const updatedTabs = tabId
            ? state.workspaceTabs.map(tab =>
              tab.id === tabId
                ? { ...tab, unreadNotifications: Math.max(0, tab.unreadNotifications - 1) }
                : tab
            )
            : state.workspaceTabs;

          return {
            customerWorkspaces: newWorkspaces,
            workspaceTabs: updatedTabs
          };
        });
      },

      clearNotifications: (tabId) => {
        set((state) => ({
          customerWorkspaces: {
            ...state.customerWorkspaces,
            [tabId]: {
              ...state.customerWorkspaces[tabId],
              notifications: []
            }
          },
          workspaceTabs: state.workspaceTabs.map(tab =>
            tab.id === tabId ? { ...tab, unreadNotifications: 0 } : tab
          )
        }));
      },

      // Analytics and utilities
      getAllActiveChecklists: () => {
        const { customerWorkspaces } = get();
        const allChecklists: Checklist[] = [];

        Object.values(customerWorkspaces).forEach(workspace => {
          allChecklists.push(...workspace.checklists);
        });

        return allChecklists;
      },

      getWorkspaceStats: () => {
        const { workspaceTabs, customerWorkspaces } = get();
        const activeTabs = workspaceTabs.filter(tab => tab.status !== 'shipped').length;
        const allChecklists = get().getAllActiveChecklists();
        const totalItems = allChecklists.reduce((sum, checklist) => sum + checklist.items.length, 0);
        const scannedItems = allChecklists.reduce((sum, checklist) =>
          sum + checklist.items.filter(item => item.isScanned).length, 0);

        return {
          totalTabs: workspaceTabs.length,
          activeTabs,
          totalChecklists: allChecklists.length,
          totalItems,
          scannedItems,
          pendingItems: totalItems - scannedItems
        };
      },

      generateTabId: () => {
        return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      },

      cleanupInactiveTabs: () => {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        set((state) => {
          const activeTabs = state.workspaceTabs.filter(tab =>
            tab.status === 'shipped' && tab.lastActivity < oneDayAgo
              ? false
              : true
          );

          const activeTabIds = new Set(activeTabs.map(tab => tab.id));
          const newWorkspaces: Record<string, CustomerWorkspace> = {};

          Object.entries(state.customerWorkspaces).forEach(([tabId, workspace]) => {
            if (activeTabIds.has(tabId)) {
              newWorkspaces[tabId] = workspace;
            }
          });

          return {
            workspaceTabs: activeTabs,
            customerWorkspaces: newWorkspaces,
            activeTabId: activeTabIds.has(state.activeTabId || '') ? state.activeTabId : null
          };
        });
      },

      exportWorkspaceData: () => {
        const { workspaceTabs, customerWorkspaces } = get();
        return JSON.stringify({ workspaceTabs, customerWorkspaces }, null, 2);
      },

      importWorkspaceData: (data) => {
        try {
          const parsed = JSON.parse(data);
          set({
            workspaceTabs: parsed.workspaceTabs || [],
            customerWorkspaces: parsed.customerWorkspaces || {}
          });
        } catch (error) {
          console.error('Failed to import workspace data:', error);
        }
      }
    }),
    {
      name: 'multi-warehouse-store',
      partialize: (state) => ({
        workspaceTabs: state.workspaceTabs,
        customerWorkspaces: state.customerWorkspaces,
        activeTabId: state.activeTabId
      })
    }
  )
);