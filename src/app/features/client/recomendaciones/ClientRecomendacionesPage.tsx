import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle, Apple, Beef, CheckCircle2, Droplets, Gauge, Lightbulb,
  RefreshCw, Salad, Sparkles, Wheat,
} from "lucide-react";
import { Card, ErrorState, LoadingState, SectionHeader } from "../../../components/shared";
import { useAuth } from "../../../context/AuthContext";
import {
  orientacionService,
  type ComparacionOrientacion,
  type OrientacionResponse,
} from "../../../services/orientacion.service";
import type { ClasificacionPredictiva } from "../../../services/analisis-predictivo.service";
import { resumenDiarioService, type ResumenDiarioResponse } from "../../../services/resumen-diario.service";
import { toast } from "../../../services/notifications";

const labels: Record<ClasificacionPredictiva, string> = {
  ADECUADO: "Adecuado",
  MEJORABLE: "Mejorable",
  CRITICO: "Crítico",
};

const consejos = [
  { title: "Alimentación", text: "Prioriza variedad de alimentos y porciones consistentes con tus metas diarias.", icon: Salad },
  { title: "Proteínas", text: "Distribuye fuentes de proteína entre las comidas principales.", icon: Beef },
  { title: "Carbohidratos", text: "Prefiere cereales integrales, tubérculos, frutas y legumbres.", icon: Wheat },
  { title: "Grasas", text: "Incluye grasas insaturadas en porciones moderadas y limita frituras frecuentes.", icon: Apple },
  { title: "Hidratación", text: "Distribuye los líquidos de bebidas —incluida el agua— a lo largo del día, especialmente alrededor de la actividad física.", icon: Droplets },
  { title: "Hábitos", text: "Registrar de forma constante permite comparar resultados y reconocer patrones reales.", icon: CheckCircle2 },
];

