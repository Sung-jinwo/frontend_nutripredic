import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { FONT_HEADING } from "../../types";

export default function RegisterPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [step, setStep] = useState(1);
  const [objetivo, setObjetivo] = useState("");
  const [edad, setEdad] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");

  const objectives = ["Pérdida de peso", "Aumento de masa muscular", "Mantenimiento", "Mejora del rendimiento", "Salud general"];

  return (
    <div className="min-h-screen bg-[#f0f4fb] flex items-center justify-center p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <div className="font-bold text-slate-800" style={FONT_HEADING}>NutriPredict</div>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${step >= 1 ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-500"}`}>1</div>
          <div className={`flex-1 h-0.5 rounded ${step >= 2 ? "bg-teal-500" : "bg-slate-200"}`} />
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${step >= 2 ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-500"}`}>2</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-1" style={FONT_HEADING}>
            {step === 1 ? "Crear cuenta" : "Perfil físico"}
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            {step === 1 ? "Paso 1 de 2 · Información personal" : "Paso 2 de 2 · Datos físicos y objetivo"}
          </p>

          {step === 1 ? (
            <div className="space-y-4">
              {[
                { label: "Nombre completo", placeholder: "Ana María Rodríguez", type: "text" },
                { label: "Correo electrónico", placeholder: "correo@ejemplo.com", type: "email" },
                { label: "Contraseña", placeholder: "Mínimo 8 caracteres", type: "password" },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                  />
                </div>
              ))}
              <button
                onClick={() => setStep(2)}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-1"
              >
                Continuar
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Edad", placeholder: "24", unit: "años", val: edad, set: setEdad },
                  { label: "Peso", placeholder: "65", unit: "kg", val: peso, set: setPeso },
                  { label: "Altura", placeholder: "165", unit: "cm", val: altura, set: setAltura },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{f.label}</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={f.val}
                        onChange={e => f.set(e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm pr-8"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">{f.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Objetivo físico</label>
                <div className="space-y-1.5">
                  {objectives.map(obj => (
                    <button
                      key={obj}
                      onClick={() => setObjetivo(obj)}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border text-sm text-left transition-all ${
                        objetivo === obj
                          ? "border-teal-400 bg-teal-50 text-teal-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${objetivo === obj ? "border-teal-500 bg-teal-500" : "border-slate-300"}`}>
                        {objetivo === obj && <Check size={10} className="text-white" />}
                      </div>
                      {obj}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={() => auth.login("client")}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  Crear cuenta
                </button>
              </div>
            </div>
          )}

          <div className="mt-5 text-center">
            <button onClick={() => navigate("/login")} className="text-xs text-slate-400 hover:text-slate-600">
              ¿Ya tienes cuenta? Iniciar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
