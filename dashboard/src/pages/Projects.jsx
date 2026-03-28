import { useEffect, useState } from "react";
import { useProject } from "../contexts/ProjectContext";
import { useToast } from "../components/Toast";
import { PageLoader } from "../components/LoadingSpinner";
import { FolderOpen, Plus, Trash2, Check } from "lucide-react";

export default function Projects() {
  const { projects, current, selectProject, createProject, deleteProject, loadProjects, loading } = useProject();
  const { addToast } = useToast();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => { loadProjects(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      await createProject(name.trim());
      setName("");
      addToast("Project created", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to create project", "error");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id, projName) {
    if (!confirm(`Delete project "${projName}"? All associated keys, templates, and notifications will be permanently deleted.`)) return;
    try {
      await deleteProject(id);
      addToast("Project deleted", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to delete project", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Projects</h1>
        <p className="mt-1 text-sm text-ink-muted">Each project has its own API keys, templates, and notifications.</p>
      </div>

      <div className="card">
        <form onSubmit={handleCreate} className="flex gap-3 mb-6">
          <input
            className="input max-w-sm"
            placeholder="New project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit" disabled={creating} className="btn btn-primary gap-1">
            <Plus className="h-4 w-4" />
            {creating ? "Creating…" : "Create"}
          </button>
        </form>

        {loading ? <PageLoader /> : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <div
                key={p.id}
                className={`relative rounded-xl border-2 p-5 transition-all duration-200 cursor-pointer ${
                  p.id === current?.id
                    ? "border-ink bg-ink/[0.02] shadow-md"
                    : "border-surface-border bg-white hover:border-neutral-300 hover:shadow-sm"
                }`}
                onClick={() => selectProject(p)}
              >
                {p.id === current?.id && (
                  <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-ink">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-ink-muted" />
                    <h3 className="font-semibold text-ink">{p.name}</h3>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(p.id, p.name); }}
                    className="text-ink-subtle hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-ink-muted">Created {new Date(p.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
        {!loading && !projects.length && (
          <div className="text-center py-12">
            <FolderOpen className="mx-auto h-12 w-12 text-ink-subtle mb-3" />
            <p className="text-sm text-ink-muted">No projects yet. Create your first project above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
