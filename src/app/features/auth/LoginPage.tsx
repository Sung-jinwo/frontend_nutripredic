import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Utensils, Pill, User, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { FONT_HEADING } from "../../types";
import type { Role } from "../../types";

export default function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left panel */}
      <div className="hidden lg:flex w-[52%] bg-[#0a1628] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 via-transparent to-indigo-900/30" />
        {/* Decorative rings */}
        <div className="absolute -right-24 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5" />
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-white/5" />
        <div className="absolute right-24 top-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-teal-500/10" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg">
            <Brain size={22} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-base" style={FONT_HEADING}>NutriPredict</div>
            <div className="text-teal-400 text-[11px] font-medium">Sistema de Análisis IA</div>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4" style={FONT_HEADING}>
            Modelo predictivo<br />basado en IA para<br />análisis nutricional
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Plataforma de inteligencia artificial para el análisis de hábitos alimenticios y consumo de suplementos en clientes.
          </p>

          {/* Feature cards */}
          <div className="mt-8 space-y-2.5">
            {[
              { icon: Utensils, color: "bg-emerald-500/20 text-emerald-400", title: "Análisis de hábitos alimenticios", desc: "Evaluación nutricional personalizada" },
              { icon: Pill, color: "bg-indigo-500/20 text-indigo-400", title: "Control de suplementos", desc: "Monitoreo y seguimiento continuo" },
              { icon: Brain, color: "bg-teal-500/20 text-teal-400", title: "Predicción con IA", desc: "Modelo Scikit-learn · Precisión 87.4%" },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-3.5 border border-white/8">
                <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={15} />
                </div>
                <div>
                  <div className="text-white text-xs font-medium">{title}</div>
                  <div className="text-slate-500 text-[11px]">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-4 text-slate-600 text-[11px]">
          <span>React · Spring Boot · Python · PostgreSQL</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f0f4fb]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <div className="font-bold text-slate-800" style={FONT_HEADING}>NutriPredict</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-1" style={FONT_HEADING}>Iniciar sesión</h2>
            <p className="text-slate-500 text-sm mb-7">Ingresa tus credenciales para acceder al sistema</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
                />
              </div>

              <button
                onClick={() => auth.login("client")}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-1"
              >
                Iniciar sesión
              </button>

              {/* Demo separator */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-[11px] text-slate-400 font-medium">Acceso demo rápido</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => auth.login("client")}
                  className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all text-xs font-semibold"
                >
                  <User size={13} />
                  Cliente
                </button>
                <button
                  onClick={() => auth.login("admin")}
                  className="flex items-center justify-center gap-2 py-2.5 border border-indigo-200 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-all text-xs font-semibold"
                >
                  <Shield size={13} />
                  Administrador
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <span className="text-sm text-slate-500">¿No tienes cuenta? </span>
              <button onClick={() => navigate("/register")} className="text-sm text-teal-600 hover:text-teal-700 font-semibold">
                Crear cuenta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
