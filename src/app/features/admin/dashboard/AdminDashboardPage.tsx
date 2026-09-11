import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle2,
  Clock3,
  Database,
  Gauge,
  RefreshCw,
  ShieldAlert,
  Target,
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
import { KPICard } from "../../../components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  DashboardResponse,
  EstadoDisponibilidad,
  indicadoresService,
} from "../../../services/indicadores.service";

const COLORS = {
  teal: "#0f766e",
  green: "#16a34a",
  amber: "#d97706",
  red: "#dc2626",
  blue: "#2563eb",
  slate: "#cbd5e1",
  ink: "#173c36",
};

const chartTooltipStyle = {
  borderRadius: 12,
  border: "1px solid #dbe5e2",
  boxShadow: "0 8px 24px rgba(23, 60, 54, 0.12)",
};

function formatPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${value.toFixed(1)}%`;
}

function formatNumber(value: number | null | undefined, suffix = ""): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${value.toFixed(value >= 100 ? 0 : 1)}${suffix}`;
}

function statusLabel(status: EstadoDisponibilidad): string {
  return status === "DISPONIBLE" ? "Disponible" : "Sin muestra suficiente";
}

function StatusPill({ status }: { status: EstadoDisponibilidad }) {
  const available = status === "DISPONIBLE";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        available ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${available ? "bg-emerald-500" : "bg-amber-500"}`} />
      {statusLabel(status)}
    </span>
  );
}

function EmptyChart({ reason, type = "circle" }: { reason?: string | null; type?: "circle" | "bars" }) {
  return (
    <div className="flex min-h-[250px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
      {type === "circle" ? (
        <div className="relative h-28 w-28">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="45" fill="none" stroke="#e2e8f0" strokeWidth="15" />
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#cbd5e1"
              strokeDasharray="8 12"
              strokeWidth="15"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-500">
            Sin datos
          </span>
        </div>
      ) : (
        <div className="flex h-24 items-end gap-3" aria-hidden="true">
          {[40, 72, 54, 88].map((height, index) => (
            <span
              key={height}
              className="w-7 rounded-t-md bg-slate-200"
              style={{ height, opacity: 0.55 + index * 0.1 }}
            />
          ))}
        </div>
      )}
      <div>
        <p className="font-semibold text-slate-700">Todavía no hay una muestra calculable</p>
        <p className="mt-1 max-w-md text-sm text-slate-500">
          {reason || "El gráfico se habilitará cuando el backend entregue observaciones válidas."}
        </p>
      </div>
    </div>
  );
}

function IndicatorSummaryCard({
  title,
  description,
  value,
  sample,
  status,
  colorClass,
}: {
  title: string;
  description: string;
  value: string;
  sample: string;
  status: EstadoDisponibilidad;
  colorClass: string;
}) {
  return (
    <Card className="min-w-0 overflow-hidden border-slate-200 shadow-sm">
      <div className={`h-1.5 ${colorClass}`} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          </div>
          <StatusPill status={status} />
        </div>
        <p className="mt-3 text-sm font-medium text-slate-700">{description}</p>
        <p className="mt-1 text-xs text-slate-500">{sample}</p>
      </CardContent>
    </Card>
  );
}

function DonutCard({
  title,
  subtitle,
  percentage,
  focusLabel,
  restLabel,
  focusCount,
  total,
  color,
  status,
  unavailableReason,
}: {
  title: string;
  subtitle: string;
  percentage: number | null;
  focusLabel: string;
  restLabel: string;
  focusCount: number;
  total: number;
  color: string;
  status: EstadoDisponibilidad;
  unavailableReason?: string | null;
}) {
  const hasChart = status === "DISPONIBLE" && total > 0 && percentage != null;
  const data = [
    { name: focusLabel, value: focusCount },
    { name: restLabel, value: Math.max(total - focusCount, 0) },
  ];

  return (
    <Card className="min-w-0 border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base text-slate-900">{title}</CardTitle>
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          </div>
          <StatusPill status={status} />
        </div>
      </CardHeader>
      <CardContent>
        {hasChart ? (
          <div className="relative h-[270px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="45%"
                  innerRadius={62}
                  outerRadius={92}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={color} />
                  <Cell fill={COLORS.slate} />
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} clientes`, "Cantidad"]}
                  contentStyle={chartTooltipStyle}
                />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={9} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-x-0 top-[88px] text-center">
              <p className="text-3xl font-bold text-slate-900">{formatPercent(percentage)}</p>
              <p className="text-xs font-medium text-slate-500">{focusCount} de {total}</p>
            </div>
          </div>
        ) : (
          <EmptyChart reason={unavailableReason} type="circle" />
        )}
      </CardContent>
    </Card>
  );
}

