import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, BookOpen, Flame, Wheat, Droplets, Clock3, Lightbulb, ArrowRight, Utensils, Info } from "lucide-react";
import { Badge, Card, ProgressBar } from "../../../components/shared";
import { FONT_HEADING } from "../../../types";
import { useAuth } from "../../../context/AuthContext";
import { habitosService } from "../../../services/habitos.service";
import { analisisPredictivoService, type PrediccionModeloHistorialResponse } from "../../../services/analisis-predictivo.service";
import { analisisNutricionalService, type AnalisisNutricionalDiarioResponse } from "../../../services/analisis-nutricional.service";
import { conocimientoIaService } from "../../../services/conocimiento-ia.service";
import { conocimientoService, type ResultadoTestResponse } from "../../../services/conocimiento.service";
import { objetivoNutricionalService, type ObjetivoNutricionalResponse } from "../../../services/objetivo-nutricional.service";
import { planDiarioService } from "../../../services/plan-diario.service";
import { pesoSemanalService, type EstadoPesoSemanal } from "../../../services/peso-semanal.service";
import { resumenDiarioService } from "../../../services/resumen-diario.service";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}
function formatLongDate(d: Date) {
  return d.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
}
function formatShortDate(iso: string) {
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
  } catch {
    return iso;
  }
}

