import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  durationMs?: number;
}

interface ToastItem extends Required<ToastOptions> {
  message: string;
}

interface ToastContextValue {
  show: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const show = useCallback((message: string, options?: ToastOptions) => {
    const id = options?.id ?? `t_${Date.now()}_${counterRef.current++}`;
    const toast: ToastItem = {
      id,
      message,
      type: options?.type ?? 'info',
      durationMs: options?.durationMs ?? 2500,
    };
    setItems((prev) => [...prev, toast]);
    // 自动移除
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, toast.durationMs);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer items={items} onClose={(id) => setItems((prev) => prev.filter((t) => t.id !== id))} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ items, onClose }: { items: ToastItem[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <div className="absolute top-4 right-4 space-y-2">
        {items.map((t) => (
          <ToastCard key={t.id} item={t} onClose={() => onClose(t.id)} />
        ))}
      </div>
    </div>
  );
}

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const color =
    item.type === 'success'
      ? 'from-emerald-500 to-green-600'
      : item.type === 'error'
      ? 'from-rose-500 to-red-600'
      : item.type === 'warning'
      ? 'from-amber-500 to-yellow-600'
      : 'from-blue-500 to-indigo-600';

  return (
    <div className={`pointer-events-auto min-w-[240px] max-w-[360px] text-white rounded-xl shadow-lg backdrop-blur bg-gradient-to-r ${color} overflow-hidden`}>
      <div className="px-4 py-3 flex items-start gap-3">
        <div className="shrink-0 pt-0.5">
          {item.type === 'success' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {item.type === 'error' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {item.type === 'warning' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86A2.07 2.07 0 0021 16.93L13.93 4.07a2.07 2.07 0 00-3.86 0L3 16.93A2.07 2.07 0 005.07 19z" />
            </svg>
          )}
          {item.type === 'info' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
          )}
        </div>
        <div className="flex-1 text-sm leading-6">{item.message}</div>
        <button onClick={onClose} className="opacity-80 hover:opacity-100" aria-label="关闭通知" title="关闭">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}


