import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, PieChart as PieChartIcon, RefreshCw, ShieldCheck, Users } from "lucide-react";
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
  Treemap,
  XAxis,
  YAxis,
} from "recharts";
import { Badge, Card, ErrorState, KPICard, LoadingState, SectionHeader } from "../../../components/shared";
import { indicadoresService, type PcsIndicatorResponse } from "../../../services/indicadores.service";

const reasons: Record<string, string> = {
  SIN_EVALUACIONES_VALIDAS: "No existen evaluaciones de consumo válidas para calcular PCS.",
  CLASIFICACION_METODOLOGICA_NO_DISPONIBLE: "La clasificación metodológica del consumo todavía no está disponible.",
  POLITICA_SELECCION_EVALUACION_NO_DEFINIDA: "No está definida la política para seleccionar la última evaluación válida.",
};

const tooltipStyle = { borderRadius: 12, border: "1px solid #dbe7e1", boxShadow: "0 8px 24px rgba(23,60,54,.12)" };

function reason(value: string | null) {
  return value ? reasons[value] ?? value.replaceAll("_", " ").toLocaleLowerCase() : "No se informó el motivo.";
}

export default function AdminConsumoPage() {
  const [data, setData] = useState<PcsIndicatorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await indicadoresService.pcs());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cargar el indicador PCS.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <LoadingState label="Cargando análisis de suplementación..." />;
  if (error || !data) return <ErrorState message={error || "No se recibió información del sistema."} />;

  const available = data.estadoDisponibilidad === "DISPONIBLE" && data.porcentajePcs != null && data.totalEvaluadosValidos > 0;
  const notHigh = Math.max(data.totalEvaluadosValidos - data.totalAltoConsumo, 0);
  const chartData = [
    { name: "Alto consumo", value: data.totalAltoConsumo, fill: "var(--chart-1)" },
    { name: "No alto", value: notHigh, fill: "var(--chart-3)" },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Consumo de suplementación"
        subtitle="Análisis del PCS oficial y de los clientes incluidos en su cálculo."
        action={<button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw size={14} /> Actualizar</button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard icon={PieChartIcon} title="PCS oficial" value={data.porcentajePcs == null ? "—" : `${data.porcentajePcs.toFixed(1)}%`} sub="Clientes con alto consumo" iconBg="bg-indigo-600" />
        <KPICard icon={Users} title="Evaluados válidos" value={String(data.totalEvaluadosValidos)} sub="Última evaluación válida por cliente" iconBg="bg-teal-600" />
        <KPICard icon={AlertTriangle} title="Alto consumo" value={String(data.totalAltoConsumo)} sub="Casos detectados por el sistema" iconBg="bg-rose-600" />
      </div>

      {!available && <Card className="border-l-4 border-l-amber-400 p-5"><div className="flex gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-amber-500" size={20} /><div><h2 className="font-semibold text-slate-800">PCS no calculable</h2><p className="mt-1 text-sm text-slate-500">{reason(data.motivoNoDisponible)}</p></div></div></Card>}

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-900">Distribución del consumo</h2><p className="mt-1 text-sm text-slate-500">Casos clasificados con alto consumo frente al resto de evaluados.</p></div><Badge label={available ? "Muestra disponible" : "Sin muestra"} variant={available ? "success" : "warning"} /></div>
          {available ? (
            <div className="mt-3 h-[330px] min-w-0">
              <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="46%" outerRadius={112} paddingAngle={2} stroke="none" label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}>{chartData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}</Pie><Tooltip formatter={(value: number) => [value, "Clientes"]} contentStyle={tooltipStyle} /><Legend verticalAlign="bottom" iconType="circle" iconSize={9} /></PieChart></ResponsiveContainer>
            </div>
          ) : <div className="mt-5 flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed bg-slate-50 px-6 text-center"><PieChartIcon className="h-10 w-10 text-slate-300" /><p className="mt-3 font-semibold text-slate-700">Sin evaluaciones válidas</p><p className="mt-1 max-w-md text-sm text-slate-500">El gráfico se habilitará cuando exista al menos una clasificación de consumo válida.</p></div>}
        </Card>

        <Card className="p-5 sm:p-6">
          <div><h2 className="font-semibold text-slate-900">Casos por clasificación</h2><p className="mt-1 text-sm text-slate-500">Comparación en columnas de la muestra evaluada.</p></div>
          {available ? (
            <div className="mt-5 h-[300px] min-w-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 25, right: 15, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} /><Tooltip formatter={(value: number) => [value, "Clientes"]} contentStyle={tooltipStyle} /><Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={72}>{chartData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}<LabelList dataKey="value" position="top" fill="var(--foreground)" /></Bar></BarChart></ResponsiveContainer></div>
          ) : <div className="mt-5 flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed bg-slate-50 text-sm text-slate-500">Sin casos para comparar.</div>}
        </Card>

        <Card className="p-5 sm:p-6 lg:col-span-2 xl:col-span-1">
          <div><h2 className="font-semibold text-slate-900">Peso dentro de la muestra</h2><p className="mt-1 text-sm text-slate-500">El área de cada bloque representa su cantidad de clientes.</p></div>
          {available ? (
            <div className="mt-5 h-[300px] min-w-0 overflow-hidden rounded-2xl"><ResponsiveContainer width="100%" height="100%"><Treemap data={chartData} dataKey="value" nameKey="name" stroke="var(--card)" aspectRatio={4 / 3}><Tooltip formatter={(value: number) => [value, "Clientes"]} contentStyle={tooltipStyle} /></Treemap></ResponsiveContainer></div>
          ) : <div className="mt-5 flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed bg-slate-50 text-sm text-slate-500">Sin muestra para representar.</div>}
        </Card>
      </div>

      <Card className="p-5"><div className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-teal-600" size={20} /><div><h2 className="font-semibold text-slate-900">Qué significa “alto consumo”</h2><p className="mt-2 text-sm leading-6 text-slate-600">No se determina por la cantidad de suplementos distintos. El sistema evalúa componentes, cantidades observadas, unidades y límites de la rúbrica vigente.</p></div></div></Card>
    </div>
  );
}
