import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomSelect({ options, value, onChange, className = "w-32", placeholder = "Select" }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => String(o.value) === String(value));

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="input flex w-full items-center justify-between gap-2 shadow-sm text-left bg-white"
      >
        <span className="truncate text-ink">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-ink-subtle transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-1 z-50 min-w-full w-max overflow-hidden rounded-xl border border-surface-border bg-white p-1.5 shadow-xl"
          >
            <div className="max-h-60 overflow-y-auto w-full">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm text-left transition-colors ${
                    String(value) === String(opt.value)
                      ? "bg-neutral-100 text-ink font-semibold"
                      : "text-ink hover:bg-neutral-50 hover:text-ink"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {String(value) === String(opt.value) && <Check className="h-3.5 w-3.5 shrink-0 text-ink" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
