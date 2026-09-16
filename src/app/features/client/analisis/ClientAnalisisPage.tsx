import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Database, RefreshCw, Info } from "lucide-react";
import { Badge, Card, ProgressBar, SectionHeader } from "../../../components/shared";
import { useAuth } from "../../../context/AuthContext";
import { ApiError } from "../../../services/api";
import {
  analisisPredictivoService,
  type AnalisisPredictivoResponse,
  type CicloDiarioResponse,
  type ClasificacionPredictiva,
  type PrediccionModeloHistorialResponse,
  type PreparacionAnalisisResponse,
} from "../../../services/analisis-predictivo.service";
import { conocimientoIaService, type SesionConocimientoResponse } from "../../../services/conocimiento-ia.service";
import { FONT_HEADING, FONT_MONO } from "../../../types";
import { toast } from "../../../services/notifications";
import { OperationNotice } from "../../../components/shared/OperationNotice";

const today = () => new Date().toLocaleDateString("sv-SE");
const labels: Record<ClasificacionPredictiva, string> = {
  ADECUADO: "Adecuado",
  MEJORABLE: "Mejorable",
  CRITICO: "Crítico",
};
const colors: Record<ClasificacionPredictiva, string> = {
  ADECUADO: "bg-emerald-500",
  MEJORABLE: "bg-amber-500",
  CRITICO: "bg-rose-500",
};

function messageFor(error: unknown) {
  if (!(error instanceof ApiError)) return "No se pudo completar el análisis. Inténtalo nuevamente.";
  if (error.status === 400) return `Datos insuficientes para el modelo V6. ${error.message}`;
  if (error.status === 401) return "Tu sesión no es válida. Inicia sesión nuevamente.";
  if (error.status === 403) return "No tienes permiso para analizar este perfil.";
  if (error.status === 404) return "No se encontró el cliente o el procedimiento de IA activo.";
  if (error.status === 502) return "El modelo predictivo no está disponible en este momento. No se generó ningún resultado.";
  if (error.status === 500) return "El servidor no pudo completar el análisis. Inténtalo más tarde.";
  return error.message;
}

