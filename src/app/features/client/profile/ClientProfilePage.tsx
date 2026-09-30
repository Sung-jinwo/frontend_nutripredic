import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "../../../services/notifications";
import { Check, Scale, ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";
import { AppModal, Badge, SectionHeader, Card, OperationNotice } from "../../../components/shared";
import { ObjetivoNutricionalCard } from "../../../components/shared/ObjetivoNutricionalCard";
import { FONT_HEADING, FONT_MONO } from "../../../types";
import { useAuth } from "../../../context/AuthContext";
import { tipoObjetivoDesdeUx, type TipoEntrenamiento } from "../../../services/client.service";
import { ApiError } from "../../../services/api";
import { pesoSemanalService, type EstadoPesoSemanal, type RegistroPeso } from "../../../services/peso-semanal.service";
import { saludService, type PerfilSaludResponse } from "../../../services/salud.service";
import { PesoCalendar } from "./PesoCalendar";
import { validarPesoSemanal } from "./peso-validation";

const H = FONT_HEADING;
const MONO = FONT_MONO;

const PATRON_LABELS: Record<PerfilSaludResponse["patronAlimentario"], string> = {
  OMNIVORO: "Omnívoro",
  VEGETARIANO: "Vegetariano",
  VEGANO: "Vegano",
  OTRO: "Otro",
};

const ESTADO_REPRODUCTIVO_LABELS: Record<PerfilSaludResponse["estadoReproductivo"], string> = {
  NO_APLICA: "No aplica",
  NINGUNO: "Ninguno",
  EMBARAZO: "Embarazo",
  LACTANCIA: "Lactancia",
};

// UX sin tecnicismos — el técnico lo deriva el backend
const OBJETIVOS_UX = [
  { label: "Reducir grasa corporal", value: "Reducir grasa corporal" },
  { label: "Mantener mi peso/composición", value: "Mantener mi peso/composición" },
  { label: "Aumentar masa muscular", value: "Aumentar masa muscular" },
  { label: "Mejorar mis hábitos", value: "Mejorar mis hábitos" },
] as const;

const TIPOS_ENTRENAMIENTO: Array<{ value: TipoEntrenamiento; label: string }> = [
  { value: "FUERZA", label: "Fuerza" },
  { value: "CARDIO", label: "Cardio" },
  { value: "MIXTO", label: "Mixto" },
  { value: "OTRO", label: "Otro" },
];

function normalizeObjetivo(v: string | null | undefined) {
  if (!v) return "";
  if (OBJETIVOS_UX.some(o => o.value === v)) return v;
  // legacy mapping inverso
  if (v === "Pérdida de peso") return "Reducir grasa corporal";
  if (v === "Mantenimiento") return "Mantener mi peso/composición";
  if (v === "Salud general" || v === "Mejora del rendimiento") return "Mejorar mis hábitos";
  if (v === "Aumento de masa muscular") return "Aumentar masa muscular";
  return v;
}

type ProfileForm = {
  edad: string;
  pesoKg: string;
  alturaCm: string;
  objetivoFisico: string;
  sexo: "MASCULINO" | "FEMENINO" | "";
  realizaActividadFisica: boolean;
  diasEntrenamientoSemana: string;
  tipoActividadFisica: string;
  tipoEntrenamiento: TipoEntrenamiento | "";
  duracionPromedioSesionMinutos: string;
};

export default function ClientProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, refreshProfile, profileComplete } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pesoEstado, setPesoEstado] = useState<EstadoPesoSemanal | null>(null);
  const [nuevoPeso, setNuevoPeso] = useState("");
  const [guardandoPeso, setGuardandoPeso] = useState(false);
  const [confirmarPeso, setConfirmarPeso] = useState(false);
  const [mensajePeso, setMensajePeso] = useState("");
  const [errorPeso, setErrorPeso] = useState("");
  const pesoEnCurso = useRef(false);
  const [pesoHistorial, setPesoHistorial] = useState<RegistroPeso[]>([]);
  const [cargandoPesos, setCargandoPesos] = useState(true);
  const [cargaPesoFallida, setCargaPesoFallida] = useState(false);
  const [historialPesoDisponible, setHistorialPesoDisponible] = useState(false);
  const [detalleCargaPeso, setDetalleCargaPeso] = useState("");
  const [perfilSalud, setPerfilSalud] = useState<PerfilSaludResponse | null>(null);
  const [cargandoSalud, setCargandoSalud] = useState(true);
  const [errorSalud, setErrorSalud] = useState("");
  const cargaPesoEnCurso = useRef(false);
  const pesoInvalido = nuevoPeso ? validarPesoSemanal(nuevoPeso) : "";
  const cargarPesos = async (clienteId: number) => {
    if (cargaPesoEnCurso.current) return;
    cargaPesoEnCurso.current = true;
    setCargandoPesos(true); setCargaPesoFallida(false);
    setDetalleCargaPeso("");
    try {
      const [estado, historial] = await Promise.allSettled([pesoSemanalService.estado(clienteId, false), pesoSemanalService.historial(clienteId, false)]);
      if (estado.status === "fulfilled") setPesoEstado(estado.value);
      else setPesoEstado(null);
      if (historial.status === "fulfilled") {
        setPesoHistorial(historial.value); setHistorialPesoDisponible(true);
      } else setHistorialPesoDisponible(false);
      const fallos = [estado, historial].filter((result): result is PromiseRejectedResult => result.status === "rejected");
      if (fallos.length) {
        setCargaPesoFallida(true);
        const causa = fallos[0].reason;
        const detalle = causa instanceof ApiError && causa.status === 404
          ? "El backend no tiene disponible el seguimiento de peso. Verifica que esté desplegada su versión actualizada."
          : causa instanceof Error ? causa.message : "No se pudo consultar el seguimiento de peso.";
        setDetalleCargaPeso(detalle);
        toast.error(detalle, { id: "peso-semanal-carga" });
      }
    } finally { cargaPesoEnCurso.current = false; setCargandoPesos(false); }
  };
  const [form, setForm] = useState<ProfileForm>({
    edad: "",
    pesoKg: "",
    alturaCm: "",
    objetivoFisico: "",
    sexo: "",
    realizaActividadFisica: false,
    diasEntrenamientoSemana: "",
    tipoActividadFisica: "",
    tipoEntrenamiento: "",
    duracionPromedioSesionMinutos: "",
  });

  useEffect(() => {
    setForm({
      edad: user?.edad == null ? "" : String(user.edad),
      pesoKg: user?.pesoKg == null ? "" : String(user.pesoKg),
      alturaCm: user?.alturaCm == null ? "" : String(user.alturaCm),
      objetivoFisico: normalizeObjetivo(user?.objetivoFisico ?? ""),
      sexo: (user?.sexo ?? user?.sexoBiologico ?? "") as ProfileForm["sexo"],
      realizaActividadFisica: user?.realizaActividadFisica ?? false,
      diasEntrenamientoSemana: user?.diasEntrenamientoSemana == null ? "" : String(user.diasEntrenamientoSemana),
      tipoActividadFisica: user?.tipoActividadFisica ?? "",
      tipoEntrenamiento: user?.tipoEntrenamiento ?? "",
      duracionPromedioSesionMinutos: user?.duracionPromedioSesionMinutos == null ? "" : String(user.duracionPromedioSesionMinutos),
    });
    setEditing(!profileComplete);
  }, [profileComplete, user]);

  useEffect(() => {
    if (!user?.clienteId) return;
    void cargarPesos(user.clienteId);
  }, [user?.clienteId]);

  useEffect(() => {
    if (!user?.clienteId) return;
    let active = true;
    setCargandoSalud(true);
    setErrorSalud("");
    saludService.getProfile(user.clienteId)
      .then(profile => { if (active) setPerfilSalud(profile); })
      .catch(cause => {
        if (!active) return;
        setPerfilSalud(null);
        setErrorSalud(cause instanceof Error ? cause.message : "No se pudo cargar la información de salud.");
      })
      .finally(() => { if (active) setCargandoSalud(false); });
    return () => { active = false; };
  }, [user?.clienteId]);

  const registrarPeso = async (confirmado = false) => {
    if (pesoEnCurso.current) return;
    const validacion = validarPesoSemanal(nuevoPeso);
    if (!user?.clienteId || validacion) {
      setErrorPeso(validacion || "No se encontró el cliente.");
      return;
    }
    if (cargandoPesos || cargaPesoFallida || !pesoEstado?.habilitado) return;
    pesoEnCurso.current = true;
    setGuardandoPeso(true); setErrorPeso(""); setMensajePeso("");
    try {
      const estado = await pesoSemanalService.registrar(user.clienteId, Number(nuevoPeso), confirmado);
      setPesoEstado(estado); setNuevoPeso(""); setConfirmarPeso(false);
      setMensajePeso("Peso semanal guardado. Las nuevas metas se aplicarán desde el siguiente plan diario.");
      await Promise.all([refreshProfile(), cargarPesos(user.clienteId)]);
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 409 && cause.message.includes("CONFIRMAR_CAMBIO_PESO")) {
        setConfirmarPeso(true);
        setErrorPeso("El cambio es de 5 % o más. Confirma que el peso ingresado es correcto.");
      } else {
        toast.error(cause instanceof Error ? cause.message : "No se pudo guardar el peso.");
        if (cause instanceof ApiError && cause.status === 409) await cargarPesos(user.clienteId);
      }
    } finally { pesoEnCurso.current = false; setGuardandoPeso(false); }
  };

  const initials = (user?.nombre ?? "Usuario").split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  const duracionTotal = Number(form.duracionPromedioSesionMinutos) || 0;
  const duracionHoras = Math.floor(duracionTotal / 60);
  const duracionMinutos = duracionTotal % 60;
  const cambiarDuracion = (horas: number, minutos: number) => {
    const total = Math.min(1440, Math.max(0, horas * 60 + minutos));
    setForm(c => ({ ...c, duracionPromedioSesionMinutos: total === 0 ? "" : String(total) }));
  };
  const activityValid = !form.realizaActividadFisica || (
    Number(form.diasEntrenamientoSemana) >= 1 && Number(form.diasEntrenamientoSemana) <= 7 &&
    form.tipoActividadFisica.trim().length > 0 &&
    form.tipoEntrenamiento !== "" &&
    Number(form.duracionPromedioSesionMinutos) >= 1 && Number(form.duracionPromedioSesionMinutos) <= 359
  );
  const sexoValid = form.sexo === "" || form.sexo === "MASCULINO" || form.sexo === "FEMENINO";
  const valid =
    Number(form.edad) >= 13 &&
    Number(form.edad) <= 120 &&
    Number(form.pesoKg) >= 1 &&
    Number(form.pesoKg) <= 500 &&
    Number(form.alturaCm) >= 30 &&
    Number(form.alturaCm) <= 300 &&
    form.objetivoFisico.trim().length >= 2 &&
    form.objetivoFisico.trim().length <= 120 &&
    sexoValid &&
    activityValid;

  const save = async () => {
    if (!valid) {
      const faltantes: string[] = [];
      if (!(Number(form.edad) >= 13 && Number(form.edad) <= 120)) faltantes.push("edad (13-120)");
      if (!(Number(form.pesoKg) >= 1 && Number(form.pesoKg) <= 500)) faltantes.push("peso (1-500 kg)");
      if (!(Number(form.alturaCm) >= 30 && Number(form.alturaCm) <= 300)) faltantes.push("altura (30-300 cm)");
      if (!(form.objetivoFisico.trim().length >= 2 && form.objetivoFisico.trim().length <= 120)) faltantes.push("objetivo (2-120 caracteres)");
      if (!sexoValid) faltantes.push("sexo (Masculino o Femenino)");
      if (!activityValid) faltantes.push("datos de actividad física (días, actividad, entrenamiento y duración)");
      const aviso = `Completa los campos: ${faltantes.join(", ")}.`;
      setError(aviso);
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      // Si form.sexo está vacío pero user ya tenía sexo, preservar el valor actual
      // (PUT backend solo actualiza si != null). Si ambos vacíos, omitir sexo.
      const sexoActual = (user?.sexo ?? (user as any)?.sexoBiologico ?? null) as "MASCULINO" | "FEMENINO" | null;
      const sexoFinal: "MASCULINO" | "FEMENINO" | null =
        form.sexo === "" ? sexoActual : (form.sexo as "MASCULINO" | "FEMENINO");
      // No se envía objetivoEnergetico — lo deriva el backend. No se calculan kcal aquí.
      await updateProfile({
        edad: Number(form.edad),
        alturaCm: Number(form.alturaCm),
        objetivoFisico: form.objetivoFisico.trim(),
        tipoObjetivoFisico: tipoObjetivoDesdeUx(form.objetivoFisico.trim()),
        sexo: sexoFinal,
        realizaActividadFisica: form.realizaActividadFisica,
        diasEntrenamientoSemana: form.realizaActividadFisica ? Number(form.diasEntrenamientoSemana) : null,
        tipoActividadFisica: form.realizaActividadFisica ? form.tipoActividadFisica.trim() : null,
        tipoEntrenamiento: form.realizaActividadFisica ? form.tipoEntrenamiento : null,
        duracionPromedioSesionMinutos: form.realizaActividadFisica ? Number(form.duracionPromedioSesionMinutos) : null,
      });
      setEditing(false);
      setMessage("Perfil actualizado correctamente.");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "No se pudo actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  const input = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400";

  const estrategiaLabel =
    user?.objetivoEnergetico === "DEFICIT" ? "Déficit calórico" : user?.objetivoEnergetico === "SUPERAVIT" ? "Superávit calórico" : user?.objetivoEnergetico === "MANTENIMIENTO" ? "Mantenimiento" : null;

  return <div>
    <SectionHeader title="Mi Perfil" subtitle={profileComplete ? "Información personal y actividad básica" : "Completa tus datos para continuar"} action={!editing ? <button onClick={() => { setEditing(true); setMessage(""); }} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">Editar perfil</button> : undefined} />
    <OperationNotice message={message} kind="success"/>
    <div className="grid grid-cols-1 gap-4 mb-5 lg:grid-cols-3">
      <Card className="p-6 text-center"><div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4">{initials}</div><h3 className="font-semibold text-slate-800 text-lg mb-0.5 break-words" style={H}>{user?.nombre}</h3><p className="text-sm text-slate-500 mb-4 break-all">{user?.email}</p><div className="flex flex-wrap justify-center gap-2"><Badge label={user?.activo ? "Activo" : "Inactivo"} variant={user?.activo ? "success" : "neutral"} /><Badge label="Cliente" variant="info" /></div></Card>
      <Card className="p-6 lg:col-span-2"><h4 className="font-semibold text-slate-800 text-sm mb-5" style={H}>Datos personales</h4><div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">{[["Nombre", user?.nombre ?? "No disponible"], ["Email", user?.email ?? "No disponible"], ["Edad", user?.edad != null ? `${user.edad} años` : "No disponible"], ["Peso", user?.pesoKg != null ? `${user.pesoKg} kg` : "No disponible"], ["Altura", user?.alturaCm != null ? `${user.alturaCm} cm` : "No disponible"], ["IMC", user?.imc != null ? user.imc.toFixed(2) : "No disponible"], ["Objetivo", normalizeObjetivo(user?.objetivoFisico) || "No disponible"], ["Sexo", (user?.sexo ?? user?.sexoBiologico) ?? "No disponible"], ["Actividad física", user?.realizaActividadFisica ? `${user?.diasEntrenamientoSemana ?? "—"} días/semana` : user?.realizaActividadFisica === false ? "No realiza" : "No disponible"], ["Tipo de actividad", user?.realizaActividadFisica ? user?.tipoActividadFisica ?? "No disponible" : "—"], ["Tipo de entrenamiento", user?.realizaActividadFisica ? user?.tipoEntrenamiento ?? "No disponible" : "—"], ["Duración por sesión", user?.realizaActividadFisica ? user?.duracionPromedioSesionMinutos != null ? `${user.duracionPromedioSesionMinutos} min` : "No disponible" : "—"]].map(([label, val]) => <div key={label} className="flex items-start justify-between gap-3 border-b border-slate-50 pb-3"><span className="shrink-0 text-xs text-slate-500 font-medium">{label}</span><span className="min-w-0 break-all text-right text-sm text-slate-800 font-medium" style={MONO}>{val}</span></div>)}</div>
        {estrategiaLabel && (
          <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50/70 p-3">
            <p className="text-xs font-semibold text-amber-800">Estrategia nutricional del sistema</p>
            <p className="mt-1 text-sm font-medium text-amber-900">{estrategiaLabel}</p>
            <p className="mt-1 text-xs leading-5 text-amber-700/80">Derivada a partir de tu objetivo y perfil. No editable aquí.</p>
          </div>
        )}
        {!estrategiaLabel && user?.objetivoEnergetico == null && (
          <p className="mt-4 text-xs leading-5 text-slate-400">PENDIENTE: estrategia nutricional derivada (déficit/mantenimiento/superávit) se mostrará aquí cuando esté disponible.</p>
        )}
      </Card>
    </div>
    <Card className="mb-5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700"><ShieldCheck size={20}/></div>
          <div><h4 className="text-sm font-semibold text-slate-800" style={H}>Salud y seguridad</h4><p className="mt-1 text-xs text-slate-500">Información declarada para personalizar orientaciones de forma segura.</p></div>
        </div>
        <button type="button" onClick={() => navigate("/register?salud=1")} className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">Editar información de salud</button>
      </div>

      {cargandoSalud && <p role="status" className="mt-5 text-sm text-slate-500">Cargando información de salud…</p>}
      {!cargandoSalud && errorSalud && <p role="alert" className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorSalud}</p>}
      {!cargandoSalud && perfilSalud && !perfilSalud.completo && <p className="mt-5 text-sm text-slate-500">Aún no has completado tu información de salud.</p>}
      {!cargandoSalud && perfilSalud?.completo && (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
            {[
              ["¿Tiene una condición de salud?", perfilSalud.ningunaPatologiaConocida ? "No" : "Sí"],
              ["Patrón alimentario", PATRON_LABELS[perfilSalud.patronAlimentario]],
              ...((user?.sexo ?? user?.sexoBiologico) !== "MASCULINO" ? [["Embarazo o lactancia", ESTADO_REPRODUCTIVO_LABELS[perfilSalud.estadoReproductivo]]] : []),
              ["Sensibilidad a la cafeína", perfilSalud.sensibilidadCafeina ? "Sí" : "No"],
            ].map(([label, value]) => <div key={label} className="flex items-start justify-between gap-3 border-b border-slate-50 pb-3"><span className="text-xs font-medium text-slate-500">{label}</span><span className="text-right text-sm font-medium text-slate-800" style={MONO}>{value}</span></div>)}
          </div>

          {!perfilSalud.ningunaPatologiaConocida && (
            <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Condiciones o patologías</p><div className="mt-2 flex flex-wrap gap-2">{perfilSalud.patologias.filter(item => item.estado !== "NO_DECLARADA").map(item => <span key={item.codigo} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">{item.nombre} · {item.estado === "CONFIRMADA" ? "Confirmada" : "En evaluación o sospechada"}</span>)}</div></div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Medicamentos actuales", perfilSalud.medicamentos],
              ["Alergias conocidas", perfilSalud.alergias],
              ["Deficiencias confirmadas", perfilSalud.deficiencias.filter(item => item.confirmada).map(item => item.nombre)],
            ].map(([label, items]) => <div key={label as string} className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-600">{label as string}</p><p className="mt-1 text-sm leading-5 text-slate-800">{(items as string[]).length ? (items as string[]).join(", ") : "Ninguno declarado"}</p></div>)}
          </div>
        </div>
      )}
    </Card>
    <Card className="mb-5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3"><div className="rounded-xl bg-teal-50 p-2.5 text-teal-700"><Scale size={20}/></div><div><h4 className="text-sm font-semibold text-slate-800" style={H}>Seguimiento semanal de peso</h4><p className="mt-1 text-xs text-slate-500">Regístralo una vez por semana, con la misma balanza y en condiciones similares.</p></div></div>
        {pesoEstado?.variacionKg != null && <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${pesoEstado.variacionKg > 0 ? "bg-amber-50 text-amber-700" : pesoEstado.variacionKg < 0 ? "bg-sky-50 text-sky-700" : "bg-slate-100 text-slate-600"}`}>{pesoEstado.variacionKg > 0 ? <TrendingUp size={13}/> : <TrendingDown size={13}/>} {pesoEstado.variacionKg > 0 ? "+" : ""}{pesoEstado.variacionKg} kg</div>}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <Field label="Peso medido (kg)"><input aria-label="Peso semanal medido en kg" aria-invalid={!!pesoInvalido} aria-describedby={pesoInvalido ? "peso-validacion" : undefined} type="number" min="1" max="500" step="0.01" value={nuevoPeso} onChange={e => { setNuevoPeso(e.target.value); setConfirmarPeso(false); setErrorPeso(""); }} disabled={guardandoPeso || cargandoPesos || cargaPesoFallida || !pesoEstado?.habilitado} className={input}/>{pesoInvalido && <p id="peso-validacion" role="alert" className="mt-1 text-xs text-rose-700">{pesoInvalido}</p>}</Field>
        <button onClick={() => void registrarPeso(confirmarPeso)} disabled={guardandoPeso || cargandoPesos || cargaPesoFallida || !nuevoPeso || !!pesoInvalido || !pesoEstado?.habilitado} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-45">{guardandoPeso ? "Guardando..." : confirmarPeso ? "Confirmar y guardar" : "Guardar peso"}</button>
      </div>
      {pesoEstado && !pesoEstado.habilitado && <p className="mt-3 text-xs text-slate-500">Ya registraste tu medición semanal. Próximo registro disponible: {new Date(`${pesoEstado.proximaFecha}T00:00:00`).toLocaleDateString("es-PE", { dateStyle: "long" })}.</p>}
      {cargandoPesos && <p role="status" className="mt-3 text-xs text-slate-500">Cargando seguimiento de peso…</p>}
      {cargaPesoFallida && <div className="mt-3 text-xs text-slate-600"><p>{detalleCargaPeso}</p><button type="button" disabled={cargandoPesos} onClick={() => user?.clienteId && void cargarPesos(user.clienteId)} className="mt-2 text-teal-700 underline disabled:opacity-50">Reintentar carga del seguimiento de peso</button></div>}
      <PesoCalendar registros={pesoHistorial} proximaFecha={pesoEstado?.proximaFecha} historialDisponible={historialPesoDisponible} cargando={cargandoPesos}/>
      <OperationNotice message={mensajePeso} kind="success"/>{errorPeso && <p role="alert" className="mt-3 text-xs text-rose-700">{errorPeso}</p>}
    </Card>
    <ObjetivoNutricionalCard clienteId={user?.clienteId} objetivoFisicoFallback={normalizeObjetivo(user?.objetivoFisico)} />
    <Card className="border-dashed p-6 text-center"><h4 className="mb-2 text-sm font-semibold text-slate-800" style={H}>Datos relevantes del análisis</h4><p className="text-sm text-slate-500">Consulta el resultado oficial y su trazabilidad en la sección <strong>Mi análisis</strong>.</p></Card>
    <AppModal
      open={editing}
      onOpenChange={setEditing}
      title="Actualizar datos personales"
      description="Tu objetivo describe tu situación; el sistema deriva la estrategia. No se calcula déficit/superávit aquí."
      footer={<><button onClick={() => setEditing(false)} disabled={saving} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">Cancelar</button><button onClick={() => void save()} disabled={!valid || saving} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45">{saving ? "Guardando..." : "Guardar cambios"}</button></>}
    >
      {error && <p role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><Field label="Edad (13–120)"><input aria-label="Edad" type="number" inputMode="numeric" min="13" max="120" step="1" value={form.edad} onChange={e => setForm(current => ({ ...current, edad: e.target.value.replace(/\D/g, "") }))} onKeyDown={e => { if (["e", "E", "+", "-", ".", ","].includes(e.key)) e.preventDefault(); }} className={input} /></Field><Field label="Peso (seguimiento semanal)"><input aria-label="Peso actual en kg" type="number" value={form.pesoKg} disabled className={`${input} bg-slate-50 text-slate-500`} /></Field><Field label="Altura (cm)"><input aria-label="Altura en cm" type="number" min="30" max="300" step="0.01" value={form.alturaCm} onChange={e => setForm(current => ({ ...current, alturaCm: e.target.value }))} className={input} /></Field></div>

      <div className="mt-4">
        <span className="mb-2 block text-xs font-semibold text-slate-600">Sexo biológico</span>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setForm(c => ({ ...c, sexo: "MASCULINO" }))} className={`rounded-lg border px-3 py-2.5 text-sm font-semibold ${form.sexo === "MASCULINO" ? "border-teal-500 bg-teal-50 text-teal-800" : "border-slate-200 bg-white text-slate-600"}`}>Masculino</button>
          <button type="button" onClick={() => setForm(c => ({ ...c, sexo: "FEMENINO" }))} className={`rounded-lg border px-3 py-2.5 text-sm font-semibold ${form.sexo === "FEMENINO" ? "border-teal-500 bg-teal-50 text-teal-800" : "border-slate-200 bg-white text-slate-600"}`}>Femenino</button>
        </div>
      </div>

      <div className="mt-4">
        <span className="mb-2 block text-xs font-semibold text-slate-600">¿Cuál es tu objetivo principal?</span>
        <div className="space-y-1.5">
          {OBJETIVOS_UX.map(obj => (
            <button key={obj.value} type="button" onClick={() => setForm(c => ({ ...c, objetivoFisico: obj.value }))} className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border text-sm text-left ${form.objetivoFisico === obj.value ? "border-[#397065] bg-emerald-50 text-[#173c36]" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${form.objetivoFisico === obj.value ? "border-teal-500 bg-teal-500" : "border-slate-300"}`}>{form.objetivoFisico === obj.value && <Check size={10} className="text-white" />}</span>
              {obj.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <span className="mb-2 block text-xs font-semibold text-slate-600">¿Realizas actividad física actualmente?</span>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setForm(c => ({ ...c, realizaActividadFisica: true }))} className={`rounded-lg border px-3 py-2.5 text-sm font-semibold ${form.realizaActividadFisica ? "border-teal-500 bg-teal-50 text-teal-800" : "border-slate-200 bg-white text-slate-600"}`}>Sí</button>
          <button type="button" onClick={() => setForm(c => ({ ...c, realizaActividadFisica: false, diasEntrenamientoSemana: "", tipoActividadFisica: "", tipoEntrenamiento: "", duracionPromedioSesionMinutos: "" }))} className={`rounded-lg border px-3 py-2.5 text-sm font-semibold ${!form.realizaActividadFisica ? "border-teal-500 bg-teal-50 text-teal-800" : "border-slate-200 bg-white text-slate-600"}`}>No</button>
        </div>
      </div>

      {form.realizaActividadFisica && (
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Tipo de actividad física"><input value={form.tipoActividadFisica} onChange={e => setForm(c => ({ ...c, tipoActividadFisica: e.target.value }))} placeholder="Ej.: gimnasio, caminata" className={input} /></Field>
            <Field label="Tipo de entrenamiento"><select value={form.tipoEntrenamiento} onChange={e => setForm(c => ({ ...c, tipoEntrenamiento: e.target.value as ProfileForm["tipoEntrenamiento"] }))} className={input}><option value="">Seleccionar</option>{TIPOS_ENTRENAMIENTO.map(tipo => <option key={tipo.value} value={tipo.value}>{tipo.label}</option>)}</select></Field>
            <Field label="Duración promedio por sesión">
              <div className="grid grid-cols-2 gap-2">
                <select aria-label="Horas de entrenamiento" value={duracionHoras} onChange={e => cambiarDuracion(Number(e.target.value), duracionMinutos)} className={input}>{Array.from({ length: 6 }, (_, hora) => <option key={hora} value={hora}>{hora} {hora === 1 ? "hora" : "horas"}</option>)}</select>
                <select aria-label="Minutos de entrenamiento" value={duracionMinutos} onChange={e => cambiarDuracion(duracionHoras, Number(e.target.value))} className={input}>{Array.from({ length: 60 }, (_, minuto) => <option key={minuto} value={minuto}>{minuto} min</option>)}</select>
              </div>
            </Field>
          </div>
          <Field label="¿Cuántos días por semana entrenas?">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setForm(c => ({ ...c, diasEntrenamientoSemana: String(Math.max(1, Number(c.diasEntrenamientoSemana || 1) - 1)) }))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white">−</button>
              <span className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold">{form.diasEntrenamientoSemana || "3"} días</span>
              <button type="button" onClick={() => setForm(c => ({ ...c, diasEntrenamientoSemana: String(Math.min(7, Number(c.diasEntrenamientoSemana || 3) + 1)) }))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white">+</button>
            </div>
          </Field>
          <p className="mt-2 text-xs text-slate-500">Rango válido: de 1 a 7 días por semana.</p>
        </div>
      )}

      {!valid && <p className="mt-4 text-xs text-amber-700">Completa todos los campos respetando los límites indicados.</p>}
      <p className="mt-3 text-xs leading-4 text-slate-400">Las metas diarias se calculan en el modelo predictivo después de guardar el perfil.</p>
    </AppModal>
  </div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>{children}</label>; }
