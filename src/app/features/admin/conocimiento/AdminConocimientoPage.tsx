import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Brain, CheckCircle2, RefreshCw, Users } from "lucide-react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Badge, Card, ErrorState, KPICard, LoadingState, SectionHeader } from "../../../components/shared";
import { indicadoresService, type PccIndicatorResponse } from "../../../services/indicadores.service";

const COLORS = ["#dc2626", "#0f766e"];
const tooltipStyle = { borderRadius: 12, border: "1px solid #dbe7e1", boxShadow: "0 8px 24px rgba(23,60,54,.12)" };

function reason(value: string | null) {
  if (value === "SIN_RESULTADOS_VALIDOS") return "No existen resultados oficiales con estado de validez y nivel de conocimiento calculado.";
  return value?.replaceAll("_", " ").toLocaleLowerCase() || "El backend no informó el motivo.";
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
  if (error || !data) return <ErrorState message={error || "Respuesta vacía del backend."} />;

  const available = data.estadoDisponibilidad === "DISPONIBLE" && data.porcentajePcc != null && data.totalEvaluadosValidos > 0;
  const otherLevels = Math.max(data.totalEvaluadosValidos - data.totalBajoConocimiento, 0);
  const chartData = [
    { name: "Bajo conocimiento", value: data.totalBajoConocimiento },
    { name: "Otros niveles", value: otherLevels },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Conocimiento nutricional"
        subtitle="Análisis del PCC oficial y de la cobertura de evaluaciones válidas."
        action={<button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw size={14} /> Actualizar</button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard icon={Brain} title="PCC oficial" value={data.porcentajePcc == null ? "—" : `${data.porcentajePcc.toFixed(1)}%`} sub="Clientes con bajo conocimiento" iconBg="bg-indigo-600" />
        <KPICard icon={Users} title="Evaluados válidos" value={String(data.totalEvaluadosValidos)} sub="Último resultado válido por cliente" iconBg="bg-teal-600" />
        <KPICard icon={AlertTriangle} title="Bajo conocimiento" value={String(data.totalBajoConocimiento)} sub="Clientes que requieren atención" iconBg="bg-rose-600" />
      </div>

      {!available && (
        <Card className="border-l-4 border-l-amber-400 p-5">
          <div className="flex gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-amber-500" size={20} /><div><h2 className="font-semibold text-slate-800">PCC no calculable</h2><p className="mt-1 text-sm text-slate-500">{reason(data.motivoNoDisponible)}</p></div></div>
        </Card>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
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
            <div className="mt-5 flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed bg-slate-50 px-6 text-center"><Brain className="h-10 w-10 text-slate-300" /><p className="mt-3 font-semibold text-slate-700">Sin resultados válidos</p><p className="mt-1 max-w-md text-sm text-slate-500">El gráfico aparecerá cuando el backend reconozca al menos una evaluación oficial válida.</p></div>
          )}
        </Card>

        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-900">Composición del indicador</h2></div>
            <div className="divide-y divide-slate-100">
              {chartData.map((row, index) => (
                <div key={row.name} className="flex items-center justify-between gap-3 px-5 py-4"><div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} /><span className="text-sm text-slate-600">{row.name}</span></div><span className="text-lg font-semibold text-slate-900">{row.value}</span></div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-teal-600" size={20} /><div><h2 className="font-semibold text-slate-900">Qué dato toma PCC</h2><p className="mt-2 text-sm leading-6 text-slate-600">Usa el último <strong>ResultadoTest válido</strong> de cada cliente. Las evaluaciones diarias generadas por Gemini siguen siendo complementarias mientras el backend no las incorpore al indicador oficial.</p></div></div>
          </Card>
        </div>
      </div>
    </div>
  );
}
