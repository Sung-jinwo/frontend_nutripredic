import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Brain,
  Clock3,
  Download,
  FileSpreadsheet,
  FileText,
  Gauge,
  PieChart as PieChartIcon,
  RefreshCw,
  ShieldAlert,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Badge,
  Card,
  ErrorState,
  KPICard,
  LoadingState,
  SectionHeader,
} from "../../../components/shared";
import {
  type DashboardResponse,
  indicadoresService,
} from "../../../services/indicadores.service";

type ReportView = "ejecutivo" | "conocimiento" | "suplementacion" | "rendimiento";

const COLORS = {
  teal: "#0f766e",
  tealLight: "#99f6e4",
  amber: "#d97706",
  amberLight: "#fde68a",
  blue: "#2563eb",
  green: "#16a34a",
  red: "#dc2626",
  slate: "#cbd5e1",
};

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #dbe7e1",
  boxShadow: "0 8px 24px rgba(23, 60, 54, 0.12)",
};

function percent(value: number | null | undefined) {
  return value == null || !Number.isFinite(value) ? "—" : `${value.toFixed(1)}%`;
}

function number(value: number | null | undefined, suffix = "") {
  return value == null || !Number.isFinite(value) ? "—" : `${value.toFixed(value >= 100 ? 0 : 1)}${suffix}`;
}

function Availability({ available, reason }: { available: boolean; reason?: string | null }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge label={available ? "Disponible" : "Sin muestra"} variant={available ? "success" : "warning"} />
      {!available && reason && <span className="text-xs text-slate-500">{reason.replaceAll("_", " ")}</span>}
    </div>
  );
}

function EmptyChart({ reason }: { reason?: string | null }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
      <BarChart3 className="h-10 w-10 text-slate-300" />
      <p className="mt-3 font-semibold text-slate-700">Sin información calculable</p>
      <p className="mt-1 max-w-md text-sm text-slate-500">
        {reason ? reason.replaceAll("_", " ") : "El backend todavía no dispone de registros válidos para este informe."}
      </p>
    </div>
  );
}

function DonutReport({
  title,
  description,
  percentage,
  affected,
  total,
  affectedLabel,
  remainingLabel,
  color,
  available,
  reason,
}: {
  title: string;
  description: string;
  percentage: number | null;
  affected: number;
  total: number;
  affectedLabel: string;
  remainingLabel: string;
  color: string;
  available: boolean;
  reason?: string | null;
}) {
  const canRender = available && percentage != null && total > 0;
  const data = [
    { name: affectedLabel, value: affected },
    { name: remainingLabel, value: Math.max(total - affected, 0) },
  ];

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <Availability available={available} reason={reason} />
      </div>
      {canRender ? (
        <div className="mt-4 grid items-center gap-5 lg:grid-cols-[1fr_0.85fr]">
          <div className="relative h-[300px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" cx="50%" cy="47%" innerRadius={72} outerRadius={106} paddingAngle={2} stroke="none">
                  <Cell fill={color} />
                  <Cell fill={COLORS.slate} />
                </Pie>
                <Tooltip formatter={(value: number) => [value, "Clientes"]} contentStyle={tooltipStyle} />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={9} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-x-0 top-[112px] text-center">
              <p className="text-4xl font-semibold text-slate-900">{percent(percentage)}</p>
              <p className="mt-1 text-xs text-slate-500">resultado oficial</p>
            </div>
          </div>
          <dl className="grid gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Muestra válida</dt>
              <dd className="mt-1 text-2xl font-semibold text-slate-900">{total}</dd>
            </div>
            <div className="rounded-2xl p-4" style={{ backgroundColor: `${color}12` }}>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{affectedLabel}</dt>
              <dd className="mt-1 text-2xl font-semibold" style={{ color }}>{affected}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <div className="mt-5"><EmptyChart reason={reason} /></div>
      )}
    </Card>
  );
}

