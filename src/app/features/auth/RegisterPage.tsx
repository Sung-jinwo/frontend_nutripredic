import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Check, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { FONT_HEADING } from "../../types";
import { ObjetivoOnboardingResult } from "../../components/shared/ObjetivoNutricionalCard";
import { tipoObjetivoDesdeUx, type TipoEntrenamiento } from "../../services/client.service";
import { toast } from "../../services/notifications";
import { ApiError } from "../../services/api";
import type { FieldErrors } from "../../services/validation-errors";
import { REGISTER_FIELDS, validateRegistration } from "./register-validation";

/**
 * FASE UX-2 — Onboarding en 3 pasos
 * Paso 1: Cuenta (nombre, correo, contraseña, confirmación)
 * Paso 2: Información personal (edad, peso, altura, objetivo físico — UX sin técnico)
 * Paso 3: Actividad física básica para personalizar la meta diaria
 * No se pregunta objetivoEnergetico. No se calcula déficit/superávit.
 */

// UX labels mostrados al cliente — conceptuales, no técnicos
const OBJETIVOS_UX = [
  { label: "Reducir grasa corporal", desc: "Mejorar composición corporal", value: "Reducir grasa corporal" },
  { label: "Mantener mi peso/composición", desc: "Sostener hábitos actuales", value: "Mantener mi peso/composición" },
  { label: "Aumentar masa muscular", desc: "Ganar masa con acompañamiento", value: "Aumentar masa muscular" },
  { label: "Mejorar mis hábitos", desc: "Ordenar alimentación y rutina", value: "Mejorar mis hábitos" },
] as const;

const TIPOS_ENTRENAMIENTO: Array<{ value: TipoEntrenamiento; label: string }> = [
  { value: "FUERZA", label: "Fuerza" },
  { value: "CARDIO", label: "Cardio" },
  { value: "MIXTO", label: "Mixto" },
  { value: "OTRO", label: "Otro" },
];

