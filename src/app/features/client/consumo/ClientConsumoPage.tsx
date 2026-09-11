import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardCheck, Gauge } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, ErrorState, SectionHeader, StatusBadge } from "../../../components/shared";
import { useAuth } from "../../../context/AuthContext";
import {
  consumoEvaluacionService,
  type DetalleEvaluacionConsumoResponse,
  type EvaluacionConsumoResponse,
} from "../../../services/consumo-evaluacion.service";
import { suplementosService, type ResumenSuplementacionDiario } from "../../../services/suplementos.service";

const today = () => new Date().toLocaleDateString("sv-SE");

const componentName = (value: string | null) =>
  value
    ? value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase())
    : "Componente";

const amount = (value: number | null, unit: string | null) =>
  value == null
    ? "Sin dato"
    : `${new Intl.NumberFormat("es-PE", { maximumFractionDigits: 2 }).format(value)} ${unit ?? ""}`.trim();

const referenceText = (detail: DetalleEvaluacionConsumoResponse) => {
  const reference = amount(detail.referenciaAplicada, detail.unidad);
  if (detail.operador === "MAYOR_QUE") return `Límite: hasta ${reference}`;
  if (detail.operador === "MAYOR_O_IGUAL") return `Referencia de exceso: ${reference}`;
  if (detail.operador === "ENTRE") {
    return `Referencia: ${reference} a ${amount(detail.referenciaAplicadaHasta, detail.unidad)}`;
  }
  return `Referencia: ${reference}`;
};

const nonCalculableText = (reason: string | null) => {
  if (reason === "APORTE_SUPLEMENTOS_NO_CALCULABLE") {
    return "La composición del suplemento consumido no tiene este componente cuantificado. Edita el suplemento y registra 0 únicamente si su etiqueta confirma que no lo contiene.";
  }
  if (reason === "APORTE_TOTAL_INCOMPLETO") {
    return "Faltan datos de composición en una o más fuentes consumidas durante el día.";
  }
  if (reason === "UNIDAD_INCOMPATIBLE") {
    return "La unidad registrada no puede compararse con el límite configurado.";
  }
  return "No hay información suficiente para calcular este componente.";
};

const evaluationReason = (reason: string | null) => {
  if (reason === "CRITERIO_NO_CONFIGURADO") {
    return "Aún no existe una regla de seguridad activa y validada. Un profesional debe configurar los límites antes de clasificar el consumo.";
  }
  if (reason === "CRITERIOS_NO_CALCULABLES") {
    return "No se puede evaluar el consumo porque falta completar la composición de los suplementos registrados hoy.";
  }
  return reason;
};