export default function ClientAnalisisPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fechaCorte] = useState(today);
  const [result, setResult] = useState<AnalisisPredictivoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const [iaSession, setIaSession] = useState<SesionConocimientoResponse | null>(null);
  const [prep, setPrep] = useState<PreparacionAnalisisResponse | null>(null);
  const [prepLoading, setPrepLoading] = useState(false);
  const [prepError, setPrepError] = useState("");
  const [latestPrediction, setLatestPrediction] = useState<PrediccionModeloHistorialResponse | null>(null);
  const [ciclo, setCiclo] = useState<CicloDiarioResponse | null>(null);

  useEffect(() => {
    if (!user?.clienteId) return;
    const loadState = () => {
      void analisisPredictivoService.estadoCicloDiario(user.clienteId!)
        .then(value => {
          setCiclo(value);
          setResult(value.analisis);
          if (value.estado === "FALLIDO") setError(value.mensaje);
        })
        .catch(() => setCiclo(null));
    };
    void analisisPredictivoService.listByCliente(user.clienteId)
      .then(items => setLatestPrediction(items[0] ?? null))
      .catch(() => setLatestPrediction(null));
    loadState();
    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<CicloDiarioResponse>).detail;
      if (detail) {
        setCiclo(detail);
        setResult(detail.analisis);
        setError(detail.estado === "FALLIDO" ? detail.mensaje : "");
      } else loadState();
    };
    window.addEventListener("nutripredict:ciclo-diario-actualizado", onUpdated);
    return () => window.removeEventListener("nutripredict:ciclo-diario-actualizado", onUpdated);
  }, [user?.clienteId]);

  const loadPreparacion = useCallback(async (notificar = false) => {
    if (!user?.clienteId || !fechaCorte) return;
    setPrepLoading(true);
    setPrepError("");
    try {
      const p = await analisisPredictivoService.preparacion(user.clienteId, fechaCorte);
      setPrep(p);
      if (notificar) toast.success(p.puedeAnalizar ? "Datos listos para el ciclo diario." : "Consulta actualizada: el ciclo sigue pendiente de datos.");
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 400 && cause.details) {
        // backend returns datosFaltantes in details, try to extract
        const d = cause.details as { fieldErrors?: { field: string; message: string }[]; datosFaltantes?: string[] };
        const faltantes = d?.fieldErrors?.map(e => e.message) ?? [];
        setPrep({
          clienteId: user.clienteId!,
          fechaCorte,
          puedeAnalizar: false,
          diasCompletos: 0,
          diasRequeridos: 0,
          dominios: {},
          perfilHistoricoDisponible: false,
          xDisponibles: 0,
          xTotal: 5,
          datosFaltantes: faltantes.length ? faltantes : [cause.message],
        });
        setPrepError("");
      } else {
        setPrepError(cause instanceof Error ? cause.message : "No se pudo consultar preparación");
      }
    } finally {
      setPrepLoading(false);
    }
  }, [user?.clienteId, fechaCorte]);

  useEffect(() => { void loadPreparacion(); }, [loadPreparacion]);

  const run = async () => {
    if (!user?.clienteId) {
      setError("No se encontró el perfil de cliente asociado a tu cuenta.");
      return;
    }
    setLoading(true);
    setError("");
    setUnavailable(false);
    if (!ciclo?.prediccionId) {
      try {
        const p = await analisisPredictivoService.preparacion(user.clienteId, fechaCorte);
        setPrep(p);
        if (!p.puedeAnalizar) {
          setError(`No se puede ejecutar: ${p.datosFaltantes.join("; ") || "faltan datos esenciales del perfil"}`);
          setLoading(false);
          return;
        }
      } catch (cause) {
        if (cause instanceof ApiError && cause.status === 400) {
          setError(messageFor(cause));
          setLoading(false);
          return;
        }
      }
    }
    try {
      const responseCiclo = await analisisPredictivoService.asegurarCicloDiario(user.clienteId);
      setCiclo(responseCiclo);
      setResult(responseCiclo.analisis);
      if (responseCiclo.estado !== "COMPLETADO" || !responseCiclo.analisis) {
        setError(responseCiclo.mensaje + (responseCiclo.datosFaltantes.length ? ` ${responseCiclo.datosFaltantes.join("; ")}` : ""));
        return;
      }
      const response = responseCiclo.analisis;
      setResult(response);
      void analisisPredictivoService.listByCliente(user.clienteId)
        .then(items => setLatestPrediction(items[0] ?? null));
      if (response.estadoPccIa === "GENERADA") {
        try { setIaSession(await conocimientoIaService.obtener(user.clienteId)); } catch { setIaSession(null); }
      } else setIaSession(null);
    } catch (cause) {
      setResult(null);
      setUnavailable(cause instanceof ApiError && cause.status === 502);
      setError(messageFor(cause));
    } finally {
      setLoading(false);
    }
  };

  const prepDisabled = !ciclo?.prediccionId && prep ? !prep.puedeAnalizar : false;
  const cicloHoyDisponible = ciclo?.estado === "COMPLETADO";
  return <div>
    <SectionHeader title="Mi análisis predictivo" subtitle="Evaluación automática diaria basada en el consumo real del día anterior" action={!cicloHoyDisponible ? <button onClick={() => void run()} disabled={loading || !user?.clienteId || prepDisabled} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><RefreshCw size={14} className={loading ? "animate-spin" : ""}/>{loading ? "Procesando..." : ciclo?.estado === "FALLIDO" ? "Reintentar módulos pendientes" : "Iniciar ciclo de hoy"}</button> : undefined} />
    <Card className="mb-5 p-5"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-slate-800">Ciclo diario · {new Date(`${fechaCorte}T00:00:00`).toLocaleDateString("es-PE", { dateStyle: "long" })}</p>{ciclo && <Badge label={ciclo.estado} variant={ciclo.estado === "COMPLETADO" ? "success" : ciclo.estado === "FALLIDO" ? "danger" : "warning"} />}</div><p className="mt-1 text-xs leading-5 text-slate-500">La consulta de esta página no ejecuta otra predicción. Un reintento conserva la predicción V6 y procesa únicamente los módulos pendientes.</p></Card>
    <Card className="mb-5 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800" style={FONT_HEADING}>Preparación V6</h3>
        <button onClick={() => void loadPreparacion(true)} disabled={prepLoading} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:opacity-50"><RefreshCw size={12} className={prepLoading ? "animate-spin" : ""} /> Actualizar</button>
      </div>
      {prepLoading && <p className="mt-3 text-xs text-slate-500">Consultando preparación...</p>}
      {prepError && <p className="mt-3 text-xs text-rose-600">{prepError}</p>}
      {prep && !prepLoading && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className={`rounded-full px-2.5 py-1 font-semibold ${prep.puedeAnalizar ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{prep.puedeAnalizar ? "puedeAnalizar: sí" : "puedeAnalizar: no"}</span>
            <span className="rounded-full bg-slate-50 px-2.5 py-1 font-medium text-slate-600">{prep.xDisponibles === prep.xTotal ? "Datos disponibles" : prep.xDisponibles === 8 ? "Perfil listo · falta consumo del día anterior" : "Hay datos por completar"}</span>
            <span className={`rounded-full px-2.5 py-1 font-medium ${prep.perfilHistoricoDisponible ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>perfil histórico: {prep.perfilHistoricoDisponible ? "sí" : "no"}</span>
          </div>
          {Object.keys(prep.dominios).length > 0 && <div className="grid gap-2 sm:grid-cols-3 text-xs">
            {Object.entries(prep.dominios).map(([k, v]) => (
              <div key={k} className="rounded-lg bg-slate-50 px-3 py-2"><p className="font-semibold text-slate-600">{k}</p><p className={`mt-1 font-medium ${v.estado === "COMPLETO" ? "text-emerald-700" : "text-amber-700"}`}>{v.estado} {v.diasCompletos}/{v.diasRequeridos}</p></div>
            ))}
          </div>}
          {!prep.puedeAnalizar && prep.datosFaltantes.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">{prep.xDisponibles === 8 ? "Tu perfil está listo. Necesitamos evaluar un día registrado." : "Completa la información para evaluar tu consumo."}</p>
              <p className="mt-2 text-xs leading-5 text-amber-800">Registra al menos un alimento con proteínas, carbohidratos y grasas, y declara el agua consumida. Los registros de hoy se evaluarán mañana; el test de cinco preguntas y la orientación se generan al completar ese ciclo.</p>
              <button onClick={() => navigate("/client/habitos")} className="mt-3 rounded-lg bg-amber-900 px-3 py-2 text-xs font-semibold text-white">Ir a Registro diario</button>
              <details className="mt-3 text-xs text-amber-700"><summary className="cursor-pointer">Ver detalle técnico ({prep.xDisponibles}/{prep.xTotal})</summary><ul className="mt-2 list-disc pl-4">{prep.datosFaltantes.map((d, i) => <li key={i}>{d}</li>)}</ul></details>
            </div>
          )}
          {prepDisabled && <p className="text-xs text-amber-700">Para evaluar tu consumo necesitas el perfil completo y al menos un alimento con macronutrientes y el agua declarada en el día anterior. Tu meta inicial se genera por separado.</p>}
        </div>
      )}
    </Card>
    {loading && <Card className="p-10 text-center"><RefreshCw size={28} className="mx-auto mb-3 animate-spin text-indigo-500" /><h2 className="text-sm font-semibold text-slate-700">Procesando análisis</h2><p className="mt-1 text-xs text-slate-500">Evaluando el registro real del día anterior...</p></Card>}
    {!loading && error && <><OperationNotice message={error}/><Card className="p-6"><p className="text-sm text-muted-foreground">{unavailable ? "Modelo no disponible" : "Análisis no disponible"}. Consulta el detalle en Notificaciones y vuelve a intentarlo.</p></Card></>}
    {!loading && !error && !result && latestPrediction && <Card className="p-6"><div className="flex items-start gap-3"><Database size={22} className="mt-0.5 text-indigo-500" /><div><h2 className="text-sm font-semibold text-slate-800">Última predicción guardada</h2><p className="mt-1 text-xs text-slate-500">El modelo tardó <strong className="text-slate-800">{Number(latestPrediction.inferenceMs ?? 0).toLocaleString("es-PE", { maximumFractionDigits: 2 })} ms</strong> en generar la predicción del {new Date(`${latestPrediction.fechaCorte}T00:00:00`).toLocaleDateString("es-PE")}.</p><p className="mt-2 text-[11px] text-slate-400">{latestPrediction.modelVersion} · {latestPrediction.schemaVersion}</p></div></div></Card>}
    {!loading && !error && !result && !latestPrediction && <Card className="border-dashed p-10 text-center"><Database size={28} className="mx-auto mb-3 text-slate-300" /><h2 className="text-sm font-semibold text-slate-700">Sin evaluación diaria disponible</h2><p className="mx-auto mt-1 max-w-xl text-xs text-slate-500">Registra durante un día tus alimentos y agua. Al día siguiente podrás obtener una clasificación basada en ese consumo real.</p></Card>}
    {!loading && result && <div className="space-y-4">
      <Card className="p-5"><h3 className="mb-4 text-sm font-semibold text-slate-800" style={FONT_HEADING}>Resumen del ciclo posterior al análisis</h3><div className="grid gap-3 md:grid-cols-3"><CycleSummary title="Predicción" value={labels[result.clasificacion]} detail={result.origenResultado} tone="emerald" /><CycleSummary title="Actividad de conocimiento" value={pccIaLabel(result.estadoPccIa)} detail={iaSession ? "Sesión automática lista" : pccIaDetail(result.estadoPccIa)} tone="indigo" action={result.estadoPccIa === "GENERADA" ? () => navigate("/client/conocimiento") : undefined} /><CycleSummary title="Evaluación de consumo" value={pcsLabel(result.estadoPcs)} detail={result.estadoPcs === "NO_DETERMINADA" ? "Evaluación no disponible o no determinada" : "Resultado oficial"} tone="amber" /></div></Card>
      <Card className={`border-l-4 p-6 ${result.clasificacion === "ADECUADO" ? "border-l-emerald-400" : result.clasificacion === "MEJORABLE" ? "border-l-amber-400" : "border-l-rose-400"}`}><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><div className="mb-2 flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500" /><span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Clasificación técnica</span><span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 flex items-center gap-1"><Info size={10} /> Modelo técnico de integración</span></div><h2 className="text-3xl font-bold text-slate-800" style={FONT_HEADING}>{labels[result.clasificacion]}</h2><p className="mt-1 text-xs text-slate-500">Corte {new Date(`${result.fechaCorte}T00:00:00`).toLocaleDateString("es-PE")} · momento {result.momento}</p></div><Badge label={result.origenResultado} variant={result.origenResultado === "GENERADO" ? "success" : "info"} /></div></Card>
      <Card className="p-5"><h3 className="text-sm font-semibold text-slate-800" style={FONT_HEADING}>Metas nutricionales de la predicción</h3><p className="mt-1 text-xs text-slate-500">Estos valores regresaron en la misma respuesta V6 y quedaron guardados en Spring Boot.</p><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">{[["Energía", result.kcal, "kcal"], ["Proteína", result.proteinaG, "g"], ["Carbohidratos", result.carbohidratosG, "g"], ["Grasas", result.grasasG, "g"], ["Líquidos", result.aguaMl, "ml"]].map(([label, value, unit]) => <div key={String(label)} className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-slate-800">{Number(value).toLocaleString("es-PE", { maximumFractionDigits: 1 })} <span className="text-xs font-medium text-slate-500">{unit}</span></p></div>)}</div><p className="mt-3 text-[11px] text-slate-400">{result.formulaNutricionalVersion}</p></Card>
      <Card className="p-5"><h3 className="mb-4 text-sm font-semibold text-slate-800" style={FONT_HEADING}>Probabilidades del modelo</h3><div className="space-y-4">{(["ADECUADO", "MEJORABLE", "CRITICO"] as ClasificacionPredictiva[]).map(key => { const value = result.probabilidades[key] * 100; return <div key={key}><div className="mb-1.5 flex justify-between text-xs"><span className="font-medium text-slate-600">{labels[key]}</span><span className="font-bold text-slate-800" style={FONT_MONO}>{value.toLocaleString("es-PE", { maximumFractionDigits: 2 })}%</span></div><ProgressBar value={value} color={colors[key]} /></div>; })}</div></Card>
      <Card className="p-5"><h3 className="mb-3 text-sm font-semibold text-slate-800" style={FONT_HEADING}>Trazabilidad</h3><dl className="grid gap-3 text-xs sm:grid-cols-5"><div><dt className="text-slate-400">Versión del modelo</dt><dd className="mt-1 font-semibold text-slate-700">{result.modelVersion}</dd></div><div><dt className="text-slate-400">Versión del esquema</dt><dd className="mt-1 font-semibold text-slate-700">{result.schemaVersion}</dd></div><div><dt className="text-slate-400">Inferencia técnica</dt><dd className="mt-1 font-semibold text-slate-700">{Number(result.inferenceMs).toLocaleString("es-PE", { maximumFractionDigits: 2 })} ms</dd></div><div><dt className="text-slate-400">Tiempo activo del ciclo diario completo</dt><dd className="mt-1 font-semibold text-slate-700">{result.procesamientoCicloMs == null ? "No disponible" : `${Number(result.procesamientoCicloMs).toLocaleString("es-PE")} ms`}</dd></div><div><dt className="text-slate-400">Generado el</dt><dd className="mt-1 font-semibold text-slate-700">{new Date(result.inferredAt).toLocaleString("es-PE")}</dd></div></dl><p className="mt-3 text-xs text-slate-400">El TPP administrativo usa el tiempo activo del ciclo completo; no usa únicamente inferenceMs.</p></Card>
    </div>}
  </div>;
}

