import { useEffect, useState } from "react";
import { useToast } from "../components/Toast";
import api from "../lib/api";
import { PageLoader } from "../components/LoadingSpinner";
import { Users, Shield, ShieldCheck } from "lucide-react";

export default function AdminUsers() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/v1/auth/users");
      setUsers(res.data.data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleRole(userId, currentRole) {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`Change role to ${newRole}?`)) return;
    try {
      await api.patch(`/v1/auth/users/${userId}/role`, { role: newRole });
      addToast(`Role updated to ${newRole}`, "success");
      await load();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update role", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">All Users</h1>
        <p className="mt-1 text-sm text-ink-muted">Admin view — manage all platform users.</p>
      </div>

      <div className="card">
        {loading ? <PageLoader /> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th className="w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="font-medium">{u.name}</td>
                    <td className="text-sm">{u.email}</td>
                    <td>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        u.role === "ADMIN"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-neutral-50 text-neutral-600 border border-neutral-200"
                      }`}>
                        {u.role === "ADMIN" ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="text-xs text-ink-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => toggleRole(u.id, u.role)}
                        className="btn btn-secondary text-xs"
                      >
                        {u.role === "ADMIN" ? "Make User" : "Make Admin"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
