"use client";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle, Trash2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Tasdiqlash",
  message = "Ushbu amalni bajarishni xohlaysizmi?",
  confirmText = "Tasdiqlash",
  cancelText = "Bekor qilish",
  type = "warning",
  isLoading = false
}: ConfirmModalProps) {
  const iconMap = {
    danger: <Trash2 className="h-8 w-8 text-red-500" />,
    warning: <AlertTriangle className="h-8 w-8 text-yellow-500" />,
    info: <AlertTriangle className="h-8 w-8 text-blue-500" />
  };

  const buttonColorMap = {
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-yellow-600 hover:bg-yellow-700 text-white", 
    info: "bg-blue-600 hover:bg-blue-700 text-white"
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="text-center p-6">
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          {iconMap[type]}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={`min-w-[100px] ${buttonColorMap[type]}`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Bajarilmoqda...
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}