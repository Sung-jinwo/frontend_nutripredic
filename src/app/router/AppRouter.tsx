import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppLayout } from "../layout/AppLayout";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import ClientHomePage from "../features/client/home/ClientHomePage";
import ClientProfilePage from "../features/client/profile/ClientProfilePage";
import ClientHabitosPage from "../features/client/habitos/ClientHabitosPage";
import ClientConocimientoPage from "../features/client/conocimiento/ClientConocimientoPage";
import ClientSuplementosPage from "../features/client/suplementos/ClientSuplementosPage";
import ClientConsumoPage from "../features/client/consumo/ClientConsumoPage";
import ClientAnalisisPage from "../features/client/analisis/ClientAnalisisPage";
import ClientHistorialPage from "../features/client/historial/ClientHistorialPage";
import ClientRecomendacionesPage from "../features/client/recomendaciones/ClientRecomendacionesPage";
import AdminDashboardPage from "../features/admin/dashboard/AdminDashboardPage";
import AdminClientesPage from "../features/admin/clientes/AdminClientesPage";
import AdminConocimientoPage from "../features/admin/conocimiento/AdminConocimientoPage";
import AdminConsumoPage from "../features/admin/consumo/AdminConsumoPage";
import AdminTiempoPage from "../features/admin/tiempo/AdminTiempoPage";
import AdminModeloPage from "../features/admin/modelo/AdminModeloPage";
import AdminReportesPage from "../features/admin/reportes/AdminReportesPage";
import AdminUsuariosPage from "../features/admin/usuarios/AdminUsuariosPage";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ role }: { role: "CLIENTE" | "ADMIN" }) {
  const auth = useAuth();
  const location = useLocation();
  if (auth.isLoading) return <div className="min-h-screen bg-[#f0f4fb] flex items-center justify-center text-sm text-slate-500">Cargando sesión...</div>;
  if (!auth.isAuthenticated) return <Navigate to="/login" replace />;
  if (auth.role !== role) return <Navigate to={auth.role === "ADMIN" ? "/admin/dashboard" : "/client/home"} replace />;
  if (role === "CLIENTE" && !auth.profileComplete && location.pathname !== "/client/profile") return <Navigate to="/client/profile" replace />;
  return <AppLayout />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/client" element={<ProtectedRoute role="CLIENTE" />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<ClientHomePage />} />
        <Route path="profile" element={<ClientProfilePage />} />
        <Route path="habitos" element={<ClientHabitosPage />} />
        <Route path="conocimiento" element={<ClientConocimientoPage />} />
        <Route path="suplementos" element={<ClientSuplementosPage />} />
        <Route path="consumo" element={<ClientConsumoPage />} />
        <Route path="analisis" element={<ClientAnalisisPage />} />
        <Route path="historial" element={<ClientHistorialPage />} />
        <Route path="recomendaciones" element={<ClientRecomendacionesPage />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute role="ADMIN" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="clientes" element={<AdminClientesPage />} />
        <Route path="conocimiento" element={<AdminConocimientoPage />} />
        <Route path="consumo" element={<AdminConsumoPage />} />
        <Route path="tiempo" element={<AdminTiempoPage />} />
        <Route path="modelo" element={<AdminModeloPage />} />
        <Route path="reportes" element={<AdminReportesPage />} />
        <Route path="usuarios" element={<AdminUsuariosPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
