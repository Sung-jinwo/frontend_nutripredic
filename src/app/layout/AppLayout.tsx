import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BREADCRUMBS, type View } from "../types";
import { ChevronRight } from "lucide-react";

const PATH_TO_VIEW: Record<string, View> = {
  "/client/home": "client-home",
  "/client/profile": "client-profile",
  "/client/habitos": "client-habitos",
  "/client/conocimiento": "client-conocimiento",
  "/client/suplementos": "client-suplementos",
  "/client/analisis": "client-analisis",
  "/client/historial": "client-historial",
  "/client/recomendaciones": "client-recomendaciones",
  "/admin/dashboard": "admin-dashboard",
  "/admin/clientes": "admin-clientes",
  "/admin/conocimiento": "admin-conocimiento",
  "/admin/consumo": "admin-consumo",
  "/admin/tiempo": "admin-tiempo",
  "/admin/modelo": "admin-modelo",
  "/admin/reportes": "admin-reportes",
  "/admin/usuarios": "admin-usuarios",
};

export function AppLayout() {
  const location = useLocation();
  const view = PATH_TO_VIEW[location.pathname] || "client-home";
  const breadcrumb = BREADCRUMBS[view] || "";

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", background: "#f0f4fb" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">NutriPredict</span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="text-slate-700 font-medium">{breadcrumb}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
