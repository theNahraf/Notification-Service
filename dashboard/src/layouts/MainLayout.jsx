import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useProject } from "../contexts/ProjectContext";
import {
  LayoutDashboard, Bell, AlertTriangle, ScrollText, Key, Zap,
  FolderOpen, BookOpen, Users, LogOut, ChevronDown, Plus
} from "lucide-react";
import { cn } from "../lib/utils";

export default function MainLayout() {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { projects, current, selectProject, loadProjects, createProject } = useProject();
  const [projectOpen, setProjectOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  const nav = [
    { to: "/", label: "Overview", icon: LayoutDashboard },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/dlq", label: "Dead Letter Queue", icon: AlertTriangle },
    { to: "/logs", label: "Activity Logs", icon: ScrollText },
    { to: "/apikeys", label: "API Keys", icon: Key },
    { to: "/events", label: "Event Templates", icon: Zap },
    { to: "/projects", label: "Projects", icon: FolderOpen },
    { to: "/docs", label: "Documentation", icon: BookOpen }
  ];

  const adminNav = [
    { to: "/admin/users", label: "All Users", icon: Users }
  ];

  async function handleCreateProject(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    await createProject(newName.trim());
    setNewName("");
    setCreating(false);
  }

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-surface-border bg-ink text-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                <Bell className="h-4 w-4 text-ink" />
              </div>
              <span className="text-lg font-semibold tracking-tight">NotifyStack</span>
            </Link>

            {/* Project selector */}
            <div className="relative">
              <button
                onClick={() => setProjectOpen(!projectOpen)}
                className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/50 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-700/50 transition-colors"
              >
                <FolderOpen className="h-3.5 w-3.5" />
                <span className="max-w-[160px] truncate">{current?.name || "Select project"}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {projectOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProjectOpen(false)} />
                  <div className="absolute left-0 top-full mt-2 z-20 w-64 rounded-xl border border-surface-border bg-white p-2 shadow-xl animate-fade-in">
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { selectProject(p); setProjectOpen(false); }}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition-colors",
                          p.id === current?.id ? "bg-ink text-white" : "text-ink hover:bg-surface-muted"
                        )}
                      >
                        <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{p.name}</span>
                      </button>
                    ))}
                    {!creating ? (
                      <button
                        onClick={() => setCreating(true)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-surface-muted transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        New project
                      </button>
                    ) : (
                      <form onSubmit={handleCreateProject} className="flex gap-2 p-2">
                        <input
                          autoFocus
                          className="input text-xs"
                          placeholder="Project name"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary text-xs !px-3">Add</button>
                      </form>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-neutral-400">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-8 lg:grid-cols-[240px_1fr] lg:px-6">
        {/* Sidebar */}
        <aside className="h-fit space-y-2 lg:sticky lg:top-24">
          <nav className="card space-y-1 p-2">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active ? "bg-ink text-white shadow-sm" : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              );
            })}

            {isAdmin && (
              <>
                <div className="my-2 border-t border-surface-border" />
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-ink-subtle">Admin</p>
                {adminNav.map(({ to, label, icon: Icon }) => {
                  const active = location.pathname.startsWith(to);
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        active ? "bg-ink text-white shadow-sm" : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0 space-y-6 animate-fade-in">
          {!current ? (
            <div className="card text-center py-16">
              <FolderOpen className="mx-auto h-12 w-12 text-ink-subtle mb-4" />
              <h2 className="text-lg font-semibold text-ink">No project selected</h2>
              <p className="mt-2 text-sm text-ink-muted">Create or select a project to get started.</p>
              <Link to="/projects" className="btn btn-primary mt-6 gap-2">
                <Plus className="h-4 w-4" />
                Go to Projects
              </Link>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
