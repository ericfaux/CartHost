"use client";

import { useEffect, useCallback, type ReactNode } from "react";
import { X } from "lucide-react";
import { IconButton } from "./Button";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
  closeOnOverlay = true,
  closeOnEscape = true,
  showCloseButton = true,
}: ModalProps) {
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="dossier-overlay"
        onClick={closeOnOverlay ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={`
          relative z-[51] w-full ${sizeClasses[size]}
          dossier-panel-elevated
          max-h-[90vh] overflow-hidden flex flex-col
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 p-6 border-b border-rule">
            <div className="space-y-1">
              {title && (
                <h2
                  id="modal-title"
                  className="font-heading text-dossier-subtitle text-ink"
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-dossier-caption text-ink-subtle">{subtitle}</p>
              )}
            </div>
            {showCloseButton && (
              <IconButton
                icon={<X className="h-5 w-5" />}
                label="Close"
                onClick={onClose}
              />
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-rule bg-paper">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Drawer variant (slides in from right)
export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  caseLabel?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  caseLabel,
  children,
  footer,
}: DrawerProps) {
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="dossier-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "drawer-title" : undefined}
        className="dossier-drawer animate-in slide-in-from-right"
      >
        {/* Header */}
        <div className="dossier-drawer-header">
          <div className="flex items-center gap-3">
            {title && (
              <h2
                id="drawer-title"
                className="font-heading text-dossier-subtitle text-ink"
              >
                {title}
              </h2>
            )}
            {caseLabel && (
              <span className="dossier-case-label">{caseLabel}</span>
            )}
          </div>
          <IconButton
            icon={<X className="h-5 w-5" />}
            label="Close"
            onClick={onClose}
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-rule bg-surface">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Confirmation dialog
export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="dossier-btn-secondary"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={
              variant === "danger"
                ? "dossier-btn-destructive"
                : "dossier-btn-primary"
            }
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-ink-subtle">{message}</p>
    </Modal>
  );
}
