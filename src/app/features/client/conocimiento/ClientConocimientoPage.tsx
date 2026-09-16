import { useCallback, useEffect, useMemo, useState } from "react";
import { Award, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, GraduationCap, Lightbulb, Target, XCircle } from "lucide-react";
import { Badge, Card, EmptyState, ErrorState, LoadingState, ProgressBar } from "../../../components/shared";
import { useAuth } from "../../../context/AuthContext";
import { conocimientoIaService, type OpcionAdaptativa, type ResultadoAdaptativoResponse, type SesionConocimientoResponse } from "../../../services/conocimiento-ia.service";
import { FONT_HEADING } from "../../../types";
import { toast } from "sonner";
import { ApiError } from "../../../services/api";

type View = "resumen" | "evaluacion" | "retroalimentacion";

const message = (error: unknown) => error instanceof Error ? error.message : "No se pudo completar la operación.";
const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "America/Lima" });
const formatDate = (value?: string | null) => value
  ? new Date(`${value}T00:00:00`).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })
  : "Pendiente";

export default function ClientConocimientoPage() {
  const { user } = useAuth();
  const [view, setView] = useState<View>("resumen");
  const [session, setSession] = useState<SesionConocimientoResponse | null>(null);
  const [result, setResult] = useState<ResultadoAdaptativoResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, OpcionAdaptativa>>({});
  const [selected, setSelected] = useState<OpcionAdaptativa | "">("");
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback((notificar = false) => {
    if (!user?.clienteId) { setLoading(false); return; }
    setLoading(true);
    setError("");
    conocimientoIaService.obtener(user.clienteId, today())
      .catch(cause => { if (cause instanceof ApiError && cause.status === 404) return conocimientoIaService.inicial(user.clienteId!); throw cause; })
      .then(async (data) => {
        if (notificar && !data.clasificacionPredictiva && data.estadoAdaptativo === "IA_NO_DISPONIBLE") data = await conocimientoIaService.inicial(user.clienteId!);
        setSession(data); setResult(data.resultadoAdaptativo);
        if (notificar) toast.success("Evaluación de conocimiento consultada.");
      })
      .catch((cause) => { setSession(null); setResult(null); if (cause instanceof ApiError && cause.status === 404) { if (notificar) toast.info("La evaluación todavía no está generada. Revisa el estado del ciclo diario en Análisis."); } else setError(message(cause)); })
      .finally(() => setLoading(false));
  }, [user?.clienteId]);

  useEffect(() => {
    load();
    const onCiclo = () => load();
    window.addEventListener("nutripredict:ciclo-diario-actualizado", onCiclo);
    return () => window.removeEventListener("nutripredict:ciclo-diario-actualizado", onCiclo);
  }, [load]);

  const question = session?.preguntasAdaptativas[index] ?? null;
  const failures = useMemo(() => result?.respuestas.filter((item) => !item.correcta) ?? [], [result]);

  const next = async () => {
    if (!session || !question || !selected || !user?.clienteId) return;
    const updated = { ...answers, [question.id]: selected };
    setAnswers(updated);
    if (index < session.preguntasAdaptativas.length - 1) {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      setSelected(updated[session.preguntasAdaptativas[nextIndex].id] ?? "");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await conocimientoIaService.responder(user.clienteId, session.sesionId, {
        respuestas: session.preguntasAdaptativas.map((item) => ({ preguntaId: item.id, opcionSeleccionada: updated[item.id] })),
      });
      setResult(response);
      setSession({ ...session, estadoAdaptativo: "RESPONDIDA", resultadoAdaptativo: response });
      setView("resumen");
    } catch (cause) {
      setError(message(cause));
    } finally {
      setSaving(false);
    }
  };

  const begin = () => {
    setAnswers({}); setSelected(""); setIndex(0); setError(""); setView("evaluacion");
  };

  const previous = () => {
    const previousIndex = Math.max(0, index - 1);
    setIndex(previousIndex);
    const previousQuestion = session?.preguntasAdaptativas[previousIndex];
    setSelected(previousQuestion ? answers[previousQuestion.id] ?? "" : "");
  };

  if (loading) return <LoadingState label="Cargando evaluación de conocimiento..." />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-slate-900" style={FONT_HEADING}>Conocimiento</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Comienza con cinco preguntas según tu objetivo y tus metas. Después, cada ciclo diario genera una evaluación adaptada al consumo anterior y a tus resultados.</p>
        <button onClick={() => load(true)} className="mt-3 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">Consultar evaluación guardada</button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: "resumen" as View, label: "Resumen", icon: BookOpen },
          { id: "evaluacion" as View, label: "Evaluación", icon: GraduationCap },
          { id: "retroalimentacion" as View, label: "Retroalimentación", icon: Lightbulb },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setView(tab.id)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${view === tab.id ? "border-[#173c36] bg-[#173c36] text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {error && <ErrorState message={error} />}
      {view === "resumen" && <Summary session={session} result={result} onBegin={begin} onFeedback={() => setView("retroalimentacion")} />}
      {view === "evaluacion" && <Evaluation session={session} result={result} question={question} index={index} selected={selected} setSelected={setSelected} onNext={next} onPrevious={previous} onBegin={begin} onSummary={() => setView("resumen")} saving={saving} />}
      {view === "retroalimentacion" && <Feedback session={session} result={result} failures={failures} onSummary={() => setView("resumen")} />}
    </div>
  );
}

