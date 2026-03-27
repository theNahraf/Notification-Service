import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { ProjectProvider } from "./contexts/ProjectContext";
import { PageLoader } from "./components/LoadingSpinner";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import DLQ from "./pages/DLQ";
import Logs from "./pages/Logs";
import ApiKeys from "./pages/ApiKeys";
import Events from "./pages/Events";
import Projects from "./pages/Projects";
import AdminUsers from "./pages/AdminUsers";
import Docs from "./pages/Docs";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ProjectProvider>
              <MainLayout />
            </ProjectProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="dlq" element={<DLQ />} />
        <Route path="logs" element={<Logs />} />
        <Route path="apikeys" element={<ApiKeys />} />
        <Route path="events" element={<Events />} />
        <Route path="projects" element={<Projects />} />
        <Route path="docs" element={<Docs />} />
        <Route path="admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
