import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [current, setCurrent] = useState(() => {
    try {
      const stored = localStorage.getItem("ntf_project");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  async function loadProjects() {
    try {
      const res = await api.get("/v1/projects");
      const list = res.data.data || [];
      setProjects(list);
      if (list.length && !current) {
        selectProject(list[0]);
      } else if (current && !list.find((p) => p.id === current.id)) {
        if (list.length) selectProject(list[0]);
        else selectProject(null);
      }
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  function selectProject(project) {
    setCurrent(project);
    if (project) localStorage.setItem("ntf_project", JSON.stringify(project));
    else localStorage.removeItem("ntf_project");
  }

  async function createProject(name) {
    const res = await api.post("/v1/projects", { name });
    const proj = res.data.data;
    setProjects((prev) => [proj, ...prev]);
    selectProject(proj);
    return proj;
  }

  async function deleteProject(id) {
    await api.delete(`/v1/projects/${id}`);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (current?.id === id) {
      const remaining = projects.filter((p) => p.id !== id);
      selectProject(remaining[0] || null);
    }
  }

  return (
    <ProjectContext.Provider value={{
      projects, current, loading, selectProject, createProject, deleteProject, loadProjects
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be inside ProjectProvider");
  return ctx;
}
