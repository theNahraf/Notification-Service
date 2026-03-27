import { useEffect, useState, createContext, useContext } from "react";
import { X, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function addToast(message, type = "info", duration = 4000) {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) setTimeout(() => removeToast(id), duration);
  }

  function removeToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-96">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />,
    error: <XCircle className="h-5 w-5 text-red-500 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-neutral-400 shrink-0" />
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-surface-border bg-white px-4 py-3.5 shadow-lg transition-all duration-300 ${
        visible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
      }`}
    >
      {icons[toast.type] || icons.info}
      <p className="flex-1 text-sm text-ink">{toast.message}</p>
      <button onClick={onClose} className="text-ink-subtle hover:text-ink shrink-0">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}
