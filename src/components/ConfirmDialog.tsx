import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
}: ConfirmDialogProps) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex gap-4 touch-pan-y">
        {danger && (
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
        )}
        <p className="flex-1 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>
      </div>
      <div className="flex-none p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900 z-10">
        <Button variant="secondary" onClick={onClose} disabled={confirming}>
          {cancelLabel}
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={handleConfirm} disabled={confirming}>
          {confirming ? 'Working…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}


