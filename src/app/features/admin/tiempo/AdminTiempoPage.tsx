import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Gauge, RefreshCw, TimerReset } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge, Card, ErrorState, KPICard, LoadingState, SectionHeader } from "../../../components/shared";
import { indicadoresService, type TppIndicatorResponse } from "../../../services/indicadores.service";

const tooltipStyle = { borderRadius: 12, border: "1px solid #dbe7e1", boxShadow: "0 8px 24px rgba(23,60,54,.12)" };

function reason(value: string | null) {
  if (value === "SIN_ANALISIS_VALIDOS") return "Aún no existen análisis completos y válidos para calcular el tiempo promedio.";
  return value?.replaceAll("_", " ").toLocaleLowerCase() || "El backend no informó el motivo.";
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
  if (error || !data) return <ErrorState message={error || "Respuesta vacía del backend."} />;

  const available = data.estadoDisponibilidad === "DISPONIBLE" && data.promedioTppMs != null;
  const total = data.totalAnalisisValidos + data.totalAnalisisExcluidos;
  const sampleData = [
    { name: "Válidos", value: data.totalAnalisisValidos, fill: "#16a34a" },
    { name: "Excluidos", value: data.totalAnalisisExcluidos, fill: "#dc2626" },
  ];
  const exclusions = Object.entries(data.exclusiones ?? {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Tiempo de procesamiento predictivo"
        subtitle="Análisis del TPP oficial, cobertura de medición y causas de exclusión."
        action={<button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw size={14} /> Actualizar</button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard icon={Clock3} title="TPP oficial" value={data.promedioTppMs == null ? "—" : `${data.promedioTppMs.toFixed(data.promedioTppMs >= 100 ? 0 : 1)} ms`} sub="Proceso completo de análisis" iconBg="bg-indigo-600" />
        <KPICard icon={CheckCircle2} title="Análisis válidos" value={String(data.totalAnalisisValidos)} sub="Incluidos en el promedio" iconBg="bg-emerald-600" />
        <KPICard icon={AlertTriangle} title="Análisis excluidos" value={String(data.totalAnalisisExcluidos)} sub="No incluidos en el TPP" iconBg="bg-amber-500" />
      </div>

      {!available && <Card className="border-l-4 border-l-amber-400 p-5"><div className="flex gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-amber-500" size={20} /><div><h2 className="font-semibold text-slate-800">TPP no calculable</h2><p className="mt-1 text-sm text-slate-500">{reason(data.motivoNoDisponible)}</p></div></div></Card>}

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-900">Calidad de la muestra</h2><p className="mt-1 text-sm text-slate-500">Relación entre análisis incluidos y descartados del TPP.</p></div><Badge label={available ? "TPP disponible" : "Sin TPP"} variant={available ? "success" : "warning"} /></div>
          {total > 0 ? (
            <div className="mt-5 grid items-center gap-4 lg:grid-cols-2">
              <div className="h-[280px] min-w-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={sampleData} margin={{ top: 25, right: 15, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} /><Tooltip formatter={(value: number) => [value, "Análisis"]} contentStyle={tooltipStyle} /><Bar dataKey="value" radius={[8,8,0,0]} maxBarSize={75}>{sampleData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}<LabelList dataKey="value" position="top" fill="#334155" /></Bar></BarChart></ResponsiveContainer></div>
              <div className="relative h-[280px] min-w-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={sampleData} dataKey="value" cx="50%" cy="50%" innerRadius={62} outerRadius={94} paddingAngle={2} stroke="none">{sampleData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}</Pie><Tooltip formatter={(value: number) => [value, "Análisis"]} contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-x-0 top-[112px] text-center"><p className="text-3xl font-semibold text-slate-900">{total}</p><p className="text-xs text-slate-500">procesados</p></div></div>
            </div>
          ) : <div className="mt-5 flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed bg-slate-50 px-6 text-center"><TimerReset className="h-10 w-10 text-slate-300" /><p className="mt-3 font-semibold text-slate-700">Sin procesos medidos</p><p className="mt-1 text-sm text-slate-500">Todavía no existen análisis válidos ni excluidos para visualizar.</p></div>}
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-2"><Gauge className="text-blue-600" size={19} /><h2 className="font-semibold text-slate-900">Lectura del indicador</h2></div>
          <div className="mt-4 rounded-2xl bg-blue-50 p-5"><p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Promedio del proceso completo</p><p className="mt-1 text-4xl font-semibold text-blue-950">{data.promedioTppMs == null ? "—" : `${data.promedioTppMs.toFixed(1)} ms`}</p></div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-slate-500">Qué mide</dt><dd className="mt-1 font-medium text-slate-800">Desde el inicio instrumentado hasta que el resultado completo queda disponible.</dd></div>
            <div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-slate-500">Qué no representa</dt><dd className="mt-1 font-medium text-slate-800">No es únicamente el tiempo interno de inferencia del modelo.</dd></div>
            <div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-slate-500">Fuente</dt><dd className="mt-1 font-medium text-slate-800">Eventos de análisis válidos definidos por el backend.</dd></div>
          </dl>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-900">Motivos de exclusión</h2><p className="mt-1 text-xs text-slate-500">Permiten detectar por qué ciertos procesos no participan en el promedio.</p></div>
        {exclusions.length > 0 ? <div className="divide-y divide-slate-100">{exclusions.map((item) => <div key={item.name} className="flex items-center justify-between gap-4 px-5 py-3"><span className="text-sm text-slate-700">{item.name.replaceAll("_", " ").toLocaleLowerCase()}</span><span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">{item.value}</span></div>)}</div> : <div className="px-5 py-8 text-center text-sm text-slate-500">No hay causas de exclusión registradas.</div>}
      </Card>
    </div>
  );
}
