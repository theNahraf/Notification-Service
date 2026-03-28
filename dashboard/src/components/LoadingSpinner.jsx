export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} rounded-full border-neutral-200 border-t-neutral-800 animate-spin`} />
    </div>
  );
}

import { motion } from "framer-motion";

export function PageLoader() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.3 }}
      className="flex items-center justify-center py-20"
    >
      <div className="text-center space-y-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-ink-muted animate-pulse">Loading…</p>
      </div>
    </motion.div>
  );
}

export function SkeletonRow({ cols = 4 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-neutral-100 animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  );
}
