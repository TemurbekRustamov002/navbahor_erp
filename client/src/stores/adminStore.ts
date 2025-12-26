import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ModificationRequest, AdminNotification, AdminStats, AdminActivity } from '@/types/admin';

interface AdminStore {
  // State
  modificationRequests: ModificationRequest[];
  notifications: AdminNotification[];
  activities: AdminActivity[];
  
  // Actions
  createModificationRequest: (
    checklistId: string,
    customerName: string,
    requestedBy: string,
    requestedByRole: string,
    reason: string,
    checklistSummary: ModificationRequest['checklistSummary']
  ) => ModificationRequest;
  
  approveModificationRequest: (requestId: string, adminId: string, note?: string) => void;
  rejectModificationRequest: (requestId: string, adminId: string, note?: string) => void;
  
  // Notifications
  addNotification: (notification: Omit<AdminNotification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Activity log
  addActivity: (activity: Omit<AdminActivity, 'id' | 'timestamp'>) => void;
  
  // Stats
  getStats: () => AdminStats;
  
  // Utilities
  getPendingRequests: () => ModificationRequest[];
  getRequestById: (requestId: string) => ModificationRequest | null;
  clearOldActivities: () => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      // Initial state
      modificationRequests: [],
      notifications: [],
      activities: [],

      // Create modification request
      createModificationRequest: (
        checklistId: string,
        customerName: string,
        requestedBy: string,
        requestedByRole: string,
        reason: string,
        checklistSummary: ModificationRequest['checklistSummary']
      ) => {
        const newRequest: ModificationRequest = {
          id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          checklistId,
          customerName,
          requestedBy,
          requestedByRole,
          reason,
          status: 'pending',
          createdAt: new Date().toISOString(),
          checklistSummary
        };

        // Add notification for admin
        const notification: Omit<AdminNotification, 'id' | 'createdAt'> = {
          type: 'modification_request',
          title: 'Yangi o\'zgartirish so\'rovi',
          message: `${requestedBy} tomonidan ${customerName} checklistini o'zgartirish so'ralgan`,
          isRead: false,
          relatedId: newRequest.id,
          priority: 'high'
        };

        // Add activity
        const activity: Omit<AdminActivity, 'id' | 'timestamp'> = {
          type: 'checklist_created',
          description: `${requestedBy} tomonidan ${customerName} uchun checklist o'zgartirish so'rovi yuborildi`,
          user: requestedBy,
          relatedId: checklistId
        };

        set((state) => ({
          modificationRequests: [...state.modificationRequests, newRequest],
          notifications: [...state.notifications, {
            ...notification,
            id: `notif-${Date.now()}`,
            createdAt: new Date().toISOString()
          }],
          activities: [...state.activities, {
            ...activity,
            id: `activity-${Date.now()}`,
            timestamp: new Date().toISOString()
          }]
        }));

        return newRequest;
      },

      // Approve modification request
      approveModificationRequest: (requestId: string, adminId: string, note?: string) => {
        set((state) => {
          const requestIndex = state.modificationRequests.findIndex(req => req.id === requestId);
          if (requestIndex === -1) return state;

          const request = state.modificationRequests[requestIndex];
          const updatedRequest: ModificationRequest = {
            ...request,
            status: 'approved',
            reviewedAt: new Date().toISOString(),
            reviewedBy: adminId,
            reviewNote: note
          };

          const updatedRequests = [...state.modificationRequests];
          updatedRequests[requestIndex] = updatedRequest;

          // Add notification for requester (in real app, this would be sent to user)
          const notification: Omit<AdminNotification, 'id' | 'createdAt'> = {
            type: 'modification_request',
            title: 'So\'rov tasdiqlandi',
            message: `${request.customerName} checklist o'zgartirish so'rovi tasdiqlandi`,
            isRead: false,
            relatedId: requestId,
            priority: 'medium'
          };

          // Add activity
          const activity: Omit<AdminActivity, 'id' | 'timestamp'> = {
            type: 'request_approved',
            description: `${adminId} tomonidan ${request.customerName} checklist o'zgartirish so'rovi tasdiqlandi`,
            user: adminId,
            relatedId: request.checklistId
          };

          return {
            modificationRequests: updatedRequests,
            notifications: [...state.notifications, {
              ...notification,
              id: `notif-${Date.now()}`,
              createdAt: new Date().toISOString()
            }],
            activities: [...state.activities, {
              ...activity,
              id: `activity-${Date.now()}`,
              timestamp: new Date().toISOString()
            }]
          };
        });
      },

      // Reject modification request
      rejectModificationRequest: (requestId: string, adminId: string, note?: string) => {
        set((state) => {
          const requestIndex = state.modificationRequests.findIndex(req => req.id === requestId);
          if (requestIndex === -1) return state;

          const request = state.modificationRequests[requestIndex];
          const updatedRequest: ModificationRequest = {
            ...request,
            status: 'rejected',
            reviewedAt: new Date().toISOString(),
            reviewedBy: adminId,
            reviewNote: note
          };

          const updatedRequests = [...state.modificationRequests];
          updatedRequests[requestIndex] = updatedRequest;

          // Add notification
          const notification: Omit<AdminNotification, 'id' | 'createdAt'> = {
            type: 'modification_request',
            title: 'So\'rov rad etildi',
            message: `${request.customerName} checklist o'zgartirish so'rovi rad etildi`,
            isRead: false,
            relatedId: requestId,
            priority: 'medium'
          };

          // Add activity
          const activity: Omit<AdminActivity, 'id' | 'timestamp'> = {
            type: 'request_rejected',
            description: `${adminId} tomonidan ${request.customerName} checklist o'zgartirish so'rovi rad etildi`,
            user: adminId,
            relatedId: request.checklistId
          };

          return {
            modificationRequests: updatedRequests,
            notifications: [...state.notifications, {
              ...notification,
              id: `notif-${Date.now()}`,
              createdAt: new Date().toISOString()
            }],
            activities: [...state.activities, {
              ...activity,
              id: `activity-${Date.now()}`,
              timestamp: new Date().toISOString()
            }]
          };
        });
      },

      // Add notification
      addNotification: (notification: Omit<AdminNotification, 'id' | 'createdAt'>) => {
        set((state) => ({
          notifications: [...state.notifications, {
            ...notification,
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            createdAt: new Date().toISOString()
          }]
        }));
      },

      // Mark notification as read
      markNotificationAsRead: (notificationId: string) => {
        set((state) => ({
          notifications: state.notifications.map(notif => 
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        }));
      },

      // Mark all notifications as read
      markAllNotificationsAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(notif => ({ ...notif, isRead: true }))
        }));
      },

      // Add activity
      addActivity: (activity: Omit<AdminActivity, 'id' | 'timestamp'>) => {
        set((state) => ({
          activities: [...state.activities, {
            ...activity,
            id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            timestamp: new Date().toISOString()
          }].slice(-100) // Keep only last 100 activities
        }));
      },

      // Get stats
      getStats: (): AdminStats => {
        const state = get();
        const today = new Date().toDateString();
        
        return {
          pendingRequests: state.modificationRequests.filter(req => req.status === 'pending').length,
          totalChecklists: state.modificationRequests.length,
          todaysChecklists: state.modificationRequests.filter(req => 
            new Date(req.createdAt).toDateString() === today
          ).length,
          unreadNotifications: state.notifications.filter(notif => !notif.isRead).length,
          recentActivity: state.activities.slice(-10).reverse() // Last 10 activities, newest first
        };
      },

      // Get pending requests
      getPendingRequests: () => {
        return get().modificationRequests.filter(req => req.status === 'pending');
      },

      // Get request by ID
      getRequestById: (requestId: string) => {
        return get().modificationRequests.find(req => req.id === requestId) || null;
      },

      // Clear old activities (keep last 100)
      clearOldActivities: () => {
        set((state) => ({
          activities: state.activities.slice(-100)
        }));
      }
    }),
    {
      name: 'navbahor-admin-storage',
      version: 1,
    }
  )
);