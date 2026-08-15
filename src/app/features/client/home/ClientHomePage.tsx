import { useNavigate } from "react-router-dom";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Brain, TrendingUp, Award, Sparkles, Calendar } from "lucide-react";
import { KPICard, Badge, SectionHeader, Card } from "../../../components/shared";
import { FONT_HEADING, FONT_MONO } from "../../../types";
import { clientEvolution } from "../../../data/mock-data";

const H = FONT_HEADING;
const MONO = FONT_MONO;

export default function ClientHomePage() {
  const navigate = useNavigate();

  return (
    <div>
      <SectionHeader
        title="Bienvenido, Ana María"
        subtitle="Tu panel de seguimiento nutricional · 16 de junio, 2026"
        action={
          <button
            onClick={() => navigate("/client/analisis")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
          >
            <Brain size={14} /> Ejecutar análisis IA
          </button>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-5">
        <KPICard icon={Brain} title="Nivel de conocimiento" value="55%" change={8} sub="vs. evaluación anterior" iconBg="bg-indigo-500" />
        <KPICard icon={TrendingUp} title="Consumo suplementos" value="Alto" sub="4 suplementos activos" iconBg="bg-rose-500" />
        <KPICard icon={Award} title="Nivel general" value="Moderado" sub="Resultado del análisis" iconBg="bg-amber-500" />
        <KPICard icon={Calendar} title="Registros activos" value="3" sub="Días con registro" iconBg="bg-teal-500" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <Card className="col-span-2 p-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-4" style={H}>Mi evolución</h3>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={clientEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, 100]} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Line type="monotone" dataKey="conocimiento" stroke="#14b8a6" strokeWidth={2.5} dot={{ fill: "#14b8a6", r: 4 }} name="Conocimiento" />
              <Line type="monotone" dataKey="suplementos" stroke="#f43f5e" strokeWidth={2.5} dot={{ fill: "#f43f5e", r: 4 }} name="Suplementos" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => navigate("/client/habitos")}
          className="group text-left p-5 rounded-xl border border-slate-100 bg-white hover:border-teal-200 hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Calendar size={20} />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm mb-1" style={H}>Mis Hábitos</h3>
          <p className="text-xs text-slate-500">Registra y consulta tus hábitos alimenticios diarios</p>
        </button>

        <button
          onClick={() => navigate("/client/analisis")}
          className="group text-left p-5 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Brain size={20} />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm mb-1" style={H}>Análisis Predictivo</h3>
          <p className="text-xs text-slate-500">Ejecuta el modelo IA y visualiza tus resultados</p>
        </button>

        <button
          onClick={() => navigate("/client/recomendaciones")}
          className="group text-left p-5 rounded-xl border border-slate-100 bg-white hover:border-emerald-200 hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Sparkles size={20} />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm mb-1" style={H}>Recomendaciones</h3>
          <p className="text-xs text-slate-500">Sugerencias personalizadas basadas en tu perfil</p>
        </button>
      </div>
    </div>
  );
}
