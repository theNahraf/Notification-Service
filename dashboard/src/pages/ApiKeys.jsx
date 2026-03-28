import { useEffect, useState } from "react";
import { useProject } from "../contexts/ProjectContext";
import { useToast } from "../components/Toast";
import api from "../lib/api";
import Modal from "../components/Modal";
import { PageLoader } from "../components/LoadingSpinner";
import { Key, Plus, Copy, Eye, EyeOff, RotateCcw, Trash2 } from "lucide-react";

export default function ApiKeys() {
  const { current } = useProject();
  const { addToast } = useToast();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newKey, setNewKey] = useState(null);
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    if (!current) return;
    setLoading(true);
    try {
      const res = await api.get(`/v1/projects/${current.id}/keys`);
      setKeys(res.data.data || []);
    } catch {
      setKeys([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [current?.id]);

  async function createKey(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post(`/v1/projects/${current.id}/keys`, { label: label || "Default" });
      setNewKey(res.data.data);
      setLabel("");
      await load();
    } catch (e) {
      addToast(e.response?.data?.message || "Failed to create key", "error");
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(keyId) {
    if (!confirm("Revoke this API key? It will immediately stop working.")) return;
    try {
      await api.delete(`/v1/projects/${current.id}/keys/${keyId}`);
      addToast("API key revoked", "success");
      await load();
    } catch (e) {
      addToast(e.response?.data?.message || "Failed to revoke key", "error");
    }
  }

  async function regenerateKey(keyId) {
    if (!confirm("Regenerate this key? The old key will be revoked immediately.")) return;
    try {
      const res = await api.post(`/v1/projects/${current.id}/keys/${keyId}/regenerate`);
      setNewKey(res.data.data);
      addToast("Key regenerated", "success");
      await load();
    } catch (e) {
      addToast(e.response?.data?.message || "Failed to regenerate key", "error");
    }
  }

  function copyKey() {
    if (newKey?.apiKey) {
      navigator.clipboard.writeText(newKey.apiKey);
      addToast("API key copied to clipboard", "success");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">API Keys</h1>
        <p className="mt-1 text-sm text-ink-muted">Manage API keys for this project. Keys are shown only once at creation.</p>
      </div>

      <div className="card">
        <form onSubmit={createKey} className="flex flex-wrap items-end gap-3 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="label">Label</label>
            <input className="input" placeholder="e.g. Production, Staging" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <button type="submit" disabled={creating} className="btn btn-primary gap-1">
            <Plus className="h-4 w-4" />
            {creating ? "Creating…" : "Create Key"}
          </button>
        </form>

        {loading ? <PageLoader /> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Prefix</th>
                  <th>Label</th>
                  <th>Status</th>
                  <th>Last Used</th>
                  <th>Created</th>
                  <th className="w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-ink-subtle" />
                        <code className="rounded bg-surface-muted px-2 py-0.5 text-xs font-mono">{k.key_prefix}…</code>
                      </div>
                    </td>
                    <td className="text-sm">{k.label}</td>
                    <td>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        k.active ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"
                      }`}>
                        {k.active ? "Active" : "Revoked"}
                      </span>
                    </td>
                    <td className="text-xs text-ink-muted">{k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "Never"}</td>
                    <td className="whitespace-nowrap text-xs text-ink-muted">{new Date(k.created_at).toLocaleString()}</td>
                    <td>
                      {k.active && (
                        <div className="flex gap-1">
                          <button onClick={() => regenerateKey(k.id)} className="btn btn-secondary !p-1.5" title="Regenerate">
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => revokeKey(k.id)} className="btn btn-danger !p-1.5" title="Revoke">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !keys.length && <p className="py-8 text-center text-sm text-ink-muted">No API keys yet. Create one above.</p>}
      </div>

      {/* Show key once modal */}
      <Modal open={!!newKey} onClose={() => setNewKey(null)} title="API Key Created">
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-800 mb-2">⚠️ Copy this key now — you won't be able to see it again!</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all rounded-lg bg-white px-3 py-2 text-sm font-mono border border-amber-200">
                {newKey?.apiKey}
              </code>
              <button onClick={copyKey} className="btn btn-primary !p-2.5 shrink-0">
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="text-xs text-ink-muted space-y-1">
            <p><strong>Label:</strong> {newKey?.label}</p>
            <p><strong>Prefix:</strong> {newKey?.key_prefix}…</p>
          </div>
          <button onClick={() => setNewKey(null)} className="btn btn-primary w-full">
            I've saved the key
          </button>
        </div>
      </Modal>
    </div>
  );
}