function Summary({ session, result, onBegin, onFeedback }: { session: SesionConocimientoResponse | null; result: ResultadoAdaptativoResponse | null; onBegin: () => void; onFeedback: () => void }) {
  if (!session) return <EmptyState title="Evaluación inicial pendiente" description="Completa el perfil y el objetivo para generar tus primeras cinco preguntas. Las siguientes evaluaciones se generan con el ciclo diario, sin duplicarse al recargar." />;
  if (session.estadoAdaptativo === "IA_NO_DISPONIBLE" || session.estadoAdaptativo === "NO_DISPONIBLE") return <EmptyState title="Evaluación no disponible" description="Gemini no pudo generar la evaluación asociada al análisis predictivo. No se crearon preguntas simuladas." />;
  return <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
    <Card className="p-6">
      <div className="flex items-center gap-2"><Award size={18} className="text-emerald-600" /><h2 className="font-semibold text-slate-900" style={FONT_HEADING}>{session.clasificacionPredictiva ? "Resultado diario" : "Evaluación inicial"}</h2></div>
      {result ? <>
        <div className="mt-5 rounded-2xl bg-emerald-50 p-5 text-center">
          <p className="text-4xl font-bold text-slate-900">{result.puntajeObtenido}/{result.puntajeMaximo}</p>
          <div className="mt-2"><Badge label={result.nivel} variant={result.nivel === "ALTO" ? "success" : result.nivel === "INTERMEDIO" ? "warning" : "danger"} /></div>
          <p className="mt-3 text-sm text-slate-600">{result.correctas} de {result.totalPreguntas} respuestas correctas</p>
          <div className="mx-auto mt-3 max-w-xs"><ProgressBar value={result.porcentajeAdaptativo} color="bg-emerald-500" /></div>
        </div>
        <button onClick={onFeedback} className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">Revisar mis errores</button>
      </> : <div className="mt-5 rounded-2xl border border-dashed bg-slate-50 p-6 text-center"><p className="text-sm font-medium text-slate-700">Tu evaluación está lista.</p><p className="mt-1 text-xs text-slate-500">Solo puede responderse una vez y no cambia al recargar.</p><button onClick={onBegin} className="mt-4 rounded-xl bg-[#173c36] px-5 py-2.5 text-sm font-semibold text-white">Comenzar evaluación</button></div>}
    </Card>
    <Card className="p-5">
      <div className="flex items-center gap-2"><Target size={17} className="text-indigo-600" /><h2 className="font-semibold text-slate-900">Contexto utilizado</h2></div>
      {!session.clasificacionPredictiva && <p className="mt-3 rounded-lg bg-indigo-50 p-3 text-xs leading-5 text-indigo-800">Evaluación inicial basada en el perfil y las metas: todavía no existe una clasificación del consumo anterior. Este resultado se conserva como línea base y no forma parte del PCC diario oficial.</p>}
      <dl className="mt-4 space-y-3 text-sm"><div><dt className="text-xs text-slate-400">Fecha</dt><dd className="font-medium text-slate-700">{formatDate(session.fechaEvaluacion)}</dd></div><div><dt className="text-xs text-slate-400">Objetivo del cliente</dt><dd className="font-medium text-slate-700">{session.objetivoCliente?.replaceAll("_", " ")}</dd></div><div><dt className="text-xs text-slate-400">Clasificación predictiva</dt><dd className="font-medium text-slate-700">{session.clasificacionPredictiva?.replaceAll("_", " ")}</dd></div>{session.metaNutricional?.kcal != null && <div><dt className="text-xs text-slate-400">Metas usadas por la evaluación</dt><dd className="mt-1 font-medium leading-6 text-slate-700">{session.metaNutricional.kcal} kcal · {session.metaNutricional.proteinaG} g proteína · {session.metaNutricional.carbohidratosG} g carbos · {session.metaNutricional.grasasG} g grasas · {session.metaNutricional.aguaMl} ml de líquidos</dd></div>}<div><dt className="text-xs text-slate-400">Puntuación</dt><dd className="font-medium text-slate-700">5 preguntas · 2 puntos cada una</dd></div></dl>
    </Card>
  </div>;
}

