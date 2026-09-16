import { useState } from "react";
import { ArrowRight, Brain, ClipboardCheck, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FONT_HEADING } from "../../types";
import { OperationNotice } from "../../components/shared/OperationNotice";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const emailError = submitted && (!email.trim() ? "El correo es obligatorio." : !emailPattern.test(email) ? "Escribe un correo válido." : "");
  const passwordError = submitted && !password ? "La contraseña es obligatoria." : "";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setError("");
    auth.clearSessionExpired();
    if (!email.trim() || !password || !emailPattern.test(email)) return;
    setLoading(true);
    try {
      await auth.login({ email: email.trim(), password });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f3ed] text-slate-900 lg:grid lg:grid-cols-[minmax(360px,0.82fr)_1.18fr]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <section className="relative hidden overflow-hidden bg-[#173c36] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d8e85f] text-[#173c36]"><Brain size={20} /></div>
          <div><div className="font-semibold tracking-tight" style={FONT_HEADING}>NutriPredict</div><div className="text-[11px] text-emerald-100/65">Registro nutricional</div></div>
        </div>
        <div className="relative max-w-md">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#d8e85f]">Tu información, en orden</p>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.035em]" style={FONT_HEADING}>Hábitos reales.<br />Seguimiento claro.</h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-emerald-50/70">Registra alimentación y suplementos desde una sola ficha. Las funciones predictivas se mostrarán únicamente cuando el modelo esté integrado y validado.</p>
          <div className="mt-9 border-l border-white/20 pl-5">
            <div className="flex gap-3"><ClipboardCheck className="mt-0.5 text-[#d8e85f]" size={17} /><div><p className="text-sm font-medium">Datos conectados </p><p className="mt-1 text-xs leading-5 text-emerald-50/55">Sin resultados simulados ni clasificaciones inventadas.</p></div></div>
          </div>
        </div>
        <p className="relative text-[11px] text-emerald-100/45">Proyecto académico · Nutrición y tecnología</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[430px]">
          <div className="mb-10 flex items-center gap-3 lg:hidden"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#173c36] text-[#d8e85f]"><Brain size={20} /></div><span className="font-semibold" style={FONT_HEADING}>NutriPredict</span></div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#397065]">Acceso seguro</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900" style={FONT_HEADING}>Bienvenido de nuevo</h2>
          <p className="mt-2 text-sm text-slate-500">Ingresa con la cuenta registrada en el sistema.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            {auth.sessionExpired && <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Tu sesión expiró. Inicia sesión nuevamente.</div>}
            <OperationNotice message={error}/>
            <label className="block text-sm font-medium text-slate-700" htmlFor="login-email">Correo electrónico
              <input id="login-email" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" disabled={loading} aria-invalid={Boolean(emailError)} aria-describedby={emailError ? "login-email-error" : undefined} placeholder="nombre@correo.com" className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm shadow-[0_1px_0_rgba(15,23,42,.04)] outline-none transition focus:ring-3 ${emailError ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : "border-slate-200 focus:border-[#397065] focus:ring-emerald-100"}`} />
              {emailError && <span id="login-email-error" className="mt-1.5 block text-xs font-normal text-rose-600">{emailError}</span>}
            </label>
            <label className="block text-sm font-medium text-slate-700" htmlFor="login-password">Contraseña
              <div className="relative mt-2"><LockKeyhole size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input id="login-password" type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" disabled={loading} aria-invalid={Boolean(passwordError)} aria-describedby={passwordError ? "login-password-error" : undefined} placeholder="Tu contraseña" className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm shadow-[0_1px_0_rgba(15,23,42,.04)] outline-none transition focus:ring-3 ${passwordError ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : "border-slate-200 focus:border-[#397065] focus:ring-emerald-100"}`} /></div>
              {passwordError && <span id="login-password-error" className="mt-1.5 block text-xs font-normal text-rose-600">{passwordError}</span>}
            </label>
            <button type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#173c36] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#225148] disabled:cursor-not-allowed disabled:opacity-55">{loading ? "Verificando..." : "Iniciar sesión"}<ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" /></button>
          </form>
          <div className="mt-7 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">¿Aún no tienes una cuenta? <button onClick={() => navigate("/register")} className="font-semibold text-[#2d675c] hover:underline">Crear cuenta</button></div>
        </div>
      </section>
    </main>
  );
}