export default function ClientRecomendacionesPage() {
  const { user } = useAuth();
  const [data, setData] = useState<OrientacionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoy, setHoy] = useState<ResumenDiarioResponse | null>(null);

  const load = useCallback(async (notificar = false) => {
    if (!user?.clienteId) return;
    setLoading(true);
    setError("");
    try {
      const [orientacion, resumen] = await Promise.all([orientacionService.obtener(user.clienteId), resumenDiarioService.get(user.clienteId, new Date().toLocaleDateString("sv-SE", { timeZone: "America/Lima" }))]);
      setData(orientacion);
      setHoy(resumen);
      if (notificar) toast.success("Orientación y consumo actualizados.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cargar la orientación.");
    } finally {
      setLoading(false);
    }
  }, [user?.clienteId]);

  useEffect(() => { void load(); }, [load]);

  return <div>
    <SectionHeader
      title="Orientación nutricional"
      subtitle="Mejoras explicadas a partir de tu última evaluación diaria guardada."
      action={<button onClick={() => void load(true)} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50"><RefreshCw size={14} className={loading ? "animate-spin" : ""}/>Actualizar</button>}
    />

    {loading ? <LoadingState label="Cargando orientación..." /> : error ? <ErrorState message={error} /> : <div className="space-y-6">
      {data?.personalizadaDisponible && data.evaluacion ? <>
        <EvaluationCard data={data} />
        <ComparisonSection items={data.comparaciones} />

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2"><Gauge size={18} className="text-amber-500"/><h2 className="text-base font-semibold text-slate-900">Principales aspectos a mejorar</h2></div>
            <div className="space-y-3">{data.prioridades.map((item, index) => <div key={item.codigo} className="rounded-xl border border-slate-100 bg-slate-50 p-4"><div className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">{index + 1}</span><div><h3 className="text-sm font-semibold text-slate-800">{item.titulo}</h3><p className="mt-1 text-xs leading-5 text-slate-600">{item.descripcion}</p></div></div></div>)}</div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2"><Sparkles size={18} className="text-indigo-500"/><h2 className="text-base font-semibold text-slate-900">Recomendaciones personalizadas</h2></div>
            <div className="space-y-3">{data.recomendaciones.map(item => <div key={item.codigo} className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4"><h3 className="text-sm font-semibold text-indigo-950">{item.titulo}</h3><p className="mt-1 text-xs leading-5 text-slate-700">{item.descripcion}</p><p className="mt-2 text-[11px] text-indigo-600">Basada en: {item.basadaEn}</p></div>)}</div>
          </Card>
        </div>
      </> : <Card className="border-amber-200 bg-amber-50 p-6"><div className="flex items-start gap-3"><AlertTriangle size={22} className="mt-0.5 shrink-0 text-amber-600"/><div><h2 className="font-semibold text-amber-950">Orientación personalizada pendiente</h2><p className="mt-1 text-sm leading-6 text-amber-800">{data?.mensaje ?? "Completa al menos un día de registro de alimentos y agua para recibir orientación nutricional personalizada."}</p><p className="mt-2 text-xs text-amber-700">No se generaron recomendaciones personalizadas ni una nueva predicción.</p></div></div></Card>}

      {hoy?.objetivo.estado === "DISPONIBLE" && <Card className="p-5">
        <div className="flex items-center gap-2"><Gauge size={18} className="text-teal-600"/><h2 className="font-semibold text-slate-900">Tu avance de hoy</h2></div>
        <p className="mt-1 text-xs leading-5 text-slate-500">Datos reales del {hoy.fecha}. Este seguimiento no es una clasificación predictiva ni sustituye la orientación del día evaluado.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[
          { nombre: "Calorías", valor: hoy.consumido.kcal, meta: hoy.objetivo.kcal, unidad: "kcal" },
          { nombre: "Proteínas", valor: hoy.consumido.proteina, meta: hoy.objetivo.proteina, unidad: "g" },
          { nombre: "Carbohidratos", valor: hoy.consumido.carbohidratos, meta: hoy.objetivo.carbohidratos, unidad: "g" },
          { nombre: "Grasas", valor: hoy.consumido.grasas, meta: hoy.objetivo.grasas, unidad: "g" },
          { nombre: "Agua y bebidas", valor: hoy.agua.consumidoMl, meta: hoy.agua.objetivoMl, unidad: "ml" },
        ].map(item => <div key={item.nombre} className="rounded-xl bg-teal-50 p-3"><p className="text-xs font-semibold text-teal-900">{item.nombre}</p><p className="mt-2 text-sm font-bold">{item.valor ?? "Sin registro"} / {item.meta ?? "Sin meta"} {item.unidad}</p>{item.valor != null && item.meta != null && <p className="mt-1 text-xs text-teal-800">Diferencia respecto a la meta: {(item.valor - item.meta).toLocaleString("es-PE", { maximumFractionDigits: 1 })} {item.unidad}</p>}</div>)}</div>
      </Card>}
      <EducationalSection />
      <p className="text-xs text-slate-400">La orientación utiliza registros guardados y no reemplaza la evaluación de un profesional de salud.</p>
    </div>}
  </div>;
}

function EvaluationCard({ data }: { data: OrientacionResponse }) {
  const evaluation = data.evaluacion!;
  const probs: Array<[ClasificacionPredictiva, number]> = [
    ["ADECUADO", evaluation.probAdecuado],
    ["MEJORABLE", evaluation.probMejorable],
    ["CRITICO", evaluation.probCritico],
  ];
  return <Card className="overflow-hidden">
    <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-emerald-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Última evaluación guardada</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold text-slate-900">{labels[evaluation.clasificacion]}</h2><p className="mt-1 text-xs text-slate-600">Día evaluado: {new Date(`${evaluation.fechaEvaluada}T00:00:00`).toLocaleDateString("es-PE", { dateStyle: "long" })}</p><p className="mt-1 text-[11px] text-slate-500">Modelo {evaluation.modelVersion}{evaluation.confianzaPct != null ? ` · confianza ${evaluation.confianzaPct.toLocaleString("es-PE", { maximumFractionDigits: 2 })}%` : ""}{evaluation.inferenceMs != null ? ` · inferencia ${evaluation.inferenceMs.toLocaleString("es-PE", { maximumFractionDigits: 2 })} ms` : ""}</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">Predicción #{evaluation.prediccionId}</span></div>
    </div>
    <div className="grid gap-4 p-5 sm:grid-cols-3">{probs.map(([key, value]) => <div key={key}><div className="mb-1.5 flex justify-between text-xs"><span className="text-slate-600">{labels[key]}</span><strong className="text-slate-800">{(value * 100).toLocaleString("es-PE", { maximumFractionDigits: 2 })}%</strong></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${key === "ADECUADO" ? "bg-emerald-500" : key === "MEJORABLE" ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${Math.min(100, value * 100)}%` }}/></div></div>)}</div>
  </Card>;
}

function ComparisonSection({ items }: { items: ComparacionOrientacion[] }) {
  return <section><div className="mb-3"><h2 className="text-base font-semibold text-slate-900">Meta vs. consumo real</h2><p className="mt-1 text-xs text-slate-500">Los porcentajes se calculan con los datos almacenados del día evaluado. La hidratación incluye agua y otras bebidas registradas.</p></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">{items.map(item => <MetricCard key={item.codigo} item={item}/>)}</div></section>;
}

function MetricCard({ item }: { item: ComparacionOrientacion }) {
  const tone = item.estado === "EN_RANGO" ? "text-emerald-700 bg-emerald-50" : item.estado === "ALTO" ? "text-rose-700 bg-rose-50" : "text-amber-700 bg-amber-50";
  const bar = item.estado === "EN_RANGO" ? "bg-emerald-500" : item.estado === "ALTO" ? "bg-rose-500" : "bg-amber-500";
  return <Card className="p-4"><div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold text-slate-700">{item.nombre}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone}`}>{item.estado === "EN_RANGO" ? "Adecuado" : item.estado === "ALTO" ? "Exceso" : "Déficit"}</span></div><p className="mt-3 text-lg font-bold text-slate-900">{item.consumido.toLocaleString("es-PE", { maximumFractionDigits: 1 })} <span className="text-xs font-normal text-slate-500">/ {item.meta.toLocaleString("es-PE", { maximumFractionDigits: 1 })} {item.unidad}</span></p>{item.diferencia != null && <p className="mt-1 text-[11px] text-slate-500">Diferencia: {item.diferencia > 0 ? "+" : ""}{item.diferencia.toLocaleString("es-PE", { maximumFractionDigits: 1 })} {item.unidad}</p>}<div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.min(100, item.porcentaje)}%` }}/></div><p className="mt-1.5 text-right text-xs font-semibold text-slate-600">{item.porcentaje.toLocaleString("es-PE", { maximumFractionDigits: 1 })}%</p></Card>;
}

function EducationalSection() {
  return <section><div className="mb-3 flex items-center gap-2"><Lightbulb size={18} className="text-emerald-600"/><div><h2 className="text-base font-semibold text-slate-900">Consejos nutricionales</h2><p className="text-xs text-slate-500">Contenido educativo general disponible incluso antes de tu primera evaluación.</p></div></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{consejos.map(({ title, text, icon: Icon }) => <Card key={title} className="p-4"><div className="flex items-start gap-3"><div className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><Icon size={17}/></div><div><h3 className="text-sm font-semibold text-slate-800">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-600">{text}</p></div></div></Card>)}</div></section>;
}