function Evaluation({ session, result, question, index, selected, setSelected, onNext, onPrevious, onBegin, onSummary, saving }: any) {
  if (!session) return <EmptyState title="Sin evaluación para hoy" description="La evaluación se genera automáticamente después del análisis predictivo." />;
  if (result) return <Card className="p-6 text-center"><CheckCircle2 className="mx-auto text-emerald-600" /><h2 className="mt-2 font-semibold text-slate-900">Evaluación ya respondida</h2><p className="mt-1 text-sm text-slate-500">Este test diario no puede volver a contestarse.</p><button onClick={onSummary} className="mt-4 rounded-xl bg-[#173c36] px-4 py-2 text-sm font-semibold text-white">Ver resultado</button></Card>;
  if (!question) return <Card className="p-6 text-center"><p className="text-sm text-slate-600">La sesión no contiene preguntas disponibles.</p><button onClick={onBegin} className="mt-3 text-sm underline">Volver a intentar</button></Card>;
  return <Card className="p-5 sm:p-6">
    <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-[#397065]">{session.clasificacionPredictiva ? "Evaluación diaria" : "Evaluación inicial"}</p><span className="text-xs text-slate-500">Pregunta {index + 1} de {session.preguntasAdaptativas.length} · 2 puntos</span></div>
    <div className="mt-3 flex gap-1">{session.preguntasAdaptativas.map((_: unknown, position: number) => <span key={position} className={`h-1.5 flex-1 rounded-full ${position <= index ? "bg-emerald-500" : "bg-slate-100"}`} />)}</div>
    <div className="mt-4 flex gap-2"><Badge label={question.tema} variant="info" /><Badge label={question.dificultad} variant="neutral" /></div>
    <h2 className="mt-4 text-base font-semibold leading-6 text-slate-900">{question.enunciado}</h2>
    <div className="mt-4 grid gap-2">{question.opciones.map((option: any) => <label key={option.codigo} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${selected === option.codigo ? "border-[#173c36] bg-[#173c36] text-white" : "border-slate-200 bg-white"}`}><input className="sr-only" type="radio" checked={selected === option.codigo} onChange={() => setSelected(option.codigo)} /><span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${selected === option.codigo ? "bg-white text-[#173c36]" : "bg-slate-100 text-slate-700"}`}>{option.codigo}</span>{option.texto}</label>)}</div>
    <div className="mt-6 flex justify-between"><button onClick={onPrevious} disabled={index === 0} className="inline-flex items-center gap-1 rounded-xl border px-4 py-2 text-sm disabled:opacity-40"><ChevronLeft size={16} />Anterior</button><button onClick={onNext} disabled={!selected || saving} className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40">{saving ? "Guardando..." : index === session.preguntasAdaptativas.length - 1 ? "Finalizar" : "Siguiente"}<ChevronRight size={16} /></button></div>
    <p className="mt-4 text-center text-xs text-slate-400">Las respuestas correctas se muestran únicamente después de finalizar.</p>
  </Card>;
}

function Feedback({ session, result, failures, onSummary }: { session: SesionConocimientoResponse | null; result: ResultadoAdaptativoResponse | null; failures: ResultadoAdaptativoResponse["respuestas"]; onSummary: () => void }) {
  if (!session || !result) return <EmptyState title="Retroalimentación pendiente" description="Completa primero la evaluación diaria para consultar tus errores y explicaciones." />;
  const byId = new Map(session.preguntasAdaptativas.map((item) => [item.id, item]));
  return <div className="space-y-4">
    <Card className="p-5"><div className="flex items-center gap-2"><Lightbulb size={18} className="text-indigo-600" /><h2 className="font-semibold text-slate-900">Retroalimentación de la evaluación</h2></div><p className="mt-2 text-sm text-slate-500">Aquí se muestran únicamente las preguntas que fallaste y la explicación educativa guardada por el backend.</p></Card>
    {failures.length === 0 ? <Card className="p-8 text-center"><CheckCircle2 size={28} className="mx-auto text-emerald-600" /><h3 className="mt-2 font-semibold text-slate-900">No tuviste errores</h3><p className="mt-1 text-sm text-slate-500">Respondiste correctamente las cinco preguntas.</p></Card> : failures.map((failure, position) => { const failedQuestion = byId.get(failure.preguntaId); return <Card key={failure.preguntaId} className="border-amber-200 p-5"><div className="flex items-start gap-3"><XCircle size={19} className="mt-0.5 shrink-0 text-amber-600" /><div><p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Error {position + 1} · {failedQuestion?.tema}</p><h3 className="mt-1 text-sm font-semibold text-slate-900">{failedQuestion?.enunciado}</h3><p className="mt-3 text-sm text-slate-600">Tu respuesta: <strong>{failure.opcionSeleccionada}</strong> · Respuesta correcta: <strong>{failure.respuestaCorrecta}</strong></p><div className="mt-3 rounded-xl bg-indigo-50 p-3"><p className="text-xs font-semibold text-indigo-800">¿Por qué?</p><p className="mt-1 text-sm leading-6 text-indigo-900">{failure.explicacion}</p></div></div></div></Card>; })}
    <button onClick={onSummary} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm">Volver al resumen</button>
  </div>;
}
