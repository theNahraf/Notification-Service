import { useEffect, useState } from "react";
import { useProject } from "../contexts/ProjectContext";
import api from "../lib/api";
import Badge from "../components/Badge";
import Pagination from "../components/Pagination";
import { PageLoader } from "../components/LoadingSpinner";

export default function Notifications() {
  const { current } = useProject();
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  async function load() {
    if (!current) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ projectId: current.id, limit: String(limit), offset: String(offset) });
      if (status) params.set("status", status);
      const res = await api.get(`/v1/dashboard/notifications?${params}`);
      setData(res.data.data || { items: [], total: 0 });
    } catch {
      setData({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [current?.id, offset, status]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Notifications</h1>
        <p className="mt-1 text-sm text-ink-muted">All notifications for this project.</p>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <div>
            <label className="label">Status</label>
            <select className="input w-40" value={status} onChange={(e) => { setStatus(e.target.value); setOffset(0); }}>
              <option value="">All</option>
              <option value="queued">Queued</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="retrying">Retrying</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={load}>Refresh</button>
        </div>

        {loading ? <PageLoader /> : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Recipient</th>
                    <th>Subject</th>
                    <th>Event</th>
                    <th>Status</th>
                    <th>Attempts</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((n) => (
                    <tr key={n.id}>
                      <td className="font-mono text-xs">{n.id?.slice(0, 16)}…</td>
                      <td className="max-w-[180px] truncate">{n.recipient_email}</td>
                      <td className="max-w-[200px] truncate text-xs">{n.subject}</td>
                      <td className="text-xs text-ink-muted">{n.event_name || "direct"}</td>
                      <td>
                        <Badge variant={n.status === "sent" ? "success" : n.status === "failed" ? "danger" : n.status === "retrying" ? "warning" : "default"}>
                          {n.status}
                        </Badge>
                      </td>
                      <td className="tabular-nums">{n.attempts}</td>
                      <td className="whitespace-nowrap text-xs text-ink-muted">{new Date(n.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!data.items.length && <p className="py-8 text-center text-sm text-ink-muted">No notifications found.</p>}
            <Pagination total={data.total} limit={limit} offset={offset} onChange={setOffset} />
          </>
        )}
      </div>
    </div>
  );
}
