import { type ReactNode, useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, GripHorizontal } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'compact';
  draggable?: boolean;
}

export function Modal({ open, onClose, title, subtitle, children, size = 'md', draggable = true }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset position whenever modal opens
  useEffect(() => {
    if (open) {
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable) return;
    // Disable dragging on mobile viewports
    if (typeof window !== 'undefined' && window.innerWidth < 640) return;
    // Do not initiate drag if user clicked an interactive control
    if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) return;
    if (e.button !== 0) return;

    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  }, [draggable, position]);

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;
      setPosition({
        x: dragStartRef.current.initialX + dx,
        y: dragStartRef.current.initialY + dy,
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging]);

  if (!open || !mounted) return null;

  const sizeClass =
    size === 'xs'
      ? 'w-full max-w-[320px] max-h-[85vh]'
      : size === 'compact'
      ? 'w-full max-w-[440px] max-h-[85vh]'
      : size === 'sm'
      ? 'w-full max-w-[400px] max-h-[85vh]'
      : size === 'lg'
      ? 'w-full max-w-[580px] max-h-[88vh]'
      : 'w-full max-w-[480px] max-h-[85vh]';

  const modalNode = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto overscroll-contain animate-fade-in">
      {/* Backdrop overlay for click outside */}
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal Card Wrapper */}
      <div
        style={{
          transform: typeof window !== 'undefined' && window.innerWidth >= 640 && draggable && (position.x !== 0 || position.y !== 0)
            ? `translate(${position.x}px, ${position.y}px)`
            : undefined,
          transition: isDragging ? 'none' : 'transform 0.05s ease-out',
        }}
        className={`${sizeClass} my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl animate-scale-in relative z-10`}
      >
        {/* Header */}
        <div
          onPointerDown={handlePointerDown}
          className={`flex-none px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 select-none ${
            draggable ? 'sm:cursor-grab sm:active:cursor-grabbing' : ''
          }`}
          title={draggable ? 'Drag to move modal' : undefined}
        >
          <div className="min-w-0 pr-3 flex items-center gap-2">
            {draggable && <GripHorizontal className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 hidden sm:block flex-shrink-0" />}
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">{title}</h2>
              {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0"
            aria-label="Close modal"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content Container (Form / Body) */}
        {children}
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
}
