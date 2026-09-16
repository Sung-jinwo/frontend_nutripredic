import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { NotificationCenter } from "../components/shared/NotificationCenter";
import { BREADCRUMBS, type View } from "../types";
import { ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { analisisPredictivoService } from "../services/analisis-predictivo.service";
import { indicadoresService } from "../services/indicadores.service";

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
  const { user, profileComplete } = useAuth();
  const view = PATH_TO_VIEW[location.pathname] || "client-home";
  const breadcrumb = BREADCRUMBS[view] || "";
  const [demoStatus, setDemoStatus] = useState<Awaited<ReturnType<typeof indicadoresService.demoStatus>> | null>(null);

  useEffect(() => {
    let active = true;
    setDemoStatus(null);
    if (user?.rol === "ADMIN") void indicadoresService.demoStatus()
      .then(status => { if (active) setDemoStatus(status); }).catch(() => undefined);
    return () => { active = false; };
  }, [user?.id, user?.rol, location.pathname]);

  useEffect(() => {
    if (user?.rol !== "CLIENTE" || !user.clienteId || !profileComplete) return;
    const fecha = new Date().toLocaleDateString("sv-SE");
    const key = `nutripredict:ciclo-diario:${user.clienteId}:${fecha}`;
    if (sessionStorage.getItem(key)) return;
    const publish = (result: Awaited<ReturnType<typeof analisisPredictivoService.estadoCicloDiario>>) => {
        if (result.estado === "COMPLETADO") sessionStorage.setItem(key, "1");
        window.dispatchEvent(new CustomEvent("nutripredict:ciclo-diario-actualizado", { detail: result }));
    };
    void analisisPredictivoService.estadoCicloDiario(user.clienteId)
      .then(async estado => {
        // El primer ingreso inicia el ciclo. Un ciclo fallido o ya iniciado sólo se
        // reintenta mediante la acción explícita de la vista Análisis.
        if (estado.estado === "PENDIENTE" && estado.prediccionId == null) {
          publish(await analisisPredictivoService.asegurarCicloDiario(user.clienteId!));
          return;
        }
        publish(estado);
      })
      .catch(() => undefined);
  }, [profileComplete, user?.clienteId, user?.rol]);

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
          <NotificationCenter />
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {user?.rol === "ADMIN" && demoStatus && (demoStatus.enabled || demoStatus.demoUsers > 0) && <aside className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p className="font-semibold">Muestra de demostración · {demoStatus.demoUsers} clientes de prueba</p><p className="mt-1 text-xs">{demoStatus.message}</p>{demoStatus.enabled && <p className="mt-2 text-xs">Precarga: {demoStatus.state === "COMPLETADO" ? "completada" : demoStatus.state === "PARCIAL" ? "parcial; revisa los logs de IA/Gemini" : "en preparación"} · {demoStatus.completedCycles}/4 ciclos completos en este arranque.</p>}</aside>}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