export default function AdminReportesPage() {
  const [activeView, setActiveView] = useState<ReportView>("ejecutivo");
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setDashboard(await indicadoresService.dashboard());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cargar la información de reportes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const tabs = useMemo(() => [
    { id: "ejecutivo" as const, label: "Resumen ejecutivo", icon: FileText },
    { id: "conocimiento" as const, label: "Conocimiento", icon: Brain },
    { id: "suplementacion" as const, label: "Suplementación", icon: PieChartIcon },
    { id: "rendimiento" as const, label: "Rendimiento IA", icon: Clock3 },
  ], []);

  if (loading) return <LoadingState label="Preparando los reportes administrativos..." />;

  if (error || !dashboard) {
    return (
      <div className="space-y-4">
        <ErrorState message={error || "El backend devolvió una respuesta vacía."} />
        <button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl bg-[#173c36] px-4 py-2 text-sm font-semibold text-white">
          <RefreshCw size={15} /> Reintentar
        </button>
      </div>
    );
  }

  const { pcc, pcs, tpp } = dashboard;
  const activeModel = dashboard.modeloActivo
    ? `${dashboard.modeloActivo.nombre} ${dashboard.modeloActivo.version}`.trim()
    : "Sin modelo registrado";
  const tppExclusions = Object.entries(tpp.exclusiones ?? {}).map(([name, value]) => ({ name, value }));
  const tppSample = [
    { name: "Válidos", value: tpp.totalAnalisisValidos, fill: COLORS.green },
    { name: "Excluidos", value: tpp.totalAnalisisExcluidos, fill: COLORS.red },
  ];
  const executiveComparison = [
    pcc.porcentajePcc != null ? { name: "PCC", value: pcc.porcentajePcc, fill: COLORS.teal } : null,
    pcs.porcentajePcs != null ? { name: "PCS", value: pcs.porcentajePcs, fill: COLORS.amber } : null,
    dashboard.porcentajeNivelConsumoOperativo != null
      ? { name: "Consumo operativo", value: dashboard.porcentajeNivelConsumoOperativo, fill: COLORS.blue }
      : null,
  ].filter((item): item is { name: string; value: number; fill: string } => item !== null);

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Reportes y análisis"
        subtitle="Consulta primero la evidencia del sistema y exporta únicamente cuando exista un formato oficial."
        action={
          <button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <RefreshCw size={14} /> Actualizar
          </button>
        }
      />

      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
          <div>
            <p className="text-sm font-semibold text-blue-950">Reportes conectados a información real</p>
            <p className="mt-1 text-xs leading-5 text-blue-800">
              La API disponible ofrece datos acumulados de PCC, PCS y TPP. Todavía no entrega series por fechas ni archivos PDF/Excel; por eso esta vista no muestra tendencias simuladas ni habilita descargas vacías.
            </p>
          </div>
        </div>
      </section>

      <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Tipos de reporte">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
              activeView === tab.id
                ? "border-[#173c36] bg-[#173c36] text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </nav>

      {activeView === "ejecutivo" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KPICard icon={Users} title="Clientes registrados" value={String(dashboard.totalClientes)} iconBg="bg-teal-600" />
            <KPICard icon={Activity} title="Predicciones registradas" value={String(dashboard.totalPrediccionesV5)} iconBg="bg-indigo-600" />
            <KPICard icon={Gauge} title="Modelo activo" value={activeModel} iconBg="bg-emerald-600" />
            <KPICard icon={Clock3} title="TPP promedio" value={number(tpp.promedioTppMs, " ms")} iconBg="bg-blue-600" />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <Card className="p-5 sm:p-6">
              <div>
                <h2 className="font-semibold text-slate-900">Comparación de indicadores porcentuales</h2>
                <p className="mt-1 text-sm text-slate-500">Solo se incluyen porcentajes calculados por el backend.</p>
              </div>
              {executiveComparison.length > 0 ? (
                <div className="mt-4 h-[310px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={executiveComparison} margin={{ top: 25, right: 20, left: -5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Indicador"]} contentStyle={tooltipStyle} />
                      <Bar dataKey="value" radius={[9, 9, 0, 0]} maxBarSize={82}>
                        {executiveComparison.map((item) => <Cell key={item.name} fill={item.fill} />)}
                        <LabelList dataKey="value" position="top" formatter={(value: number) => `${value.toFixed(1)}%`} fill="#334155" fontSize={12} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <div className="mt-5"><EmptyChart /></div>}
            </Card>

            <Card className="overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="font-semibold text-slate-900">Matriz ejecutiva</h2>
                <p className="mt-1 text-xs text-slate-500">Resultado, cobertura y disponibilidad en una sola lectura.</p>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { name: "PCC", value: percent(pcc.porcentajePcc), sample: `${pcc.totalEvaluadosValidos} evaluados`, available: pcc.estadoDisponibilidad === "DISPONIBLE" },
                  { name: "PCS", value: percent(pcs.porcentajePcs), sample: `${pcs.totalEvaluadosValidos} evaluados`, available: pcs.estadoDisponibilidad === "DISPONIBLE" },
                  { name: "TPP", value: number(tpp.promedioTppMs, " ms"), sample: `${tpp.totalAnalisisValidos} análisis válidos`, available: tpp.estadoDisponibilidad === "DISPONIBLE" },
                ].map((row) => (
                  <div key={row.name} className="grid grid-cols-[70px_1fr_auto] items-center gap-3 px-5 py-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{row.name}</span>
                    <div><p className="font-semibold text-slate-900">{row.value}</p><p className="text-xs text-slate-500">{row.sample}</p></div>
                    <Badge label={row.available ? "Disponible" : "Sin muestra"} variant={row.available ? "success" : "warning"} />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeView === "conocimiento" && (
        <DonutReport
          title="Reporte de conocimiento nutricional"
          description="PCC calculado desde el último resultado oficial válido de cada cliente."
          percentage={pcc.porcentajePcc}
          affected={pcc.totalBajoConocimiento}
          total={pcc.totalEvaluadosValidos}
          affectedLabel="Bajo conocimiento"
          remainingLabel="Otros niveles"
          color={COLORS.teal}
          available={pcc.estadoDisponibilidad === "DISPONIBLE"}
          reason={pcc.motivoNoDisponible}
        />
      )}

      {activeView === "suplementacion" && (
        <DonutReport
          title="Reporte de consumo de suplementación"
          description="PCS calculado desde evaluaciones de consumo válidas almacenadas por el sistema."
          percentage={pcs.porcentajePcs}
          affected={pcs.totalAltoConsumo}
          total={pcs.totalEvaluadosValidos}
          affectedLabel="Alto consumo"
          remainingLabel="Otros niveles"
          color={COLORS.amber}
          available={pcs.estadoDisponibilidad === "DISPONIBLE"}
          reason={pcs.motivoNoDisponible}
        />
      )}

      {activeView === "rendimiento" && (
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">Rendimiento del modelo predictivo</h2>
                <p className="mt-1 text-sm text-slate-500">Calidad de la muestra utilizada para calcular el TPP.</p>
              </div>
              <Availability available={tpp.estadoDisponibilidad === "DISPONIBLE"} reason={tpp.motivoNoDisponible} />
            </div>
            <div className="mt-5 rounded-2xl bg-blue-50 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-blue-700">Tiempo promedio de procesamiento</p>
              <p className="mt-1 text-4xl font-semibold text-blue-950">{number(tpp.promedioTppMs, " ms")}</p>
            </div>
            {tpp.totalAnalisisValidos + tpp.totalAnalisisExcluidos > 0 ? (
              <div className="mt-4 h-[280px] min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tppSample} margin={{ top: 25, right: 20, left: -5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: number) => [value, "Análisis"]} contentStyle={tooltipStyle} />
                    <Bar dataKey="value" radius={[9, 9, 0, 0]} maxBarSize={100}>
                      {tppSample.map((item) => <Cell key={item.name} fill={item.fill} />)}
                      <LabelList dataKey="value" position="top" fill="#334155" fontSize={12} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="mt-5"><EmptyChart reason={tpp.motivoNoDisponible} /></div>}
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="font-semibold text-slate-900">Exclusiones del cálculo</h2>
            <p className="mt-1 text-sm text-slate-500">Registros omitidos y motivo informado por el backend.</p>
            {tppExclusions.length > 0 ? (
              <div className="mt-4 space-y-2">
                {tppExclusions.map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-3 py-3">
                    <span className="text-sm text-red-800">{item.name.replaceAll("_", " ")}</span>
                    <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">No existen motivos de exclusión registrados.</div>
            )}
          </Card>
        </div>
      )}

      <Card className="p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">Exportación del informe actual</h2>
            <p className="mt-1 text-xs text-slate-500">Se habilitará cuando el backend defina generación de archivos, período consultado y trazabilidad.</p>
          </div>
          <div className="flex gap-2">
            <button disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400">
              <Download size={14} /> PDF
            </button>
            <button disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400">
              <FileSpreadsheet size={14} /> Excel
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