// Mapping hacia valores legacy que backend ya acepta (campo es free-text varchar 120, pero mantenemos compatibilidad)
const LEGACY_MAP: Record<string, string> = {
  "Reducir grasa corporal": "Reducir grasa corporal",
  "Mantener mi peso/composición": "Mantener mi peso/composición",
  "Aumentar masa muscular": "Aumentar masa muscular",
  "Mejorar mis hábitos": "Mejorar mis hábitos",
  // legacy entrante
  "Pérdida de peso": "Reducir grasa corporal",
  "Mantenimiento": "Mantener mi peso/composición",
  "Salud general": "Mejorar mis hábitos",
  "Mejora del rendimiento": "Mejorar mis hábitos",
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [step, setStep] = useState(1);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const onlyDigits = (v: string) => v.replace(/\D/g, "");
  const [objetivo, setObjetivo] = useState("");
  const [sexo, setSexo] = useState<"MASCULINO" | "FEMENINO" | "">("");
  const [edad, setEdad] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [realizaActividad, setRealizaActividad] = useState<boolean | null>(null);
  const [dias, setDias] = useState("3");
  const [tipoActividadFisica, setTipoActividadFisica] = useState("");
  const [tipoEntrenamiento, setTipoEntrenamiento] = useState<TipoEntrenamiento | "">("");
  const [duracionSesion, setDuracionSesion] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attemptedSteps, setAttemptedSteps] = useState<number[]>([]);
  const localErrors = validateRegistration({ nombre, email, password, confirmPassword, edad,
    pesoKg: peso, alturaCm: altura, sexo, objetivoFisico: objetivo, realizaActividadFisica: realizaActividad,
    diasEntrenamientoSemana: dias, tipoActividadFisica, tipoEntrenamiento,
    duracionPromedioSesionMinutos: duracionSesion });
  const fieldMessage = (field: string) => serverErrors[field] || ((touched[field] || attemptedSteps.includes(step)) ? localErrors[field] : "");
  const feedback = (field: string) => fieldMessage(field) ? <p id={`register-${field}-error`} role="alert" className="mt-1.5 text-xs text-rose-700">{fieldMessage(field)}</p> : null;
  const inputProps = (field: string) => ({ "aria-invalid": Boolean(fieldMessage(field)),
    "aria-describedby": fieldMessage(field) ? `register-${field}-error` : undefined,
    onBlur: () => setTouched(current => ({ ...current, [field]: true })) });
  const clearField = (field: string) => setServerErrors(current => {
    const next = { ...current }; delete next[field]; return next;
  });
  const checkStep = (stage: 1 | 2 | 3) => {
    setAttemptedSteps(current => current.includes(stage) ? current : [...current, stage]);
    setError("");
    return !REGISTER_FIELDS[stage].some(field => localErrors[field]);
  };
  const captureServerErrors = (cause: unknown) => {
    if (!(cause instanceof ApiError)) return;
    const fields = cause.fieldErrors;
    setServerErrors(fields);
    const stage = ([1, 2, 3] as const).find(s => REGISTER_FIELDS[s].some(field => fields[field]));
    if (stage) setStep(stage);
  };

  useEffect(() => {
    if (!auth.isAuthenticated || auth.role !== "CLIENTE") return;
    if (auth.profileComplete) {
      navigate("/client/home", { replace: true });
      return;
    }
    setAccountCreated(true);
    // si ya tiene cuenta pero perfil incompleto, respetar donde estaba
    setStep((s) => (s === 1 ? 2 : s));
  }, [auth.isAuthenticated, auth.profileComplete, auth.role, navigate]);

  const continueToProfile = async () => {
    if (accountCreated) {
      setStep(2);
      return;
    }
    if (!checkStep(1)) return;
    setLoading(true);
    try {
      await auth.register({ nombre: nombre.trim(), email: email.trim(), password });
      setAccountCreated(true);
      setStep(2);
    } catch (cause) {
      captureServerErrors(cause);
      toast.error(cause instanceof Error ? cause.message : "No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  const goStep3 = () => {
    if (!checkStep(2)) return;
    setStep(3);
  };

  const handleFinalize = async () => {
    setError("");
    const parsedEdad = Number(edad), parsedPeso = Number(peso), parsedAltura = Number(altura);
    if (!checkStep(2)) { setStep(2); return; }
    if (!checkStep(3)) return;
    // No se calcula objetivoEnergetico. Solo se envía lo declarado.
    const valorObjetivo = LEGACY_MAP[objetivo] ?? objetivo;
    setLoading(true);
    try {
      await auth.completeProfile({
        edad: parsedEdad,
        pesoKg: parsedPeso,
        alturaCm: parsedAltura,
        objetivoFisico: valorObjetivo,
        tipoObjetivoFisico: tipoObjetivoDesdeUx(valorObjetivo),
        sexo: sexo as "MASCULINO" | "FEMENINO",
        realizaActividadFisica: realizaActividad,
        diasEntrenamientoSemana: realizaActividad ? Number(dias) : null,
        tipoActividadFisica: realizaActividad ? tipoActividadFisica.trim() : null,
        tipoEntrenamiento: realizaActividad ? tipoEntrenamiento : null,
        duracionPromedioSesionMinutos: realizaActividad ? Number(duracionSesion) : null,
      });
      setCompleted(true);
    } catch (cause) {
      captureServerErrors(cause);
      toast.error(cause instanceof Error ? cause.message : "No se pudo completar el perfil.");
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <main className="min-h-screen bg-[#f5f3ed] p-5 sm:flex sm:items-center sm:justify-center sm:p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="w-full max-w-lg rounded-2xl border border-[#dbe7e1] bg-white p-8 text-center shadow-[0_12px_30px_rgba(23,60,54,.08)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Check size={22} /></div>
          <div className="mt-4">
            <ObjetivoOnboardingResult clienteId={auth.user?.clienteId} objetivoFisico={objetivo} />
          </div>
          <button onClick={() => navigate("/client/home", { replace: true })} className="mt-6 w-full rounded-xl bg-[#173c36] py-3 text-sm font-semibold text-white hover:bg-[#225148]">Ir a mi inicio</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f3ed] p-5 sm:flex sm:items-center sm:justify-center sm:p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#173c36] text-[#d8e85f] shadow-sm">
            <Brain size={19} />
          </div>
          <div><div className="font-semibold text-slate-900" style={FONT_HEADING}>NutriPredict</div><div className="text-[11px] text-slate-500">Registro nutricional</div></div>
        </div>

        {/* Progress 1-2-3 */}
        <div className="mb-6 flex items-center gap-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex flex-1 items-center gap-2">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step >= n ? "bg-[#173c36] text-white" : "bg-slate-200 text-slate-500"}`}>{n}</div>
              <div className="hidden sm:block text-xs font-medium leading-none">
                <div className={step >= n ? "text-slate-900" : "text-slate-400"}>{n === 1 ? "Cuenta" : n === 2 ? "Perfil" : "Actividad"}</div>
              </div>
              {n < 3 && <div className={`h-0.5 flex-1 rounded ${step > n ? "bg-[#397065]" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#dbe7e1] bg-white p-6 shadow-[0_12px_30px_rgba(23,60,54,.08)] sm:p-8">
          <h2 className="mb-1 text-2xl font-semibold text-slate-900" style={FONT_HEADING}>
            {step === 1 ? "Crear cuenta" : step === 2 ? "Información personal" : "Actividad física"}
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            {step === 1 ? "Paso 1 de 3 · Cuenta" : step === 2 ? "Paso 2 de 3 · Datos personales" : "Paso 3 de 3 · Actividad física"}
          </p>
          {error && <div role="alert" className="mb-4 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">{error}</div>}

          {step === 1 && (
            <div className="space-y-4">
              {[
                { field: "nombre", max: 120, label: "Nombre completo", placeholder: "Ana María Rodríguez", type: "text", value: nombre, set: setNombre, autoComplete: "name" },
                { field: "email", max: 254, label: "Correo electrónico", placeholder: "correo@ejemplo.com", type: "email", value: email, set: setEmail, autoComplete: "email" },
              ].map(f => (
                <div key={f.label}>
                  <label htmlFor={`register-${f.field}`} className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{f.label}</label>
                  <input
                    id={`register-${f.field}`}
                    {...inputProps(f.field)}
                    maxLength={f.max}
                    type={f.type}
                    value={f.value}
                    onChange={e => { f.set(e.target.value); clearField(f.field); }}
                    autoComplete={f.autoComplete}
                    placeholder={f.placeholder}
                    className={`w-full rounded-xl border ${fieldMessage(f.field) ? "border-rose-500" : "border-slate-200"} bg-white px-3.5 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-[#397065] focus:ring-2 focus:ring-emerald-100`}
                  />
                  {feedback(f.field)}
                </div>
              ))}
              {[
                { field: "password", label: "Contraseña", placeholder: "Entre 8 y 72 caracteres", value: password, set: setPassword, show: showPassword, toggle: () => setShowPassword(v => !v) },
                { field: "confirmPassword", label: "Confirmar contraseña", placeholder: "Repite tu contraseña", value: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(v => !v) },
              ].map(f => (
                <div key={f.label}>
                  <label htmlFor={`register-${f.field}`} className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{f.label}</label>
                  <div className="relative">
                    <input
                      id={`register-${f.field}`}
                      {...inputProps(f.field)}
                      maxLength={72}
                      type={f.show ? "text" : "password"}
                      value={f.value}
                      onChange={e => { f.set(e.target.value); clearField(f.field); }}
                      autoComplete="new-password"
                      placeholder={f.placeholder}
                      className={`w-full rounded-xl border ${fieldMessage(f.field) ? "border-rose-500" : "border-slate-200"} bg-white px-3.5 py-3 pr-11 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-[#397065] focus:ring-2 focus:ring-emerald-100`}
                    />
                    <button type="button" onClick={f.toggle} aria-label={f.show ? `Ocultar ${f.label.toLowerCase()}` : `Mostrar ${f.label.toLowerCase()}`} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600">{f.show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                  </div>
                  {feedback(f.field)}
                </div>
              ))}
              <button onClick={continueToProfile} disabled={loading} className="mt-1 w-full rounded-xl bg-[#173c36] py-3 text-sm font-semibold text-white hover:bg-[#225148] disabled:opacity-60">
                {loading ? "Creando cuenta..." : "Continuar"}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { field: "edad", min: 13, max: 120, step: "1", label: "Edad", placeholder: "24", unit: "años", val: edad, set: setEdad },
                  { field: "pesoKg", min: 1, max: 500, step: "0.01", label: "Peso", placeholder: "65", unit: "kg", val: peso, set: setPeso },
                  { field: "alturaCm", min: 30, max: 300, step: "0.01", label: "Altura", placeholder: "165", unit: "cm", val: altura, set: setAltura },
                ].map(f => (
                  <div key={f.label}>
                    <label htmlFor={`register-${f.field}`} className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{f.label}</label>
                    <div className="relative">
                      <input id={`register-${f.field}`} {...inputProps(f.field)} min={f.min} max={f.max} step={f.step} type="number" inputMode={f.field === "edad" ? "numeric" : "decimal"} value={f.val} onChange={e => { const raw = e.target.value; f.set(f.field === "edad" ? onlyDigits(raw) : raw); clearField(f.field); }} onKeyDown={e => { if (f.field === "edad" && ["e", "E", "+", "-", ".", ",", "?", "!", "*", "/", "(", ")", "[", "]", "{", "}"].includes(e.key)) e.preventDefault(); }} disabled={loading} placeholder={f.placeholder} className={`w-full rounded-xl border ${fieldMessage(f.field) ? "border-rose-500" : "border-slate-200"} bg-white px-3 py-3 pr-8 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-[#397065] focus:ring-2 focus:ring-emerald-100`} />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">{f.unit}</span>
                    </div>
                    {feedback(f.field)}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Sexo biológico</label>
                <p className="mb-2 text-xs text-slate-500">Requerido para que el sistema calcule tu meta diaria.</p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => { setSexo("MASCULINO"); clearField("sexo"); }} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${sexo === "MASCULINO" ? "border-[#397065] bg-emerald-50 text-[#173c36]" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>Masculino</button>
                  <button type="button" onClick={() => { setSexo("FEMENINO"); clearField("sexo"); }} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${sexo === "FEMENINO" ? "border-[#397065] bg-emerald-50 text-[#173c36]" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>Femenino</button>
                </div>
                {feedback("sexo")}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">¿Cuál es tu objetivo principal?</label>
                <p className="mb-2 text-xs text-slate-500">Selecciona el que mejor describa tu situación. El sistema derivará la estrategia.</p>
                <div className="space-y-1.5">
                  {OBJETIVOS_UX.map(obj => (
                    <button
                      key={obj.value}
                      onClick={() => { setObjetivo(obj.value); clearField("objetivoFisico"); }}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border text-sm text-left transition-all ${
                        objetivo === obj.value ? "border-[#397065] bg-emerald-50 text-[#173c36]" : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${objetivo === obj.value ? "border-teal-500 bg-teal-500" : "border-slate-300"}`}>
                        {objetivo === obj.value && <Check size={10} className="text-white" />}
                      </div>
                      <span><span className="font-medium">{obj.label}</span><span className="ml-2 text-xs text-slate-500">{obj.desc}</span></span>
                    </button>
                  ))}
                </div>
                {feedback("objetivoFisico")}
              </div>

              <div className="flex gap-2.5 pt-1">
                <button onClick={() => { setError(""); setStep(1); }} disabled={loading} className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-lg text-sm hover:bg-slate-50">Atrás</button>
                <button onClick={goStep3} disabled={loading} className="flex-1 rounded-xl bg-[#173c36] py-2.5 text-sm font-semibold text-white hover:bg-[#225148] disabled:opacity-60">Continuar</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-slate-800">¿Realizas actividad física actualmente?</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    { v: true, label: "Sí" },
                    { v: false, label: "No" },
                  ].map(opt => (
                    <button
                      key={String(opt.v)}
                      onClick={() => {
                        setRealizaActividad(opt.v);
                        clearField("realizaActividadFisica");
                        if (!opt.v) {
                          setDias("3");
                          setTipoActividadFisica("");
                          setTipoEntrenamiento("");
                          setDuracionSesion("");
                          setServerErrors(current => Object.fromEntries(Object.entries(current).filter(([field]) => !REGISTER_FIELDS[3].includes(field as typeof REGISTER_FIELDS[3][number]))));
                        }
                      }}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold ${realizaActividad === opt.v ? "border-[#397065] bg-emerald-50 text-[#173c36]" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {feedback("realizaActividadFisica")}
              </div>

              {realizaActividad === true && (
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="mb-4">
                    <label htmlFor="tipo-actividad-fisica" className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">¿Qué actividad física realizas?</label>
                    <input
                      id="tipo-actividad-fisica"
                      {...inputProps("tipoActividadFisica")}
                      maxLength={120}
                      type="text"
                      value={tipoActividadFisica}
                      onChange={e => { setTipoActividadFisica(e.target.value); clearField("tipoActividadFisica"); }}
                      disabled={loading}
                      placeholder="Ej.: caminata, gimnasio, natación"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-[#397065] focus:ring-2 focus:ring-emerald-100"
                    />
                    {feedback("tipoActividadFisica")}
                  </div>
                  <div className="mb-4">
                    <label htmlFor="tipo-entrenamiento" className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">¿Qué tipo de entrenamiento realizas?</label>
                    <select
                      id="tipo-entrenamiento"
                      {...inputProps("tipoEntrenamiento")}
                      value={tipoEntrenamiento}
                      onChange={e => { setTipoEntrenamiento(e.target.value as TipoEntrenamiento | ""); clearField("tipoEntrenamiento"); }}
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-[#397065] focus:ring-2 focus:ring-emerald-100"
                    >
                      <option value="">Seleccionar</option>
                      {TIPOS_ENTRENAMIENTO.map(tipo => <option key={tipo.value} value={tipo.value}>{tipo.label}</option>)}
                    </select>
                    {feedback("tipoEntrenamiento")}
                  </div>
                  <div className="mb-4">
                    <label htmlFor="duracion-sesion" className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Duración promedio por sesión (minutos)</label>
                    <input
                      id="duracion-sesion"
                      {...inputProps("duracionPromedioSesionMinutos")}
                      type="number"
                      inputMode="numeric"
                      min="1"
                      max="1440"
                      step="1"
                      value={duracionSesion}
                      onChange={e => { setDuracionSesion(onlyDigits(e.target.value)); clearField("duracionPromedioSesionMinutos"); }}
                      onKeyDown={e => { if (["e", "E", "+", "-", ".", ",", "?", "!", "*", "/", "(", ")", "[", "]", "{", "}"].includes(e.key)) e.preventDefault(); }}
                      disabled={loading}
                      placeholder="Ej.: 60"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-[#397065] focus:ring-2 focus:ring-emerald-100"
                    />
                    {feedback("duracionPromedioSesionMinutos")}
                  </div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">¿Cuántos días por semana entrenas?</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => { setDias(String(Math.max(1, Number(dias) - 1))); clearField("diasEntrenamientoSemana"); }} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">−</button>
                    <div className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center text-sm font-semibold text-slate-800">{dias} días</div>
                    <button type="button" onClick={() => { setDias(String(Math.min(7, Number(dias) + 1))); clearField("diasEntrenamientoSemana"); }} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">+</button>
                  </div>
                  {feedback("diasEntrenamientoSemana")}
                  <p className="mt-2 text-xs text-slate-500">Rango válido: 1–7 días. Esta información se usa para personalizar tu meta diaria.</p>
                </div>
              )}

              {realizaActividad === false && (
                <div className="rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                  No solicitaremos más datos de actividad: con estos campos el sistema puede realizar la estimación inicial.
                </div>
              )}

              <div className="flex gap-2.5 pt-1">
                <button onClick={() => { setError(""); setStep(2); }} disabled={loading} className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-lg text-sm hover:bg-slate-50">Atrás</button>
                <button onClick={handleFinalize} disabled={loading || realizaActividad === null} className="flex-1 rounded-xl bg-[#173c36] py-2.5 text-sm font-semibold text-white hover:bg-[#225148] disabled:opacity-60">
                  {loading ? "Guardando..." : "Finalizar y continuar"}
                </button>
              </div>
              <p className="text-[11px] leading-4 text-slate-400">No se solicita déficit/superávit. La estrategia nutricional la deriva el sistema. No se calcula TMB/TDEE aquí.</p>
            </div>
          )}

          <div className="mt-5 text-center">
            <button onClick={() => navigate("/login")} className="text-xs text-slate-400 hover:text-slate-600">¿Ya tienes cuenta? Iniciar sesión</button>
          </div>
        </div>
      </div>
    </main>
  );
}
