"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useBackendLabStore } from "@/stores/backendLabStore";
import { useAuthStore } from "@/stores/authStore";
import type { LabSample, LabStatus } from "@/types/lab";

interface ApprovalAction {
  id: string;
  sampleId: string;
  action: "approve" | "reject" | "request_changes";
  reason?: string;
  comments?: string;
  approver: string;
  timestamp: string;
  changes?: {
    field: keyof LabSample;
    oldValue: any;
    newValue: any;
    reason: string;
  }[];
}

interface LabApprovalSystemProps {
  isOpen: boolean;
  onClose: () => void;
  sample: LabSample | null;
}

export function LabApprovalSystem({ isOpen, onClose, sample }: LabApprovalSystemProps) {
  const { approveSample, rejectSample, updateSample } = useBackendLabStore();
  const { user } = useAuthStore();

  const [approvalStep, setApprovalStep] = useState<"review" | "action" | "changes" | "confirm">("review");
  const [selectedAction, setSelectedAction] = useState<"approve" | "reject" | "request_changes">("approve");
  const [approvalComments, setApprovalComments] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [requestedChanges, setRequestedChanges] = useState<ApprovalAction["changes"]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation states
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [criticalIssues, setCriticalIssues] = useState<string[]>([]);

  // Approval history - Real data from backend
  const [approvalHistory, setApprovalHistory] = useState<ApprovalAction[]>([]);

  useEffect(() => {
    if (sample && isOpen) {
      validateSampleData();
      // Load real approval history from backend
      // TODO: Implement loadApprovalHistory when backend endpoint is ready
    }
  }, [sample, isOpen]);

  const validateSampleData = () => {
    if (!sample) return;

    const errors: string[] = [];
    const critical: string[] = [];

    // Critical validations
    if (!sample.moisture || sample.moisture < 0 || sample.moisture > 20) {
      critical.push("Namlik foizi noto'g'ri (0-20% oraliqda bo'lishi kerak)");
    }

    if (!sample.trash || sample.trash < 0 || sample.trash > 15) {
      critical.push("Ifloslik foizi noto'g'ri (0-15% oraliqda bo'lishi kerak)");
    }

    if (!sample.strength || sample.strength < 20 || sample.strength > 50) {
      critical.push("Pishiqlik noto'g'ri (20-50 oraliqda bo'lishi kerak)");
    }

    if (!sample.lengthMm || sample.lengthMm < 15 || sample.lengthMm > 40) {
      critical.push("Uzunlik noto'g'ri (15-40mm oraliqda bo'lishi kerak)");
    }

    // Standard validations
    if (!sample.analyst) {
      errors.push("Tahlilchi ko'rsatilmagan");
    }

    if (!sample.comment || sample.comment.length < 10) {
      errors.push("Izoh juda qisqa (kamida 10 ta belgi bo'lishi kerak)");
    }

    if (sample.grade === "IFLOS" && sample.trash < 5) {
      errors.push("Iflos sinfi uchun ifloslik 5%dan yuqori bo'lishi kerak");
    }

    setValidationErrors(errors);
    setCriticalIssues(critical);
  };

  const loadApprovalHistory = () => {
    // Mock approval history - would come from API
    setApprovalHistory([
      {
        id: "1",
        sampleId: sample?.id || "",
        action: "request_changes",
        reason: "Ma'lumotlar to'liq emas",
        comments: "Namlik va pishiqlik qiymatlari qayta o'lchanishi kerak",
        approver: "Sardor Karimov",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        changes: [
          {
            field: "moisture",
            oldValue: 12.5,
            newValue: 11.8,
            reason: "Qayta o'lchangan"
          }
        ]
      }
    ]);
  };

  const handleApprovalAction = async () => {
    if (!sample || !user) return;

    setIsSubmitting(true);

    try {
      const action: ApprovalAction = {
        id: Date.now().toString(),
        sampleId: sample.id,
        action: selectedAction,
        reason: rejectionReason,
        comments: approvalComments,
        approver: user.username || "Unknown",
        timestamp: new Date().toISOString(),
        changes: requestedChanges
      };

      // Add to history
      setApprovalHistory(prev => [action, ...prev]);

      // Update sample status using the integrated store methods
      if (selectedAction === "approve") {
        await approveSample(sample.toyId);
      } else if (selectedAction === "reject") {
        await rejectSample(sample.toyId, rejectionReason);
      }

      // Apply requested changes if any
      if (requestedChanges && requestedChanges.length > 0 && selectedAction === "request_changes") {
        const changes: Partial<LabSample> = {};
        requestedChanges.forEach(change => {
          (changes as any)[change.field] = change.newValue;
        });
        updateSample(sample.id, changes);
      }

      // Show success and close
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
        resetForm();
      }, 1000);

    } catch (error) {
      console.error("Tasdiqlashda xato:", error);
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setApprovalStep("review");
    setSelectedAction("approve");
    setApprovalComments("");
    setRejectionReason("");
    setRequestedChanges([]);
    setValidationErrors([]);
    setCriticalIssues([]);
  };

  const addRequestedChange = () => {
    setRequestedChanges(prev => [
      ...(prev || []),
      {
        field: "moisture",
        oldValue: "",
        newValue: "",
        reason: ""
      }
    ]);
  };

  const updateRequestedChange = (index: number, field: string, value: any) => {
    setRequestedChanges(prev =>
      prev ? prev.map((change, i) =>
        i === index ? { ...change, [field]: value } : change
      ) : []
    );
  };

  const removeRequestedChange = (index: number) => {
    setRequestedChanges(prev => prev ? prev.filter((_, i) => i !== index) : []);
  };

  const canApprove = () => {
    return criticalIssues.length === 0 && validationErrors.length === 0;
  };

  const getActionButtonText = () => {
    switch (selectedAction) {
      case "approve": return "Tasdiqlash";
      case "reject": return "Rad etish";
      case "request_changes": return "O'zgarish so'rash";
      default: return "Bajarish";
    }
  };

  const getActionButtonColor = () => {
    switch (selectedAction) {
      case "approve": return "bg-green-600 hover:bg-green-700";
      case "reject": return "bg-red-600 hover:bg-red-700";
      case "request_changes": return "bg-yellow-600 hover:bg-yellow-700";
      default: return "bg-blue-600 hover:bg-blue-700";
    }
  };

  if (!sample) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Laboratoriya xulosasini tasdiqlash" size="xl">
      <div className="space-y-6">

        {/* Sample Information Summary */}
        <Card className="p-4 bg-gray-50">
          <h4 className="font-semibold mb-3">Namuna ma'lumotlari</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Marka:</span>
              <div className="font-medium">{sample.markaLabel}</div>
            </div>
            <div>
              <span className="text-gray-600">Mahsulot turi:</span>
              <div className="font-medium capitalize">{sample.productType}</div>
            </div>
            <div>
              <span className="text-gray-600">Namlik:</span>
              <div className="font-medium">{sample.moisture}%</div>
            </div>
            <div>
              <span className="text-gray-600">Sinf:</span>
              <div className="font-medium">{sample.grade}</div>
            </div>
          </div>
        </Card>

        {/* Validation Results */}
        {(criticalIssues.length > 0 || validationErrors.length > 0) && (
          <Card className="p-4">
            <h4 className="font-semibold mb-3">Tekshiruv natijalari</h4>

            {criticalIssues.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-red-600 mb-2">Jiddiy muammolar:</h5>
                <ul className="list-disc pl-5 space-y-1">
                  {criticalIssues.map((issue, index) => (
                    <li key={index} className="text-red-600 text-sm">{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {validationErrors.length > 0 && (
              <div>
                <h5 className="font-medium text-yellow-600 mb-2">Ogohlantirishlar:</h5>
                <ul className="list-disc pl-5 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-yellow-600 text-sm">{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}

        {/* Approval History */}
        {approvalHistory.length > 0 && (
          <Card className="p-4">
            <h4 className="font-semibold mb-3">Tasdiqlash tarixi</h4>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {approvalHistory.map((action) => (
                <div key={action.id} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {action.action === "approve" && "Tasdiqlandi"}
                        {action.action === "reject" && "Rad etildi"}
                        {action.action === "request_changes" && "O'zgarish so'ralgan"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {action.approver} • {new Date(action.timestamp).toLocaleString("uz-UZ")}
                      </div>
                      {action.comments && (
                        <div className="text-sm mt-1">{action.comments}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Action Selection */}
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Tasdiqlash harakati</h4>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Button
              variant={selectedAction === "approve" ? "default" : "outline"}
              onClick={() => setSelectedAction("approve")}
              disabled={!canApprove()}
              className="justify-center"
            >
              ✅ Tasdiqlash
            </Button>
            <Button
              variant={selectedAction === "request_changes" ? "default" : "outline"}
              onClick={() => setSelectedAction("request_changes")}
              className="justify-center"
            >
              🔄 O'zgarish so'rash
            </Button>
            <Button
              variant={selectedAction === "reject" ? "default" : "outline"}
              onClick={() => setSelectedAction("reject")}
              className="justify-center"
            >
              ❌ Rad etish
            </Button>
          </div>

          {/* Action-specific forms */}
          <div className="space-y-4">
            {selectedAction === "approve" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tasdiqlash izohi (ixtiyoriy)
                </label>
                <textarea
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  placeholder="Qo'shimcha izohlar..."
                  className="w-full p-3 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
            )}

            {selectedAction === "reject" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rad etish sababi *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Nima uchun rad etilayotganini tushuntiring..."
                  className="w-full p-3 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
              </div>
            )}

            {selectedAction === "request_changes" && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium">
                    So'ralgan o'zgarishlar
                  </label>
                  <Button size="sm" onClick={addRequestedChange}>
                    + O'zgarish qo'shish
                  </Button>
                </div>

                <div className="space-y-3">
                  {requestedChanges?.map((change, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Maydon</label>
                          <select
                            value={change.field}
                            onChange={(e) => updateRequestedChange(index, "field", e.target.value)}
                            className="w-full p-2 text-sm border border-gray-300 rounded"
                          >
                            <option value="moisture">Namlik</option>
                            <option value="trash">Ifloslik</option>
                            <option value="strength">Pishiqlik</option>
                            <option value="lengthMm">Uzunlik</option>
                            <option value="grade">Sinf</option>
                            <option value="navi">Navi</option>
                            <option value="comment">Izoh</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Yangi qiymat</label>
                          <Input
                            value={change.newValue}
                            onChange={(e) => updateRequestedChange(index, "newValue", e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Sabab</label>
                        <Input
                          value={change.reason}
                          onChange={(e) => updateRequestedChange(index, "reason", e.target.value)}
                          placeholder="O'zgarish sababi..."
                          className="text-sm"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeRequestedChange(index)}
                        className="mt-2 text-red-600"
                      >
                        O'chirish
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">
                    Qo'shimcha izohlar
                  </label>
                  <textarea
                    value={approvalComments}
                    onChange={(e) => setApprovalComments(e.target.value)}
                    placeholder="O'zgarishlar haqida batafsil tushuntiring..."
                    className="w-full p-3 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Bekor qilish
          </Button>
          <Button
            onClick={handleApprovalAction}
            disabled={
              isSubmitting ||
              (selectedAction === "reject" && !rejectionReason.trim()) ||
              (selectedAction === "approve" && !canApprove())
            }
            className={getActionButtonColor()}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Bajarilmoqda...
              </>
            ) : (
              getActionButtonText()
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}