"use client";
import { useEffect, useRef, ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  isLoading?: boolean;
  preventScroll?: boolean;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-7xl"
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  overlayClassName,
  contentClassName,
  isLoading = false,
  preventScroll = true,
  ariaLabelledBy,
  ariaDescribedBy
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);
  const isFirstRender = useRef(true);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;

      // Set focus to modal after a brief delay to ensure it's rendered
      const timer = setTimeout(() => {
        modalRef.current?.focus();
      }, 10);

      return () => clearTimeout(timer);
    } else {
      // Restore focus when modal closes
      if (previousActiveElement.current && 'focus' in previousActiveElement.current) {
        (previousActiveElement.current as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  // Body scroll prevention
  useEffect(() => {
    if (!preventScroll) return;

    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen, preventScroll]);

  // Keyboard event handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key handling
      if (e.key === 'Escape' && closeOnEscape && !isLoading) {
        onClose();
        return;
      }

      // Focus trap implementation
      if (e.key === 'Tab') {
        const modal = modalRef.current;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, isLoading, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdropClick && !isLoading) {
      onClose();
    }
  };

  // Prevent touch scrolling on backdrop
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-white/60 dark:bg-black/60 backdrop-blur-[6px]", // Lighter blur, cleaner overlay
        "transition-opacity duration-200",
        overlayClassName
      )}
      onClick={handleBackdropClick}
      onTouchMove={handleTouchMove} // Prevent scroll on mobile
      style={{ touchAction: 'none' }}
    >
      <div
        ref={modalRef}
        className={cn(
          "relative glass-card shadow-2xl", // Use glass-card utility
          "w-full mx-4 my-8 max-h-[calc(100vh-4rem)] overflow-hidden",
          "focus:outline-none",
          "animate-in zoom-in-95 fade-in duration-300 slide-in-from-bottom-4", // Enhance animation
          "rounded-[2rem]", // rounded-3xl equivalent or slightly more
          sizeClasses[size],
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy || (title ? "modal-title" : undefined)}
        aria-describedby={ariaDescribedBy || (description ? "modal-description" : undefined)}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex-1 min-w-0">
              {title && (
                <h2
                  id={ariaLabelledBy || "modal-title"}
                  className="text-lg font-semibold text-foreground truncate"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id={ariaDescribedBy || "modal-description"}
                  className="text-sm text-muted-foreground mt-1"
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isLoading}
                className="h-8 w-8 p-0 ml-4 flex-shrink-0"
                aria-label="Modalni yopish"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn("overflow-auto", contentClassName)}>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );

  // Render in portal for better z-index management
  return typeof window !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}