type DecisionItem = {
  title: string;
  detail: string;
  tone: "warning" | "success" | "neutral";
};

function buildDecisionItems(data: DashboardResponse): DecisionItem[] {
  const items: DecisionItem[] = [];

  if (data.pcc.estadoDisponibilidad === "DISPONIBLE") {
    items.push({
      title: data.pcc.totalBajoConocimiento > 0 ? "Reforzar conocimiento nutricional" : "PCC sin casos observados",
      detail:
        data.pcc.totalBajoConocimiento > 0
          ? `${data.pcc.totalBajoConocimiento} clientes evaluados están incluidos en bajo conocimiento.`
          : "La muestra evaluada no contiene clientes clasificados con bajo conocimiento.",
      tone: data.pcc.totalBajoConocimiento > 0 ? "warning" : "success",
    });
  }

  if (data.pcs.estadoDisponibilidad === "DISPONIBLE") {
    items.push({
      title: data.pcs.totalAltoConsumo > 0 ? "Revisar consumo de suplementación" : "PCS sin casos observados",
      detail:
        data.pcs.totalAltoConsumo > 0
          ? `${data.pcs.totalAltoConsumo} clientes evaluados están incluidos en alto consumo.`
          : "La muestra evaluada no contiene clientes clasificados con alto consumo.",
      tone: data.pcs.totalAltoConsumo > 0 ? "warning" : "success",
    });
  }

  if (data.tpp.totalAnalisisExcluidos > 0) {
    items.push({
      title: "Auditar análisis excluidos del TPP",
      detail: `${data.tpp.totalAnalisisExcluidos} análisis no ingresaron al cálculo del tiempo promedio.`,
      tone: "warning",
    });
  } else if (data.tpp.estadoDisponibilidad === "DISPONIBLE") {
    items.push({
      title: "TPP sin exclusiones registradas",
      detail: `${data.tpp.totalAnalisisValidos} análisis válidos respaldan el indicador mostrado.`,
      tone: "success",
    });
  }

  const unavailable = [
    data.pcc.estadoDisponibilidad !== "DISPONIBLE" ? "PCC" : null,
    data.pcs.estadoDisponibilidad !== "DISPONIBLE" ? "PCS" : null,
    data.tpp.estadoDisponibilidad !== "DISPONIBLE" ? "TPP" : null,
  ].filter(Boolean);

  if (unavailable.length > 0) {
    items.push({
      title: "Completar cobertura de medición",
      detail: `${unavailable.join(", ")} todavía no dispone de una muestra válida para tomar decisiones.`,
      tone: "neutral",
    });
  }

  return items;
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDashboard(await indicadoresService.dashboard());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el tablero de indicadores");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const decisionItems = useMemo(() => (dashboard ? buildDecisionItems(dashboard) : []), [dashboard]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-teal-700" />
          <p className="mt-3 text-sm font-medium text-slate-600">Cargando indicadores administrativos…</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <ShieldAlert className="h-9 w-9 text-red-600" />
          <p className="font-semibold text-red-800">No fue posible cargar el dashboard</p>
          <p className="max-w-xl text-sm text-red-700">{error || "Respuesta vacía del backend"}</p>
          <Button variant="outline" onClick={() => void loadDashboard()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const pcc = dashboard.pcc;
  const pcs = dashboard.pcs;
  const tpp = dashboard.tpp;
  const activeModelLabel = dashboard.modeloActivo
    ? `${dashboard.modeloActivo.nombre} ${dashboard.modeloActivo.version}`.trim()
    : "—";
  const tppExclusions = Object.entries(tpp.exclusiones ?? {}).map(([motivo, cantidad]) => ({
    motivo,
    cantidad,
  }));
  const availableIndicators = [pcc, pcs, tpp].filter((indicator) => indicator.estadoDisponibilidad === "DISPONIBLE").length;

  const percentComparison = [
    pcc.estadoDisponibilidad === "DISPONIBLE" && pcc.porcentajePcc != null
      ? { name: "PCC", value: pcc.porcentajePcc, fill: COLORS.teal }
      : null,
    pcs.estadoDisponibilidad === "DISPONIBLE" && pcs.porcentajePcs != null
      ? { name: "PCS", value: pcs.porcentajePcs, fill: COLORS.amber }
      : null,
    dashboard.porcentajeNivelConsumoOperativo != null
      ? { name: "Consumo operativo", value: dashboard.porcentajeNivelConsumoOperativo, fill: COLORS.blue }
      : null,
  ].filter((item): item is { name: string; value: number; fill: string } => item !== null);

  const coverageData = [
    { name: "Clientes", value: dashboard.totalClientes, fill: COLORS.ink },
    { name: "Evaluados PCC", value: pcc.totalEvaluadosValidos, fill: COLORS.teal },
    { name: "Evaluados PCS", value: pcs.totalEvaluadosValidos, fill: COLORS.amber },
    { name: "Análisis TPP", value: tpp.totalAnalisisValidos, fill: COLORS.blue },
  ];

  const tppData = [
    { name: "Válidos", value: tpp.totalAnalisisValidos, fill: COLORS.green },
    { name: "Excluidos", value: tpp.totalAnalisisExcluidos, fill: COLORS.red },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-[#173c36] px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Centro de decisiones</p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Indicadores operativos de NutriPredict</h1>
            <p className="mt-2 max-w-2xl text-sm text-emerald-50/80">
              Lectura consolidada de conocimiento, consumo de suplementación y rendimiento predictivo.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs text-emerald-100">Indicadores disponibles</p>
              <p className="mt-1 text-2xl font-bold">{availableIndicators}/3</p>
            </div>
            <Button
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              onClick={() => void loadDashboard()}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Actualizar datos
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Clientes registrados" value={String(dashboard.totalClientes)} icon={Users} iconBg="bg-teal-600" />
        <KPICard title="Predicciones registradas" value={String(dashboard.totalPrediccionesV5)} icon={Activity} iconBg="bg-blue-600" />
        <KPICard title="Modelo activo" value={activeModelLabel} icon={Gauge} iconBg="bg-emerald-600" />
        <KPICard
          title="Consumo operativo"
          value={formatPercent(dashboard.porcentajeNivelConsumoOperativo)}
          icon={BarChart3}
          iconBg="bg-amber-500"
        />
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Target className="h-5 w-5 text-teal-700" />
          <h2 className="text-lg font-bold text-slate-900">Los tres indicadores principales</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <IndicatorSummaryCard
            title="PCC"
            description="Clientes con bajo conocimiento nutricional"
            value={formatPercent(pcc.porcentajePcc)}
            sample={`${pcc.totalBajoConocimiento} casos en ${pcc.totalEvaluadosValidos} evaluaciones válidas`}
            status={pcc.estadoDisponibilidad}
            colorClass="bg-teal-600"
          />
          <IndicatorSummaryCard
            title="PCS"
            description="Clientes con alto consumo de suplementación"
            value={formatPercent(pcs.porcentajePcs)}
            sample={`${pcs.totalAltoConsumo} casos en ${pcs.totalEvaluadosValidos} evaluaciones válidas`}
            status={pcs.estadoDisponibilidad}
            colorClass="bg-amber-500"
          />
          <IndicatorSummaryCard
            title="TPP"
            description="Tiempo promedio de procesamiento predictivo"
            value={formatNumber(tpp.promedioTppMs, " ms")}
            sample={`${tpp.totalAnalisisValidos} análisis válidos · ${tpp.totalAnalisisExcluidos} excluidos`}
            status={tpp.estadoDisponibilidad}
            colorClass="bg-blue-600"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <DonutCard
          title="Distribución de conocimiento (PCC)"
          subtitle="Proporción de evaluados clasificados con bajo conocimiento"
          percentage={pcc.porcentajePcc}
          focusLabel="Bajo conocimiento"
          restLabel="Otros niveles"
          focusCount={pcc.totalBajoConocimiento}
          total={pcc.totalEvaluadosValidos}
          color={COLORS.teal}
          status={pcc.estadoDisponibilidad}
          unavailableReason={pcc.motivoNoDisponible}
        />
        <DonutCard
          title="Distribución de suplementación (PCS)"
          subtitle="Proporción de evaluados clasificados con alto consumo"
          percentage={pcs.porcentajePcs}
          focusLabel="Alto consumo"
          restLabel="Otros niveles"
          focusCount={pcs.totalAltoConsumo}
          total={pcs.totalEvaluadosValidos}
          color={COLORS.amber}
          status={pcs.estadoDisponibilidad}
          unavailableReason={pcs.motivoNoDisponible}
        />

        <Card className="min-w-0 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Comparación porcentual</CardTitle>
            <p className="text-xs text-slate-500">Valores oficiales entregados por el backend; no se recalculan en esta vista.</p>
          </CardHeader>
          <CardContent>
            {percentComparison.length > 0 ? (
              <div className="h-[290px] min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={percentComparison} margin={{ top: 24, right: 16, left: -8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Valor"]} contentStyle={chartTooltipStyle} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={70}>
                      {percentComparison.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                      <LabelList dataKey="value" position="top" formatter={(value: number) => `${value.toFixed(1)}%`} fill="#334155" fontSize={12} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart type="bars" reason="No hay porcentajes oficiales disponibles para comparar." />
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Cobertura de datos</CardTitle>
            <p className="text-xs text-slate-500">Permite detectar qué indicador necesita más registros válidos.</p>
          </CardHeader>
          <CardContent>
            <div className="h-[290px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coverageData} layout="vertical" margin={{ top: 4, right: 35, left: 18, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={105} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value: number) => [value, "Registros"]} contentStyle={chartTooltipStyle} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={34}>
                    {coverageData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                    <LabelList dataKey="value" position="right" fill="#334155" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 border-slate-200 shadow-sm xl:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                  <Clock3 className="h-5 w-5 text-blue-600" /> Calidad de la muestra TPP
                </CardTitle>
                <p className="mt-1 text-xs text-slate-500">Análisis incluidos y excluidos del tiempo promedio de predicción.</p>
              </div>
              <div className="rounded-xl bg-blue-50 px-4 py-2 text-right">
                <p className="text-xs font-medium text-blue-700">Promedio oficial</p>
                <p className="text-xl font-bold text-blue-950">{formatNumber(tpp.promedioTppMs, " ms")}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            {tpp.totalAnalisisValidos + tpp.totalAnalisisExcluidos > 0 ? (
              <div className="h-[230px] min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tppData} margin={{ top: 20, right: 18, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: number) => [value, "Análisis"]} contentStyle={chartTooltipStyle} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={90}>
                      {tppData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                      <LabelList dataKey="value" position="top" fill="#334155" fontSize={12} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart type="bars" reason={tpp.motivoNoDisponible} />
            )}
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Database className="h-4 w-4 text-slate-500" /> Motivos de exclusión
              </p>
              {tppExclusions.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {tppExclusions.map((item) => (
                    <li key={item.motivo} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm shadow-sm">
                      <span className="text-slate-600">{item.motivo}</span>
                      <span className="rounded-full bg-red-100 px-2 py-0.5 font-bold text-red-700">{item.cantidad}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-500">No hay motivos de exclusión registrados.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-slate-900">
              <Brain className="h-5 w-5 text-teal-700" /> Acciones sugeridas por los datos
            </CardTitle>
            <p className="text-xs text-slate-500">Observaciones operativas construidas desde conteos existentes, sin generar una nueva predicción.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {decisionItems.map((item) => {
              const styles = item.tone === "warning"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : item.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-slate-200 bg-slate-50 text-slate-800";
              const Icon = item.tone === "warning" ? AlertTriangle : item.tone === "success" ? CheckCircle2 : Database;
              return (
                <div key={item.title} className={`flex items-start gap-3 rounded-2xl border p-4 ${styles}`}>
                  <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm opacity-80">{item.detail}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-slate-950 text-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <Activity className="h-5 w-5 text-emerald-300" /> Cómo leer este tablero
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            <p><strong className="text-white">PCC</strong> muestra la proporción oficial de clientes evaluados con bajo conocimiento nutricional.</p>
            <p><strong className="text-white">PCS</strong> muestra la proporción oficial de clientes evaluados con alto consumo de suplementación.</p>
            <p><strong className="text-white">TPP</strong> mide el tiempo promedio de procesamiento de los análisis que el backend considera válidos.</p>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-400">
              Un indicador sin muestra permanece visible como estado vacío. El dashboard no completa datos faltantes ni simula resultados.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
