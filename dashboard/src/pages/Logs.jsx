import { useEffect, useState, Fragment } from "react";
import { useProject } from "../contexts/ProjectContext";
import api from "../lib/api";
import Badge from "../components/Badge";
import Pagination from "../components/Pagination";
import { PageLoader } from "../components/LoadingSpinner";
import { ChevronDown, ChevronRight, Download, Search, Filter } from "lucide-react";

export default function Logs() {
  const { current } = useProject();
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState("");
  const [service, setService] = useState("");
  const [q, setQ] = useState("");
  const [offset, setOffset] = useState(0);
  const [expanded, setExpanded] = useState(() => new Set());
  const limit = 30;

  async function load() {
    if (!current) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ projectId: current.id, limit: String(limit), offset: String(offset) });
      if (level) params.set("level", level);
      if (service) params.set("service", service);
      if (q.trim()) params.set("q", q.trim());
      const res = await api.get(`/v1/dashboard/logs?${params}`);
      setData(res.data.data || { items: [], total: 0 });
    } catch {
      setData({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [current?.id, offset]);

  async function exportLogs(format) {
    const base = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const token = localStorage.getItem("ntf_token");
    const params = new URLSearchParams({ format, limit: "2000", projectId: current.id });
    if (level) params.set("level", level);
    if (q.trim()) params.set("q", q.trim());
    const res = await fetch(`${base}/v1/dashboard/logs/export?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function toggleRow(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function parseMetadata(raw) {
    if (raw == null) return null;
    if (typeof raw === "object") return raw;
    try { return JSON.parse(raw); } catch { return { _raw: String(raw) }; }
  }

  const levelColors = {
    info: "default",
    warn: "warning",
    error: "danger"
  };

  const serviceColors = {
    api: "bg-blue-50 text-blue-700 border-blue-200",
    worker: "bg-purple-50 text-purple-700 border-purple-200"
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Activity Logs</h1>
        <p className="mt-1 text-sm text-ink-muted">Structured audit trail with filtering and export.</p>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-end gap-3 mb-5">
          <div>
            <label className="label">Level</label>
            <select className="input w-32" value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">All</option>
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div>
            <label className="label">Service</label>
            <select className="input w-32" value={service} onChange={(e) => setService(e.target.value)}>
              <option value="">All</option>
              <option value="api">API</option>
              <option value="worker">Worker</option>
            </select>
          </div>
          <div className="min-w-[200px] flex-1">
            <label className="label">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
              <input
                className="input pl-10"
                placeholder="Search events or metadata…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load()}
              />
            </div>
          </div>
          <button className="btn btn-primary gap-1" onClick={() => { setOffset(0); load(); }}>
            <Filter className="h-4 w-4" />
            Apply
          </button>
          <div className="ml-auto flex gap-2">
            <button className="btn btn-secondary text-sm gap-1" onClick={() => exportLogs("json")}>
              <Download className="h-3.5 w-3.5" />
              JSON
            </button>
            <button className="btn btn-secondary text-sm gap-1" onClick={() => exportLogs("csv")}>
              <Download className="h-3.5 w-3.5" />
              CSV
            </button>
          </div>
        </div>

        {loading ? <PageLoader /> : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-8" />
                    <th>Time</th>
                    <th>Level</th>
                    <th>Service</th>
                    <th>Event</th>
                    <th>Request ID</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((l) => {
                    const meta = parseMetadata(l.metadata);
                    const open = expanded.has(l.id);
                    return (
                      <Fragment key={l.id}>
                        <tr className="cursor-pointer" onClick={() => toggleRow(l.id)}>
                          <td>
                            <button type="button" className="p-0.5 text-ink-muted hover:text-ink">
                              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                          </td>
                          <td className="whitespace-nowrap text-xs text-ink-muted tabular-nums">
                            {new Date(l.created_at).toLocaleString()}
                          </td>
                          <td>
                            <Badge variant={levelColors[l.level] || "default"}>{l.level}</Badge>
                          </td>
                          <td>
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${serviceColors[l.service] || "bg-neutral-50 text-neutral-600 border-neutral-200"}`}>
                              {l.service}
                            </span>
                          </td>
                          <td className="font-mono text-xs">{l.event}</td>
                          <td className="font-mono text-xs text-ink-muted">{l.request_id || "—"}</td>
                        </tr>
                        {open && (
                          <tr className="bg-neutral-50/80">
                            <td colSpan={6} className="p-4">
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-2">Log Details</p>
                                  <div className="space-y-1 text-xs">
                                    <p><span className="text-ink-muted">ID:</span> <span className="font-mono">{l.id}</span></p>
                                    <p><span className="text-ink-muted">User ID:</span> <span className="font-mono">{l.user_id || "—"}</span></p>
                                    <p><span className="text-ink-muted">API Key:</span> <span className="font-mono">{l.api_key_hash ? l.api_key_hash.slice(0, 12) + "…" : "—"}</span></p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-2">Metadata</p>
                                  <pre className="max-h-48 overflow-auto rounded-lg border border-surface-border bg-white p-3 text-xs text-ink font-mono">
                                    {JSON.stringify(meta, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!data.items.length && <p className="py-8 text-center text-sm text-ink-muted">No log entries.</p>}
            <Pagination total={data.total} limit={limit} offset={offset} onChange={setOffset} />
          </>
        )}
      </div>
    </div>
  );
}
