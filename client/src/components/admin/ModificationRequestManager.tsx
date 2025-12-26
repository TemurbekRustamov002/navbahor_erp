"use client";
import { useState } from "react";
import { useAdminStore } from "@/stores/adminStore";
import { useChecklistStore } from "@/stores/checklistStore";
import { useAuthStore } from "@/stores/authStore";
import { ModificationRequest } from "@/types/admin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Package,
  Calendar,
  MessageSquare,
  Eye
} from "lucide-react";

export function ModificationRequestManager() {
  const { 
    modificationRequests, 
    approveModificationRequest, 
    rejectModificationRequest,
    getStats 
  } = useAdminStore();
  
  const { approveModification } = useChecklistStore();
  const { user } = useAuthStore();
  
  const [selectedRequest, setSelectedRequest] = useState<ModificationRequest | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const stats = getStats();
  const pendingRequests = modificationRequests.filter(req => req.status === 'pending');
  const recentRequests = modificationRequests.slice(-10).reverse();

  const handleApprove = (request: ModificationRequest) => {
    setSelectedRequest(request);
    setActionType('approve');
    setShowDetailModal(true);
  };

  const handleReject = (request: ModificationRequest) => {
    setSelectedRequest(request);
    setActionType('reject');
    setShowDetailModal(true);
  };

  const confirmAction = () => {
    if (!selectedRequest || !user || !actionType) return;

    if (actionType === 'approve') {
      // Approve in admin store
      approveModificationRequest(selectedRequest.id, user.username, reviewNote);
      // Approve in checklist store
      approveModification(selectedRequest.checklistId, user.username);
    } else {
      // Reject in admin store
      rejectModificationRequest(selectedRequest.id, user.username, reviewNote);
    }

    // Reset
    setSelectedRequest(null);
    setActionType(null);
    setReviewNote("");
    setShowDetailModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Kutilmoqda';
      case 'approved': return 'Tasdiqlangan';
      case 'rejected': return 'Rad etilgan';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500'; 
      case 'low': return 'border-l-blue-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</div>
              <div className="text-sm text-gray-600">Kutilayotgan so'rovlar</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalChecklists}</div>
              <div className="text-sm text-gray-600">Jami cheklistlar</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.todaysChecklists}</div>
              <div className="text-sm text-gray-600">Bugungi cheklistlar</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.unreadNotifications}</div>
              <div className="text-sm text-gray-600">O'qilmagan xabarlar</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-yellow-600">
            ⚠️ Kutilayotgan so'rovlar ({pendingRequests.length})
          </h3>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className={`border-l-4 ${getPriorityColor('high')} bg-yellow-50 p-4 rounded-r-lg`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{request.customerName}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{getStatusText(request.status)}</span>
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {request.requestedBy} ({request.requestedByRole})
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(request.createdAt).toLocaleDateString('uz-UZ')}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Sabab: {request.reason}
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-xs">
                      <div>Toylar: <strong>{request.checklistSummary.totalToys}</strong></div>
                      <div>Vazn: <strong>{request.checklistSummary.totalWeight.toFixed(1)}kg</strong></div>
                      <div>Markalar: <strong>{request.checklistSummary.markasCount}</strong></div>
                      <div>O'rtacha: <strong>{request.checklistSummary.averageWeight.toFixed(1)}kg</strong></div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleApprove(request)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Tasdiqlash
                    </Button>
                    <Button
                      onClick={() => handleReject(request)}
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Rad etish
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* All Requests */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Barcha so'rovlar ({modificationRequests.length})
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {recentRequests.map((request) => (
            <div
              key={request.id}
              className={`border rounded-lg p-3 ${request.status === 'pending' ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{request.customerName}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {getStatusText(request.status)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {request.requestedBy} • {new Date(request.createdAt).toLocaleDateString('uz-UZ')}
                    {request.reviewedBy && (
                      <span> • Ko'rib chiqdi: {request.reviewedBy}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-700 mt-1">
                    {request.reason}
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setSelectedRequest(request);
                    setShowDetailModal(true);
                    setActionType(null);
                  }}
                  size="sm"
                  variant="outline"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Detail/Action Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedRequest(null);
          setActionType(null);
          setReviewNote("");
        }}
        title={
          actionType === 'approve' ? "So'rovni tasdiqlash" :
          actionType === 'reject' ? "So'rovni rad etish" : "So'rov tafsilotlari"
        }
      >
        {selectedRequest && (
          <div className="space-y-4">
            {/* Request Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">So'rov ma'lumotlari:</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>Mijoz: <strong>{selectedRequest.customerName}</strong></div>
                <div>So'rov beruvchi: <strong>{selectedRequest.requestedBy}</strong></div>
                <div>Lavozim: <strong>{selectedRequest.requestedByRole}</strong></div>
                <div>Sana: <strong>{new Date(selectedRequest.createdAt).toLocaleDateString('uz-UZ')}</strong></div>
              </div>
              <div className="mt-3">
                <div className="text-sm font-medium">Sabab:</div>
                <div className="text-sm text-gray-700 bg-white p-2 rounded border mt-1">
                  {selectedRequest.reason}
                </div>
              </div>
            </div>

            {/* Checklist Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Checklist xulosasi:</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>Jami toylar: <strong>{selectedRequest.checklistSummary.totalToys} dona</strong></div>
                <div>Jami vazn: <strong>{selectedRequest.checklistSummary.totalWeight.toFixed(2)} kg</strong></div>
                <div>Markalar soni: <strong>{selectedRequest.checklistSummary.markasCount} ta</strong></div>
                <div>O'rtacha vazn: <strong>{selectedRequest.checklistSummary.averageWeight.toFixed(2)} kg/toy</strong></div>
              </div>
            </div>

            {/* Review History */}
            {selectedRequest.reviewedBy && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Ko'rib chiqilgan:</h4>
                <div className="text-sm">
                  <div>Admin: <strong>{selectedRequest.reviewedBy}</strong></div>
                  <div>Vaqt: <strong>{selectedRequest.reviewedAt ? new Date(selectedRequest.reviewedAt).toLocaleString('uz-UZ') : '-'}</strong></div>
                  {selectedRequest.reviewNote && (
                    <div className="mt-2">
                      <div className="font-medium">Izoh:</div>
                      <div className="bg-white p-2 rounded border mt-1">{selectedRequest.reviewNote}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Section */}
            {actionType && selectedRequest.status === 'pending' && (
              <div className={`rounded-lg p-4 ${actionType === 'approve' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h4 className={`font-medium mb-2 ${actionType === 'approve' ? 'text-green-800' : 'text-red-800'}`}>
                  {actionType === 'approve' ? "So'rovni tasdiqlash" : "So'rovni rad etish"}
                </h4>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={actionType === 'approve' ? "Tasdiqlash sababini yozing..." : "Rad etish sababini yozing..."}
                  className="w-full p-2 border rounded-lg h-20 resize-none"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {actionType && selectedRequest.status === 'pending' ? (
                <>
                  <Button
                    onClick={confirmAction}
                    disabled={actionType === 'reject' && !reviewNote.trim()}
                    className={`flex-1 ${actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    {actionType === 'approve' ? '✓ Tasdiqlash' : '✗ Rad etish'}
                  </Button>
                  <Button
                    onClick={() => setActionType(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Bekor qilish
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedRequest(null);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Yopish
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}