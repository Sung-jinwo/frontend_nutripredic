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
  "/client/consumo": "client-consumo",
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
    <div className="flex h-screen overflow-hidden bg-[#f5f3ed]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between border-b border-[#dbe7e1] bg-[#fdfdfb]/95 py-3 pl-14 pr-4 backdrop-blur sm:px-7">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">NutriPredict</span>
            <ChevronRight size={14} className="text-slate-300" aria-hidden="true" />
            <span className="font-medium text-[#173c36]">{breadcrumb}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