export default function ClientHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasRegistroHoy, setHasRegistroHoy] = useState(false);
  const [latest, setLatest] = useState<PrediccionModeloHistorialResponse | null>(null);
  const [nutrition, setNutrition] = useState<AnalisisNutricionalDiarioResponse | null>(null);
  const [preparacion, setPreparacion] = useState<{ puedeAnalizar: boolean; xDisponibles: number; xTotal: number } | null>(null);
  const [aprendizaje, setAprendizaje] = useState<{ tema: string; porcentaje: number; proximaRevision: string | null; requiereRefuerzo: boolean } | null>(null);
  const [conocimiento, setConocimiento] = useState<ResultadoTestResponse | null>(null);
  const [objetivo, setObjetivo] = useState<ObjetivoNutricionalResponse | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [pesoEstado, setPesoEstado] = useState<EstadoPesoSemanal | null>(null);

  useEffect(() => {
    let ignore = false;
    if (!user?.clienteId) return;
    const fecha = new Date().toLocaleDateString("sv-SE");
    setLoadingProgress(true);
    void planDiarioService.inicializar(user.clienteId, fecha)
      .then(() => conocimientoIaService.inicial(user.clienteId!))
      .catch(() => null)
      .then(() => Promise.all([
      habitosService.listByCliente(user.clienteId).catch(() => []),
      analisisPredictivoService.listByCliente(user.clienteId).catch(() => []),
      analisisNutricionalService.diario(user.clienteId, fecha).catch(() => null),
      analisisPredictivoService.preparacion(user.clienteId, fecha).catch(() => null),
      conocimientoIaService.obtener(user.clienteId).catch(() => null),
      conocimientoService.history(user.clienteId).catch(() => [] as ResultadoTestResponse[]),
      objetivoNutricionalService.obtener(user.clienteId, fecha).catch(() => null),
      pesoSemanalService.estado(user.clienteId).catch(() => null),
      resumenDiarioService.get(user.clienteId, fecha),
    ]))
      .then(([habits, predictions, daily, prep, adaptEstado, hist, obj, peso, resumen]) => {
        if (ignore) return;
        const hoyHabits = Array.isArray(habits) ? habits.filter((h: { fecha: string }) => h.fecha === fecha) : [];
        setHasRegistroHoy(hoyHabits.length > 0);
        const sorted = Array.isArray(predictions) ? [...predictions].sort((a, b) => new Date(b.fechaCorte).getTime() - new Date(a.fechaCorte).getTime()) : [];
        setLatest(sorted[0] ?? null);
        setNutrition(daily && resumen ? { ...daily, componentes: daily.componentes.map(c => c.componente === "ENERGIA" ? { ...c, consumido: resumen.consumido.kcal, objetivo: resumen.objetivo.kcal, diferencia: resumen.diferenciaKcal, porcentajeCumplimiento: resumen.porcentajeKcal } : c) } : daily);
        if (prep) setPreparacion({ puedeAnalizar: prep.puedeAnalizar, xDisponibles: prep.xDisponibles, xTotal: prep.xTotal });
        else setPreparacion(null);
        if (adaptEstado?.estadoAdaptativo === "GENERADA" && adaptEstado.preguntasAdaptativas.length > 0) {
          setAprendizaje({ tema: adaptEstado.preguntasAdaptativas[0].tema, porcentaje: 0, proximaRevision: null, requiereRefuerzo: true });
        } else setAprendizaje(null);
        if (Array.isArray(hist) && hist.length > 0) {
          const sortedHist = [...hist].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
          setConocimiento(sortedHist[0] ?? null);
        } else setConocimiento(null);
        setObjetivo(obj as ObjetivoNutricionalResponse | null);
        setPesoEstado(peso as EstadoPesoSemanal | null);
      })
      .catch((e) => {
        if (!ignore) {
          console.error("Home fetch error", e);
          setFetchError(e instanceof Error ? e.message : String(e));
        }
      })
      .finally(() => {
        if (!ignore) setLoadingProgress(false);
      });
    return () => {
      ignore = true;
    };
  }, [user?.clienteId]);

  const greeting = getGreeting();
  const todayLong = formatLongDate(new Date());
  const componentes = Array.isArray(nutrition?.componentes) ? nutrition.componentes : [];

  // TU DÍA barras — from nutrition
  const energia = componentes.find((c) => c.componente === "ENERGIA");
  const proteina = componentes.find((c) => c.componente === "PROTEINA");
  const carbo = componentes.find((c) => c.componente === "CARBOHIDRATOS");
  const grasa = componentes.find((c) => c.componente === "GRASAS");

  // TU PROGRESO — 3 indicadores compactos
  const conocimientoLabel = conocimiento ? `${conocimiento.porcentaje}% · ${conocimiento.nivel}` : "Pendiente";
  const conocimientoSub = conocimiento ? `${conocimiento.correctas}/${conocimiento.total} · ${formatShortDate(conocimiento.fecha)}` : "Sin evaluación oficial";

  const consumoLabel = (() => {
    if (!latest) return "Pendiente";
    if (latest.estadoPcs === "ALTO") return "Revisar";
    if (latest.estadoPcs === "NO_ALTO") return "Adecuado";
    if (latest.estadoPcs === "NO_DETERMINADA") return "No determinado";
    return "Pendiente";
  })();
  const consumoSub = latest?.estadoPcs ? `PCS: ${latest.estadoPcs}` : "Basado en registros reales";

  const tiempoLabel = (() => {
    const ms = (latest as any)?.inferenceMs ?? (latest as any)?.inference_ms ?? null;
    if (ms != null) return `${(ms / 1000).toFixed(2)} s`;
    if (latest) return "—";
    return "Pendiente";
  })();
  const tiempoSub = latest ? `Inferencia del análisis ${formatShortDate(latest.fechaCorte)}` : "Aún sin inferencia";

  // Siguiente paso contextual
  const siguiente = (() => {
    if (!hasRegistroHoy) {
      return {
        title: "Te falta registrar tu consumo de hoy",
        desc: "Registra tu alimentación para actualizar tu progreso diario.",
        cta: "Registrar ahora",
        path: "/client/habitos",
        tone: "amber" as const,
      };
    }
    if (latest?.estadoPccIa === "GENERADA") {
      return {
        title: "Tienes una evaluación pendiente",
        desc: "Completa la actividad de conocimiento generada tras tu último análisis.",
        cta: "Continuar",
        path: "/client/conocimiento",
        tone: "indigo" as const,
      };
    }
    if (aprendizaje?.requiereRefuerzo) {
      return {
        title: `Refuerza: ${aprendizaje.tema}`,
        desc: `${Math.round(aprendizaje.porcentaje)}% de dominio · Próximo refuerzo: ${aprendizaje.proximaRevision ? formatShortDate(aprendizaje.proximaRevision) : "Hoy"}`,
        cta: "Continuar aprendizaje",
        path: "/client/conocimiento",
        tone: "indigo" as const,
      };
    }
    if (preparacion && !preparacion.puedeAnalizar) {
      return {
        title: "Completa tu registro para el análisis",
        desc: preparacion.xDisponibles === 8 ? "Tu perfil está listo. El consumo de hoy se evaluará mañana y generará tu test y orientación." : "Completa el perfil y el registro de alimentos y agua del día anterior.",
        cta: "Registrar consumo",
        path: "/client/habitos",
        tone: "teal" as const,
      };
    }
    if (preparacion?.puedeAnalizar && !latest) {
      return {
        title: "Ya tienes información suficiente para tu análisis",
        desc: "Solicita tu análisis predictivo cuando estés listo.",
        cta: "Realizar análisis",
        path: "/client/analisis",
        tone: "purple" as const,
      };
    }
    if (latest) {
      return {
        title: "Estás al día",
        desc: "Revisa tu historial para ver cómo has evolucionado.",
        cta: "Ver historial",
        path: "/client/historial",
        tone: "slate" as const,
      };
    }
    return {
      title: "Comienza registrando tu alimentación",
      desc: "Tu progreso se calculará a partir de registros reales.",
      cta: "Ir a Mi alimentación",
      path: "/client/habitos",
      tone: "teal" as const,
    };
  })();

  return (
    <div className="space-y-5">
      {fetchError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          No se pudieron cargar algunos datos de inicio: {fetchError} — el saludo y acciones básicas siguen disponibles.
        </div>
      )}
      {/* Saludo + fecha — §20 */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-slate-900" style={FONT_HEADING}>
          {greeting}, {user?.nombre?.split(" ")[0] ?? "Usuario"}
        </h1>
        <p className="text-sm capitalize text-slate-500">{todayLong}</p>
      </div>

      {pesoEstado?.habilitado && (
        <Card className="border-teal-200 bg-teal-50/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-teal-900">Actualiza tu peso semanal</p><p className="mt-1 text-xs text-teal-700">El nuevo dato ajustará las metas a partir del siguiente plan, no cambiará el día actual.</p></div><button onClick={() => navigate("/client/profile")} className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white">Registrar peso</button></div>
        </Card>
      )}

      {/* Aprendizaje recomendado — solo si requiereRefuerzo, prioridad visual */}
      {aprendizaje?.requiereRefuerzo && (
        <Card className="border-indigo-200 bg-gradient-to-br from-white to-indigo-50/60 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-indigo-700">
                <Lightbulb size={14} /> Aprendizaje recomendado
              </p>
              <h3 className="mt-1 text-base font-semibold text-slate-900" style={FONT_HEADING}>
                {aprendizaje.tema}
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                {Math.round(aprendizaje.porcentaje)}% de dominio
                <span className="mx-1.5 text-slate-300">·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 size={11} /> Próximo refuerzo:{" "}
                  {aprendizaje.proximaRevision ? formatShortDate(aprendizaje.proximaRevision) : "Hoy"}
                </span>
              </p>
            </div>
            <Badge label="Refuerzo" variant="info" />
          </div>
          <button onClick={() => navigate("/client/conocimiento")} className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700">
            Continuar aprendizaje
          </button>
        </Card>
      )}

      {/* TU DÍA — §20 */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#397065]" style={FONT_HEADING}>
            TU DÍA
          </h2>
          <span className="text-xs text-slate-400">{new Date().toLocaleDateString("sv-SE")}</span>
        </div>

        {loadingProgress ? (
          <div className="mt-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-50" />
            ))}
          </div>
        ) : !nutrition || nutrition.estado === "NO_DISPONIBLE" ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-800">Sin objetivo nutricional para hoy</p>
            <p className="mt-1 text-xs leading-5 text-amber-700">{objetivo?.motivo ?? nutrition?.motivo ?? "Completa tu perfil para que el sistema calcule tu meta diaria."}</p>
            {objetivo && (objetivo as any).pendientes?.length > 0 && <p className="mt-1 text-xs text-amber-700">Falta: {(objetivo as any).pendientes.join(", ")}</p>}
            <p className="mt-2 text-xs leading-4 text-slate-500">Ya registraste el objetivo "{user?.objetivoFisico ?? "—"}", pero todavía faltan datos esenciales del perfil para calcular tus metas diarias. Ve a Perfil para completarlos.</p>
            <button onClick={() => navigate("/client/profile")} className="mt-3 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white">
              Completar perfil
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-4">
              {/* Calorías destacada */}
              {energia && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                  <div className="flex items-center justify-between text-xs font-medium text-amber-800/80">
                    <span className="flex items-center gap-1.5"><Flame size={14} /> Calorías</span>
                    <span>{energia.unidad}</span>
                  </div>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {energia.consumido ?? 0} / {energia.objetivo ?? 0} <span className="text-sm font-normal text-slate-500">kcal</span>
                  </p>
                  <div className="mt-2">
                    <ProgressBar value={energia.porcentajeCumplimiento ?? 0} color="bg-amber-500" />
                  </div>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-3">
                {[proteina, carbo, grasa].map((c) => {
                  if (!c) return null;
                  const label = c.componente === "PROTEINA" ? "Proteínas" : c.componente === "CARBOHIDRATOS" ? "Carbohidratos" : "Grasas";
                  const Icon = c.componente === "PROTEINA" ? Utensils : c.componente === "CARBOHIDRATOS" ? Wheat : Droplets;
                  const color = c.componente === "PROTEINA" ? "bg-rose-500" : c.componente === "CARBOHIDRATOS" ? "bg-amber-500" : "bg-teal-500";
                  return (
                    <div key={c.componente} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                      <p className="flex items-center gap-1 text-xs font-semibold text-slate-700"><Icon size={12} /> {label}</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{c.consumido ?? 0} / {c.objetivo ?? 0} <span className="text-xs font-normal text-slate-500">{c.unidad}</span></p>
                      <div className="mt-2"><ProgressBar value={c.porcentajeCumplimiento ?? 0} color={color} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
            <button onClick={() => navigate("/client/habitos")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#173c36] px-4 py-3 text-sm font-semibold text-white hover:bg-[#225148] sm:w-auto">
              <Utensils size={16} /> + Registrar consumo
            </button>
          </>
        )}
      </Card>

      {/* TU PROGRESO — §20-21 compacto con nombres UX */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#397065]" style={FONT_HEADING}>
          TU PROGRESO
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-800">Conocimiento <span title="PCC — Porcentaje de Conocimiento Correcto" className="cursor-help"><Info size={12} className="text-emerald-600/60" /></span></span>
              <BookOpen size={16} className="text-emerald-600" />
            </div>
            <p className="mt-2 text-lg font-bold text-slate-900">{conocimientoLabel}</p>
            <p className="text-xs text-slate-500">{conocimientoSub}</p>
          </div>
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs font-semibold text-indigo-800">Consumo <span title="PCS — Clasificación de consumo" className="cursor-help"><Info size={12} className="text-indigo-600/60" /></span></span>
              <Utensils size={16} className="text-indigo-600" />
            </div>
            <p className="mt-2 text-lg font-bold text-slate-900">{consumoLabel}</p>
            <p className="text-xs text-slate-500">{consumoSub}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs font-semibold text-slate-700">Tiempo de inferencia <span title="Duración informada por el servicio predictivo; no corresponde al indicador TPP." className="cursor-help"><Info size={12} className="text-slate-400" /></span></span>
              <Clock3 size={16} className="text-slate-500" />
            </div>
            <p className="mt-2 text-lg font-bold text-slate-900">{tiempoLabel}</p>
            <p className="text-xs text-slate-500">{tiempoSub}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <Brain size={12} /> Los tres indicadores se muestran de forma compacta — sin dashboard académico.
        </div>
      </Card>

      {/* Siguiente paso — §22 contextual real */}
      <Card className={`p-5 ${siguiente.tone === "amber" ? "border-amber-200 bg-amber-50/40" : siguiente.tone === "indigo" ? "border-indigo-200 bg-indigo-50/40" : siguiente.tone === "purple" ? "border-purple-200 bg-purple-50/40" : siguiente.tone === "teal" ? "border-teal-200 bg-teal-50/40" : "border-slate-200 bg-slate-50/60"}`}>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Siguiente paso</p>
        <h3 className="mt-1 text-base font-semibold text-slate-900" style={FONT_HEADING}>{siguiente.title}</h3>
        <p className="mt-1 text-sm leading-5 text-slate-600">{siguiente.desc}</p>
        <button onClick={() => navigate(siguiente.path)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#173c36] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#225148]">
          {siguiente.cta} <ArrowRight size={14} />
        </button>
      </Card>
    </div>
  );
}
