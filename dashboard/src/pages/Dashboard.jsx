import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProject } from "../contexts/ProjectContext";
import api from "../lib/api";
import Badge from "../components/Badge";
import { PageLoader } from "../components/LoadingSpinner";
import { ArrowRight, Bell, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function Dashboard() {
  const { current } = useProject();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!current) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      api.get(`/v1/dashboard/notifications?projectId=${current.id}&limit=200`),
      api.get(`/v1/projects/${current.id}`)
    ])
      .then(([nRes, pRes]) => {
        setItems(nRes.data.data?.items || nRes.data.data || []);
        setStats(pRes.data.data?.stats || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [current?.id]);

  if (loading) return <PageLoader />;

  const metrics = stats || { queued: 0, sent: 0, failed: 0, total: 0 };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Overview</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Project: <span className="font-medium text-ink">{current?.name}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Queued / Retrying</p>
            <Clock className="h-5 w-5 text-neutral-300 group-hover:text-amber-500 transition-colors" />
          </div>
          <p className="mt-3 text-3xl font-semibold tabular-nums">{metrics.queued}</p>
        </div>
        <div className="card group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Delivered</p>
            <CheckCircle className="h-5 w-5 text-neutral-300 group-hover:text-emerald-500 transition-colors" />
          </div>
          <p className="mt-3 text-3xl font-semibold tabular-nums text-emerald-700">{metrics.sent}</p>
        </div>
        <div className="card group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Failed (DLQ)</p>
            <AlertTriangle className="h-5 w-5 text-neutral-300 group-hover:text-red-500 transition-colors" />
          </div>
          <p className="mt-3 text-3xl font-semibold tabular-nums text-red-700">{metrics.failed}</p>
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-ink-muted" />
            <h2 className="text-lg font-semibold">Recent Notifications</h2>
          </div>
          <Link to="/dashboard/notifications" className="btn btn-secondary gap-1 text-sm">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>To</th>
                <th>Event</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 8).map((n) => (
                <tr key={n.id}>
                  <td className="font-mono text-xs">{n.id?.slice(0, 16)}…</td>
                  <td className="max-w-[200px] truncate">{n.recipient_email}</td>
                  <td className="text-xs text-ink-muted">{n.event_name || "—"}</td>
                  <td>
                    <Badge variant={n.status === "sent" ? "success" : n.status === "failed" ? "danger" : n.status === "retrying" ? "warning" : "default"}>
                      {n.status}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap text-xs text-ink-muted">{new Date(n.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!items.length && (
          <p className="py-8 text-center text-sm text-ink-muted">No notifications yet. Use the SDK or API to send your first.</p>
        )}
      </div>
    </div>
  );
}