export default function ClientConsumoPage() {
  const { user } = useAuth();
  const [fecha, setFecha] = useState(today);
  const [data, setData] = useState<EvaluacionConsumoResponse | null>(null);
  const [details, setDetails] = useState<DetalleEvaluacionConsumoResponse[]>([]);
  const [dailyContributions, setDailyContributions] = useState<ResumenSuplementacionDiario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summaryError, setSummaryError] = useState("");

  const run = useCallback(async () => {
    if (!user?.clienteId) return;
    setLoading(true);
    setError("");
    setSummaryError("");
    try {
      const [evaluationResult, summaryResult] = await Promise.allSettled([
        consumoEvaluacionService.evaluarDiario(user.clienteId, fecha).then(async (evaluation) => ({
          evaluation,
          details: await consumoEvaluacionService.detalles(evaluation.id),
        })),
        suplementosService.dailySummary(user.clienteId, fecha),
      ]);
      if (evaluationResult.status === "fulfilled") {
        setData(evaluationResult.value.evaluation);
        setDetails(evaluationResult.value.details);
      } else {
        setError(evaluationResult.reason instanceof Error ? evaluationResult.reason.message : "No se pudo obtener la evaluación de consumo.");
        setData(null);
        setDetails([]);
      }
      if (summaryResult.status === "fulfilled") {
        setDailyContributions(summaryResult.value.resumenDiario.find((day) => day.fecha === fecha) ?? null);
      } else {
        setSummaryError("No se pudieron cargar los aportes de suplementos. Reinicia el backend para habilitar el nuevo endpoint de resumen.");
        setDailyContributions(null);
      }
    } catch {
      setData(null);
      setDetails([]);
      setDailyContributions(null);
    } finally {
      setLoading(false);
    }
  }, [fecha, user?.clienteId]);

  useEffect(() => {
    void run();
  }, [run]);

  const unavailable = data?.estadoClasificacion === "NO_DETERMINADA";
  const high = data?.estadoClasificacion === "ALTO";

  return (
    <div>
      <SectionHeader
        title="Control de seguridad de suplementos"
        subtitle="Detecta si las tomas registradas hoy superan límites validados de sus componentes. No clasifica por cantidad de productos."
        action={
          <button onClick={() => void run()} disabled={loading} className="rounded-xl bg-[#173c36] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {loading ? "Evaluando..." : "Actualizar evaluación"}
          </button>
        }
      />

      <Card className="mb-5 p-5">
        <label className="block max-w-xs text-sm font-medium text-slate-700">
          Día evaluado
          <input type="date" value={fecha} max={today()} onChange={(event) => setFecha(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5" />
        </label>
        <p className="mt-3 text-xs text-slate-500">Cálculo: cantidad y número de tomas del registro diario × composición por porción guardada en Mis suplementos.</p>
       
      </Card>

      <Card className="mb-5 p-5">
        <h2 className="text-sm font-semibold text-slate-900">Aportes de suplementos registrados</h2>
        <p className="mt-1 text-xs text-slate-500">Estos son todos los componentes estructurados acumulados en el día. Que un componente aparezca aquí no significa que tenga un límite de riesgo configurado.</p>
        {summaryError ? (
          <p className="mt-4 rounded-xl bg-amber-50 px-3 py-3 text-sm text-amber-800">{summaryError}</p>
        ) : !dailyContributions || dailyContributions.registrosConsumoTotal === 0 ? (
          <p className="mt-4 rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-600">No hay suplementos consumidos registrados para esta fecha.</p>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                ["Proteína", dailyContributions.proteinaSuplementariaG, "g"],
                ["Carbohidratos", dailyContributions.carbohidratosSuplementariosG, "g"],
                ["Grasas", dailyContributions.grasasSuplementariasG, "g"],
                ["Creatina", dailyContributions.creatinaG, "g"],
                ["Cafeína", dailyContributions.cafeinaMg, "mg"],
                ["Sodio", dailyContributions.sodioMg, "mg"],
              ].map(([label, value, unit]) => (
                <div key={String(label)} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{amount(value as number | null, String(unit))}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {dailyContributions.registrosCalculables} de {dailyContributions.registrosConsumoTotal} registro(s) tienen composición calculable.
            </p>
            {dailyContributions.registrosNoCalculables > 0 && (
              <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">Hay {dailyContributions.registrosNoCalculables} consumo(s) que no pueden sumarse porque falta su porción de referencia, composición o una unidad compatible.</p>
            )}
          </>
        )}
      </Card>

      {error && <ErrorState message={error} />}

      {data && (
        <>
          <Card className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className={`mt-0.5 rounded-xl p-2.5 ${high ? "bg-rose-50 text-rose-600" : unavailable ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                  {high ? <AlertTriangle size={21} /> : unavailable ? <Gauge size={21} /> : <CheckCircle2 size={21} />}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#397065]">Resultado de seguridad del día</p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                    {unavailable ? "No se puede determinar" : high ? "Consumo alto" : "Dentro de los límites"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">{data.fechaCorte} · ventana de {data.ventanaDias} día</p>
                </div>
              </div>
              <StatusBadge label={unavailable ? "NO DETERMINADO" : high ? "ALTO" : "NO ALTO"} variant={unavailable ? "warning" : high ? "danger" : "success"} />
            </div>
            {data.motivo && <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">{evaluationReason(data.motivo)}</p>}
            {details.some((detail) => detail.resultado === "NO_CALCULABLE") && (
              <Link to="/client/suplementos" className="mt-3 inline-flex text-sm font-semibold text-[#397065] underline underline-offset-2">
                Completar composición en Mis suplementos
              </Link>
            )}
            {data.advertencias && <p className="mt-3 text-xs text-slate-500">{data.advertencias}</p>}
          </Card>

          {details.length > 0 && (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {details.map((detail, index) => {
                const exceeded = detail.resultado === "CUMPLE";
                const calculable = detail.resultado !== "NO_CALCULABLE";
                const progress = detail.cantidadObservada != null && detail.referenciaAplicada != null && detail.referenciaAplicada > 0
                  ? Math.min((detail.cantidadObservada / detail.referenciaAplicada) * 100, 100)
                  : 0;
                return (
                  <Card key={`${detail.criterioEvaluadoId ?? "detail"}-${index}`} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{componentName(detail.componente)}</p>
                        <p className="mt-1 text-xs text-slate-500">{detail.fuente === "TOTAL_DIETA" ? "Alimentos + suplementos" : "Solo suplementación"}</p>
                      </div>
                      <StatusBadge label={!calculable ? "SIN DATOS" : exceeded ? "EXCEDE" : "DENTRO"} variant={!calculable ? "warning" : exceeded ? "danger" : "success"} />
                    </div>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500">Consumido</p>
                        <p className="text-lg font-semibold text-slate-900">{amount(detail.cantidadObservada, detail.unidad)}</p>
                      </div>
                      <p className="text-right text-xs text-slate-500">{referenceText(detail)}</p>
                    </div>
                    {calculable && detail.referenciaAplicada != null && (
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${exceeded ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${progress}%` }} />
                      </div>
                    )}
                    {!calculable && <p className="mt-3 text-xs leading-5 text-amber-700">{nonCalculableText(detail.motivoNoCalculable)}</p>}
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {!data && !error && !loading && (
        <Card className="border-dashed p-8 text-center">
          <ClipboardCheck className="mx-auto mb-3 text-[#78a59a]" />
          <p className="text-sm text-slate-600">Registra el consumo y consulta la evaluación del día.</p>
        </Card>
      )}
    </div>
  );
}
