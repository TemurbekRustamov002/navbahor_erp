export interface ModificationRequest {
  id: string;
  checklistId: string;
  customerName: string;
  requestedBy: string;
  requestedByRole: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
  checklistSummary: {
    totalToys: number;
    totalWeight: number;
    markasCount: number;
    averageWeight: number;
  };
}

export interface AdminNotification {
  id: string;
  type: 'modification_request' | 'checklist_created' | 'system_alert';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string; // checklistId or requestId
  priority: 'low' | 'medium' | 'high';
}

export interface AdminStats {
  pendingRequests: number;
  totalChecklists: number;
  todaysChecklists: number;
  unreadNotifications: number;
  recentActivity: AdminActivity[];
}

export interface AdminActivity {
  id: string;
  type: 'checklist_created' | 'request_approved' | 'request_rejected' | 'user_action';
  description: string;
  user: string;
  timestamp: string;
  relatedId?: string;
}