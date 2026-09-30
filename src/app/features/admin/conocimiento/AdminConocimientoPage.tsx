import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Brain, CheckCircle2, RefreshCw, Users } from "lucide-react";
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
import { indicadoresService, type PccIndicatorResponse } from "../../../services/indicadores.service";

const COLORS = ["var(--chart-1)", "var(--chart-3)"];
const tooltipStyle = { borderRadius: 12, border: "1px solid #dbe7e1", boxShadow: "0 8px 24px rgba(23,60,54,.12)" };

function reason(value: string | null) {
  if (value === "SIN_RESULTADOS_VALIDOS") return "No existen sesiones diarias de Gemini respondidas que cumplan todos los requisitos del PCC oficial.";
  return value?.replaceAll("_", " ").toLocaleLowerCase() || "No se informó el motivo.";
}

export default function AdminConocimientoPage() {
  const [data, setData] = useState<PccIndicatorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await indicadoresService.pcc());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cargar el indicador PCC.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <LoadingState label="Cargando análisis de conocimiento..." />;
  if (error || !data) return <ErrorState message={error || "No se recibió información del sistema."} />;

  const available = data.estadoDisponibilidad === "DISPONIBLE" && data.porcentajePcc != null && data.totalEvaluadosValidos > 0;
  const otherLevels = Math.max(data.totalEvaluadosValidos - data.totalBajoConocimiento, 0);
  const chartData = [
    { name: "Bajo conocimiento", value: data.totalBajoConocimiento, fill: "var(--chart-1)" },
    { name: "Otros niveles", value: otherLevels, fill: "var(--chart-3)" },
  ];
  const percentageData = [{ name: "PCC", value: data.porcentajePcc ?? 0, fill: "var(--chart-4)" }];

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Conocimiento nutricional"
        subtitle="PCC calculado con la última evaluación diaria Gemini respondida y válida de cada cliente."
        action={<button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw size={14} /> Actualizar</button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard icon={Brain} title="PCC oficial" value={data.porcentajePcc == null ? "—" : `${data.porcentajePcc.toFixed(1)}%`} sub="Clientes con bajo conocimiento" iconBg="bg-indigo-600" />
        <KPICard icon={Users} title="Evaluados válidos" value={String(data.totalEvaluadosValidos)} sub="Última sesión diaria válida por cliente" iconBg="bg-teal-600" />
        <KPICard icon={AlertTriangle} title="Bajo conocimiento" value={String(data.totalBajoConocimiento)} sub="Clientes que requieren atención" iconBg="bg-rose-600" />
      </div>

      {!available && (
        <Card className="border-l-4 border-l-amber-400 p-5">
          <div className="flex gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-amber-500" size={20} /><div><h2 className="font-semibold text-slate-800">PCC no calculable</h2><p className="mt-1 text-sm text-slate-500">{reason(data.motivoNoDisponible)}</p></div></div>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="font-semibold text-slate-900">Distribución de la muestra</h2><p className="mt-1 text-sm text-slate-500">Clientes con bajo conocimiento frente a los demás niveles.</p></div>
            <Badge label={available ? "Muestra disponible" : "Sin muestra"} variant={available ? "success" : "warning"} />
          </div>
          {available ? (
            <div className="relative mt-3 h-[330px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" cx="50%" cy="46%" innerRadius={78} outerRadius={116} paddingAngle={2} stroke="none">
                    {chartData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, "Clientes"]} contentStyle={tooltipStyle} />
                  <Legend verticalAlign="bottom" iconType="circle" iconSize={9} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-x-0 top-[126px] text-center"><p className="text-4xl font-semibold text-slate-900">{data.porcentajePcc?.toFixed(1)}%</p><p className="text-xs text-slate-500">PCC oficial</p></div>
            </div>
          ) : (
            <div className="mt-5 flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed bg-slate-50 px-6 text-center"><Brain className="h-10 w-10 text-slate-300" /><p className="mt-3 font-semibold text-slate-700">Sin resultados válidos</p><p className="mt-1 max-w-md text-sm text-slate-500">El gráfico aparecerá cuando el sistema reconozca al menos una evaluación oficial válida.</p></div>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <div><h2 className="font-semibold text-slate-900">Comparación de clientes</h2><p className="mt-1 text-sm text-slate-500">Cantidad absoluta por resultado de conocimiento.</p></div>
          {available ? (
            <div className="mt-5 h-[300px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 35, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={112} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [value, "Clientes"]} contentStyle={tooltipStyle} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={52}>
                    {chartData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                    <LabelList dataKey="value" position="right" fill="var(--foreground)" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="mt-5 flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed bg-slate-50 text-sm text-slate-500">Sin muestra para comparar.</div>}
        </Card>

        <Card className="p-5 sm:p-6 lg:col-span-2 xl:col-span-1">
          <div><h2 className="font-semibold text-slate-900">Proporción PCC</h2><p className="mt-1 text-sm text-slate-500">Porcentaje oficial dentro de una escala de 0 a 100%.</p></div>
          {available ? (
            <div className="relative mt-5 h-[300px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="68%" outerRadius="100%" data={percentageData} startAngle={90} endAngle={-270} barSize={22}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="value" background={{ fill: "var(--muted)" }} cornerRadius={12} />
                  <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "PCC"]} contentStyle={tooltipStyle} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><p className="text-4xl font-semibold text-slate-900">{data.porcentajePcc?.toFixed(1)}%</p><p className="text-xs text-slate-500">bajo conocimiento</p></div>
            </div>
          ) : <div className="mt-5 flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed bg-slate-50 text-sm text-slate-500">PCC todavía no calculable.</div>}
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-teal-600" size={20} /><div><h2 className="font-semibold text-slate-900">Qué dato toma PCC</h2><p className="mt-2 text-sm leading-6 text-slate-600">Usa exclusivamente la <strong>última sesión diaria de Gemini respondida y válida</strong> de cada cliente, asociada a una predicción V6 y a la configuración oficial pcc-ia-v1.</p></div></div>
      </Card>
    </div>
  );
}