function pccIaLabel(state: AnalisisPredictivoResponse["estadoPccIa"]) { return state === "IA_NO_DISPONIBLE" || state === "NO_DISPONIBLE" ? "No disponible" : state.charAt(0) + state.slice(1).toLowerCase(); }
function pccIaDetail(state: AnalisisPredictivoResponse["estadoPccIa"]) { return state === "PENDIENTE" ? "Actividad pendiente" : state === "RESPONDIDA" ? "Actividad respondida" : "No hay actividad disponible"; }
function pcsLabel(state: AnalisisPredictivoResponse["estadoPcs"]) { return state === "NO_ALTO" ? "No alto" : state === "NO_DETERMINADA" ? "No determinada" : "Alto"; }
function CycleSummary({ title, value, detail, tone, action }: { title: string; value: string; detail: string; tone: "emerald" | "indigo" | "amber"; action?: () => void }) { const colors = { emerald: "border-emerald-200 bg-emerald-50", indigo: "border-indigo-200 bg-indigo-50", amber: "border-amber-200 bg-amber-50" }; return <div className={`rounded-xl border p-3 ${colors[tone]}`}><p className="text-xs font-medium text-slate-500">{title}</p><p className="mt-1 text-sm font-bold text-slate-800">{value}</p><p className="mt-1 text-xs text-slate-600">{detail}</p>{action && <button onClick={action} className="mt-2 text-xs font-semibold text-indigo-700 underline">Ver actividad</button>}</div>; }
