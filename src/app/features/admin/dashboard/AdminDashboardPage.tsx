import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Brain, CheckCircle2, Clock3, RefreshCw, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { OperationNotice } from "../../../components/shared/OperationNotice";
import { DashboardResponse, EstadoDisponibilidad, indicadoresService } from "../../../services/indicadores.service";

function formatPercent(value: number | null): string {
  return value == null || !Number.isFinite(value) ? "—" : `${value.toFixed(1)}%`;
}

function formatTpp(value: number | null): string {
  return value == null || !Number.isFinite(value) ? "—" : `${value.toFixed(value >= 100 ? 0 : 1)} ms`;
}

function StatusPill({ status }: { status: EstadoDisponibilidad }) {
  const available = status === "DISPONIBLE";
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${available ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${available ? "bg-emerald-500" : "bg-amber-500"}`} />
    {available ? "Disponible" : "Sin muestra válida"}
  </span>;
}

type IndicatorCardProps = {
  title: "PCC" | "PCS" | "TPP";
  description: string;
  value: string;
  summary: string;
  status: EstadoDisponibilidad;
  icon: LucideIcon;
  color: string;
  onDetail: () => void;
};

function IndicatorCard({ title, description, value, summary, status, icon: Icon, color, onDetail }: IndicatorCardProps) {
  return <Card className="overflow-hidden border-slate-200 shadow-sm">
    <div className={`h-1.5 ${color}`} />
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><span className={`rounded-xl p-2 ${color} text-white`}><Icon size={18} /></span><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{title}</p></div><StatusPill status={status} /></div>
      <p className="mt-5 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-sm font-medium text-slate-700">{description}</p>
      <p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">{summary}</p>
      <Button variant="outline" className="mt-4 w-full" onClick={onDetail}>Ver detalle</Button>
    </CardContent>
  </Card>;
}

type Priority = { title: string; detail: string; path: string; tone: "warning" | "neutral" };

function buildPriorities(data: DashboardResponse): Priority[] {
  const items: Priority[] = [];
  const definitions = [
    { key: "PCC", response: data.pcc, count: data.pcc.totalBajoConocimiento, label: "clientes con bajo conocimiento", path: "/admin/conocimiento" },
    { key: "PCS", response: data.pcs, count: data.pcs.totalAltoConsumo, label: "clientes con alto consumo de suplementación", path: "/admin/consumo" },
  ];
  definitions.forEach(({ key, response, count, label, path }) => {
    if (response.estadoDisponibilidad !== "DISPONIBLE") {
      items.push({ title: `${key} sin muestra válida`, detail: response.motivoNoDisponible ?? "Aún no hay datos suficientes para calcular el indicador.", path, tone: "neutral" });
    } else if (count > 0) {
      items.push({ title: `Revisar ${key}`, detail: `${count} ${label} forman parte del resultado oficial actual.`, path, tone: "warning" });
    }
  });
  if (data.tpp.estadoDisponibilidad !== "DISPONIBLE") {
    items.push({ title: "TPP sin muestra válida", detail: data.tpp.motivoNoDisponible ?? "Aún no hay ciclos completos para calcular el tiempo promedio.", path: "/admin/tiempo", tone: "neutral" });
  } else if (data.tpp.totalAnalisisExcluidos > 0) {
    items.push({ title: "Revisar exclusiones TPP", detail: `${data.tpp.totalAnalisisExcluidos} ciclos no participan en el tiempo promedio oficial.`, path: "/admin/tiempo", tone: "warning" });
  }
  return items;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadDashboard = useCallback(async () => {
    setLoading(true); setError(null);
    try { setDashboard(await indicadoresService.dashboard()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo cargar el tablero de indicadores."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void loadDashboard(); }, [loadDashboard]);
  const priorities = useMemo(() => dashboard ? buildPriorities(dashboard) : [], [dashboard]);

  if (loading) return <div className="flex min-h-[420px] items-center justify-center"><div className="text-center"><RefreshCw className="mx-auto h-8 w-8 animate-spin text-teal-700" /><p className="mt-3 text-sm font-medium text-slate-600">Cargando indicadores administrativos…</p></div></div>;
  if (error || !dashboard) return <><OperationNotice message={error || "Respuesta vacía del backend."}/><Card><CardContent className="flex flex-col items-center gap-3 py-10 text-center"><ShieldAlert className="h-9 w-9 text-muted-foreground" /><p className="font-semibold">No fue posible cargar el dashboard</p><p className="text-sm text-muted-foreground">Consulta el detalle en Notificaciones.</p><Button variant="outline" onClick={() => void loadDashboard()}><RefreshCw className="mr-2 h-4 w-4" /> Reintentar</Button></CardContent></Card></>;

  const { pcc, pcs, tpp } = dashboard;
  return <div className="space-y-6">
    <section className="overflow-hidden rounded-3xl bg-[#173c36] px-6 py-7 text-white shadow-lg sm:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Centro de decisiones</p><h1 className="mt-2 text-2xl font-bold sm:text-3xl">Indicadores oficiales</h1><p className="mt-2 max-w-2xl text-sm text-emerald-50/80">Resumen de conocimiento, consumo de suplementación y tiempo del ciclo diario.</p></div><Button variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white" onClick={() => void loadDashboard()}><RefreshCw className="mr-2 h-4 w-4" /> Actualizar datos</Button></div></section>

    <section className="grid gap-4 lg:grid-cols-3">
      <IndicatorCard title="PCC" value={formatPercent(pcc.porcentajePcc)} description="Clientes con bajo conocimiento nutricional" summary={`${pcc.totalBajoConocimiento} casos en ${pcc.totalEvaluadosValidos} evaluados válidos.`} status={pcc.estadoDisponibilidad} icon={Brain} color="bg-teal-600" onDetail={() => navigate("/admin/conocimiento")} />
      <IndicatorCard title="PCS" value={formatPercent(pcs.porcentajePcs)} description="Clientes con alto consumo de suplementación" summary={`${pcs.totalAltoConsumo} casos en ${pcs.totalEvaluadosValidos} evaluados válidos.`} status={pcs.estadoDisponibilidad} icon={AlertTriangle} color="bg-amber-500" onDetail={() => navigate("/admin/consumo")} />
      <IndicatorCard title="TPP" value={formatTpp(tpp.promedioTppMs)} description="Tiempo activo promedio del ciclo diario" summary={`${tpp.totalAnalisisValidos} ciclos válidos · ${tpp.totalAnalisisExcluidos} excluidos.`} status={tpp.estadoDisponibilidad} icon={Clock3} color="bg-blue-600" onDetail={() => navigate("/admin/tiempo")} />
    </section>

    <section><div className="mb-3 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-600" /><h2 className="text-lg font-bold text-slate-900">Prioridades de atención</h2></div><Card className="border-slate-200 shadow-sm"><CardContent className="divide-y divide-slate-100 p-0">{priorities.length > 0 ? priorities.map(priority => <button key={priority.title} onClick={() => navigate(priority.path)} className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50"><span className={`mt-0.5 rounded-lg p-2 ${priority.tone === "warning" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}><AlertTriangle size={17} /></span><span><span className="block font-semibold text-slate-800">{priority.title}</span><span className="mt-1 block text-sm text-slate-600">{priority.detail}</span><span className="mt-2 block text-xs font-semibold text-teal-700">Ver indicador</span></span></button>) : <div className="flex items-start gap-3 px-5 py-5"><span className="rounded-lg bg-emerald-100 p-2 text-emerald-700"><CheckCircle2 size={17} /></span><div><p className="font-semibold text-slate-800">Sin prioridades pendientes</p><p className="mt-1 text-sm text-slate-600">Los tres indicadores disponibles no reportan casos ni exclusiones para revisar.</p></div></div>}</CardContent></Card></section>

    <p className="text-center text-xs text-slate-500">El Dashboard resume los resultados oficiales. La distribución, metodología y trazabilidad están disponibles en el detalle de cada indicador.</p>
  </div>;
}
