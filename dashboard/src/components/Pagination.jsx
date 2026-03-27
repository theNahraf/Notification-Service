import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ total, limit, offset, onChange }) {
  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = Math.floor(offset / limit) + 1;

  if (totalPages <= 1) return null;

  function goTo(page) {
    onChange((page - 1) * limit);
  }

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-xs text-ink-muted">
        {offset + 1}–{Math.min(offset + limit, total)} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          disabled={currentPage === 1}
          onClick={() => goTo(currentPage - 1)}
          className="btn btn-secondary !p-2 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={i} className="px-2 text-xs text-ink-subtle">…</span>
          ) : (
            <button
              key={i}
              onClick={() => goTo(p)}
              className={`btn !px-3 !py-1.5 text-xs ${
                p === currentPage ? "btn-primary" : "btn-secondary"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          disabled={currentPage === totalPages}
          onClick={() => goTo(currentPage + 1)}
          className="btn btn-secondary !p-2 disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
