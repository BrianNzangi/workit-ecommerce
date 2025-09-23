"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  title?: string;
}

export function Dialog({ open, onOpenChange, children, title }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative bg-white shadow-xs max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-b-gray-200">
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 bg-gray-50 text-gray-300 rounded-full p-0"
            >
              <X size={16} />
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 text-gray-500 border-red-600 ">
          {children}
        </div>
      </div>
    </div>
  );
}

interface DialogContentProps {
  children: ReactNode;
}

export function DialogContent({ children }: DialogContentProps) {
  return <div>{children}</div>;
}

interface DialogHeaderProps {
  children: ReactNode;
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return <div className="mb-4">{children}</div>;
}

interface DialogTitleProps {
  children: ReactNode;
}

export function DialogTitle({ children }: DialogTitleProps) {
  return <h3 className="text-lg font-semibold">{children}</h3>;
}

interface DialogFooterProps {
  children: ReactNode;
}

export function DialogFooter({ children }: DialogFooterProps) {
  return <div className="flex justify-end gap-3 mt-6">{children}</div>;
}
