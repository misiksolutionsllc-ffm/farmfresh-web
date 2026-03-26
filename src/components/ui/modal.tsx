'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant?: 'dialog' | 'sheet';
  title?: string;
  maxWidth?: string;
}

export function Modal({
  open,
  onClose,
  children,
  variant = 'sheet',
  title,
  maxWidth = 'max-w-lg',
}: ModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (open) {
      setShow(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      const t = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(t);
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!show && !open) return null;

  return (
    <div className={cn('fixed inset-0 z-50', open ? 'pointer-events-auto' : 'pointer-events-none')}>
      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      {/* Content */}
      <div
        className={cn(
          'relative z-10 h-full flex',
          variant === 'sheet'
            ? 'items-end lg:items-center justify-center'
            : 'items-center justify-center p-4'
        )}
      >
        <div
          className={cn(
            'relative w-full bg-surface-900 border border-white/5 overflow-hidden',
            variant === 'sheet'
              ? 'rounded-t-3xl lg:rounded-3xl max-h-[90dvh]'
              : 'rounded-3xl max-h-[85dvh]',
            maxWidth,
            open
              ? variant === 'sheet' ? 'modal-sheet' : 'modal-content'
              : 'translate-y-full lg:translate-y-0 opacity-0'
          )}
        >
          {/* Sheet handle */}
          {variant === 'sheet' && (
            <div className="flex justify-center pt-3 pb-1 lg:hidden">
              <div className="w-10 h-1 rounded-full bg-white/10" />
            </div>
          )}

          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="overflow-y-auto max-h-[calc(90dvh-80px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Confirmation Dialog
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} variant="dialog" maxWidth="max-w-sm">
      <div className="p-6 text-center">
        <div className="text-4xl mb-4">{destructive ? '⚠️' : '🤔'}</div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-2xl bg-white/5 text-slate-300 font-medium hover:bg-white/10 transition-all active:scale-[0.97]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={cn(
              'flex-1 px-4 py-3 rounded-2xl font-semibold text-white transition-all active:scale-[0.97]',
              destructive ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
