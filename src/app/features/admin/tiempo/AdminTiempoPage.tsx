import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Gauge, RefreshCw, TimerReset } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge, Card, ErrorState, KPICard, LoadingState, SectionHeader } from "../../../components/shared";
import { indicadoresService, type TppIndicatorResponse } from "../../../services/indicadores.service";

const tooltipStyle = { borderRadius: 12, border: "1px solid #dbe7e1", boxShadow: "0 8px 24px rgba(23,60,54,.12)" };
const exclusionColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-4)", "var(--chart-5)", "var(--muted-foreground)"];

function reason(value: string | null) {
  if (value === "SIN_ANALISIS_VALIDOS") return "Aún no existen ciclos diarios V6 completos, generados y con duración activa válida.";
  return value?.replaceAll("_", " ").toLocaleLowerCase() || "No se informó el motivo.";
}

export default function AdminTiempoPage() {
  const [data, setData] = useState<TppIndicatorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await indicadoresService.tpp());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cargar el indicador TPP.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <LoadingState label="Cargando rendimiento predictivo..." />;
  if (error || !data) return <ErrorState message={error || "No se recibió información del sistema."} />;

  const available = data.estadoDisponibilidad === "DISPONIBLE" && data.promedioTppMs != null;
  const total = data.totalAnalisisValidos + data.totalAnalisisExcluidos;
  const sampleData = [
    { name: "Válidos", value: data.totalAnalisisValidos, fill: "var(--chart-3)" },
    { name: "Excluidos", value: data.totalAnalisisExcluidos, fill: "var(--chart-1)" },
  ];
  const exclusions = Object.entries(data.exclusiones ?? {}).map(([name, value], index) => ({
    name: name.replaceAll("_", " ").toLocaleLowerCase(),
    value,
    fill: exclusionColors[index % exclusionColors.length],
  }));
  const inclusionPercentage = total > 0 ? (data.totalAnalisisValidos / total) * 100 : 0;
  const inclusionData = [{ name: "Incluidos", value: inclusionPercentage, fill: "var(--chart-3)" }];

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Tiempo del ciclo diario completo"
        subtitle="TPP oficial del procesamiento activo de predicción, plan, PCS, preguntas y orientación."
        action={<button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw size={14} /> Actualizar</button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard icon={Clock3} title="TPP oficial" value={data.promedioTppMs == null ? "—" : `${data.promedioTppMs.toFixed(data.promedioTppMs >= 100 ? 0 : 1)} ms`} sub="Tiempo activo del ciclo completo" iconBg="bg-indigo-600" />
        <KPICard icon={CheckCircle2} title="Ciclos válidos" value={String(data.totalAnalisisValidos)} sub="Diarios V6 completos y generados" iconBg="bg-emerald-600" />
        <KPICard icon={AlertTriangle} title="Ciclos excluidos" value={String(data.totalAnalisisExcluidos)} sub="No incluidos en el TPP" iconBg="bg-amber-500" />
      </div>

      {!available && <Card className="border-l-4 border-l-amber-400 p-5"><div className="flex gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-amber-500" size={20} /><div><h2 className="font-semibold text-slate-800">TPP no calculable</h2><p className="mt-1 text-sm text-slate-500">{reason(data.motivoNoDisponible)}</p></div></div></Card>}

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-900">Calidad de la muestra</h2><p className="mt-1 text-sm text-slate-500">Relación entre análisis incluidos y descartados del TPP.</p></div><Badge label={available ? "TPP disponible" : "Sin TPP"} variant={available ? "success" : "warning"} /></div>
          {total > 0 ? (
            <div className="mt-5">
              <div className="h-[280px] min-w-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={sampleData} margin={{ top: 25, right: 15, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} /><Tooltip formatter={(value: number) => [value, "Análisis"]} contentStyle={tooltipStyle} /><Bar dataKey="value" radius={[8,8,0,0]} maxBarSize={75}>{sampleData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}<LabelList dataKey="value" position="top" fill="#334155" /></Bar></BarChart></ResponsiveContainer></div>
            </div>
          ) : <div className="mt-5 flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed bg-slate-50 px-6 text-center"><TimerReset className="h-10 w-10 text-slate-300" /><p className="mt-3 font-semibold text-slate-700">Sin procesos medidos</p><p className="mt-1 text-sm text-slate-500">Todavía no existen análisis válidos ni excluidos para visualizar.</p></div>}
        </Card>

        <Card className="p-5 sm:p-6">
          <div><h2 className="font-semibold text-slate-900">Distribución de exclusiones</h2><p className="mt-1 text-sm text-slate-500">Participación de cada motivo dentro de los ciclos descartados.</p></div>
          {exclusions.length > 0 ? (
            <div className="mt-5 h-[300px] min-w-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={exclusions} dataKey="value" nameKey="name" cx="50%" cy="43%" outerRadius={94} paddingAngle={2} stroke="none">{exclusions.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}</Pie><Tooltip formatter={(value: number) => [value, "Ciclos"]} contentStyle={tooltipStyle} /><Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} /></PieChart></ResponsiveContainer></div>
          ) : <div className="mt-5 flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed bg-slate-50 px-6 text-center"><CheckCircle2 className="h-10 w-10 text-emerald-400" /><p className="mt-3 font-semibold text-slate-700">Sin exclusiones registradas</p><p className="mt-1 text-sm text-slate-500">No hay motivos de descarte para distribuir.</p></div>}
        </Card>

        <Card className="p-5 sm:p-6 lg:col-span-2 xl:col-span-1">
          <div><h2 className="font-semibold text-slate-900">Tasa de inclusión</h2><p className="mt-1 text-sm text-slate-500">Proporción de ciclos válidos sobre el total procesado.</p></div>
          {total > 0 ? (
            <div className="relative mt-5 h-[300px] min-w-0"><ResponsiveContainer width="100%" height="100%"><RadialBarChart innerRadius="68%" outerRadius="100%" data={inclusionData} startAngle={90} endAngle={-270} barSize={22}><PolarAngleAxis type="number" domain={[0, 100]} tick={false} /><RadialBar dataKey="value" background={{ fill: "var(--muted)" }} cornerRadius={12} /><Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Ciclos válidos"]} contentStyle={tooltipStyle} /></RadialBarChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><p className="text-4xl font-semibold text-slate-900">{inclusionPercentage.toFixed(1)}%</p><p className="text-xs text-slate-500">incluidos en TPP</p></div></div>
          ) : <div className="mt-5 flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed bg-slate-50 text-sm text-slate-500">Sin ciclos para calcular la tasa.</div>}
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-2"><Gauge className="text-blue-600" size={19} /><h2 className="font-semibold text-slate-900">Lectura del indicador</h2></div>
        <div className="mt-4 grid gap-3 md:grid-cols-[0.8fr_1fr_1fr_1fr]">
          <div className="rounded-2xl bg-blue-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Promedio completo</p><p className="mt-1 text-3xl font-semibold text-blue-950">{data.promedioTppMs == null ? "—" : `${data.promedioTppMs.toFixed(1)} ms`}</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Qué mide</p><p className="mt-1 text-sm font-medium text-slate-800">Predicción V6, plan, PCS, preguntas y orientación.</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Qué no representa</p><p className="mt-1 text-sm font-medium text-slate-800">No es solo el tiempo interno de inferencia.</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Fuente</p><p className="mt-1 text-sm font-medium text-slate-800">Ciclos DIARIO V6 completos y generados.</p></div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-900">Motivos de exclusión</h2><p className="mt-1 text-xs text-slate-500">Permiten detectar por qué ciertos procesos no participan en el promedio.</p></div>
        {exclusions.length > 0 ? <div className="divide-y divide-slate-100">{exclusions.map((item) => <div key={item.name} className="flex items-center justify-between gap-4 px-5 py-3"><span className="text-sm capitalize text-slate-700">{item.name}</span><span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">{item.value}</span></div>)}</div> : <div className="px-5 py-8 text-center text-sm text-slate-500">No hay causas de exclusión registradas.</div>}
      </Card>
    </div>
  );
}
