import {
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { SectionHeader, ProgressBar, Card } from "../../../components/shared";
import { FONT_HEADING, FONT_MONO } from "../../../types";
import { nutritionData, NUTR_COLORS, knowledgeTrend } from "../../../data/mock-data";

const H = FONT_HEADING;
const MONO = FONT_MONO;

export default function AdminConocimientoPage() {
  return (
    <div>
      <SectionHeader
        title="Análisis de conocimiento nutricional"
        subtitle="Distribución del nivel de comprensión sobre hábitos alimenticios y suplementación"
      />

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-rose-500 rounded-xl p-5 text-white">
          <div className="text-3xl font-bold mb-1" style={H}>35%</div>
          <div className="text-rose-100 text-sm font-medium">Nivel Bajo</div>
          <div className="text-rose-200/70 text-xs mt-0.5">87 clientes</div>
        </div>
        <div className="bg-amber-500 rounded-xl p-5 text-white">
          <div className="text-3xl font-bold mb-1" style={H}>40%</div>
          <div className="text-amber-100 text-sm font-medium">Nivel Medio</div>
          <div className="text-amber-200/70 text-xs mt-0.5">99 clientes</div>
        </div>
        <div className="bg-emerald-500 rounded-xl p-5 text-white">
          <div className="text-3xl font-bold mb-1" style={H}>25%</div>
          <div className="text-emerald-100 text-sm font-medium">Nivel Alto</div>
          <div className="text-emerald-200/70 text-xs mt-0.5">62 clientes</div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-4">
        {/* Donut */}
        <Card className="col-span-2 p-6">
          <h3 className="font-semibold text-slate-800 text-sm mb-4" style={H}>Distribución general</h3>
          <div className="flex flex-col items-center">
            <div className="relative">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={nutritionData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={90}
                    dataKey="value" strokeWidth={2} stroke="#fff"
                  >
                    {nutritionData.map((_, i) => <Cell key={i} fill={NUTR_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-2xl font-bold text-slate-800" style={H}>248</div>
                <div className="text-xs text-slate-400">clientes</div>
              </div>
            </div>
            <div className="flex gap-5 mt-3">
              {nutritionData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: NUTR_COLORS[i] }} />
                  <span className="text-xs text-slate-500">{d.name} · <strong>{d.value}%</strong></span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Details */}
        <Card className="col-span-3 p-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-4" style={H}>Desglose por nivel</h3>
          <div className="space-y-4">
            {[
              { nivel: "Bajo", val: 35, total: 87, color: "rose", desc: "Clientes con escaso conocimiento sobre macronutrientes, suplementación y planificación alimenticia." },
              { nivel: "Medio", val: 40, total: 99, color: "amber", desc: "Clientes con conocimiento básico que pueden beneficiarse de orientación específica." },
              { nivel: "Alto", val: 25, total: 62, color: "emerald", desc: "Clientes con comprensión sólida de la nutrición y uso adecuado de suplementos." },
            ].map(r => (
              <div key={r.nivel} className={`p-4 rounded-lg border ${r.color === "rose" ? "bg-rose-50 border-rose-100" : r.color === "amber" ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${r.color === "rose" ? "text-rose-700" : r.color === "amber" ? "text-amber-700" : "text-emerald-700"}`}>
                      Conocimiento {r.nivel}
                    </span>
                    <span className="text-xs text-slate-500">{r.total} clientes</span>
                  </div>
                  <span className="text-xl font-bold text-slate-800" style={MONO}>{r.val}%</span>
                </div>
                <ProgressBar value={r.val} color={r.color === "rose" ? "bg-rose-400" : r.color === "amber" ? "bg-amber-400" : "bg-emerald-400"} />
                <p className="text-xs text-slate-500 mt-2">{r.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Trend */}
      <Card className="p-5">
        <h3 className="font-semibold text-slate-800 text-sm mb-4" style={H}>Evolución mensual 2025</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={knowledgeTrend}>
            <defs>
              <linearGradient id="gBajo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gMedio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gAlto" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="bajo" stroke="#f43f5e" fill="url(#gBajo)" strokeWidth={2} name="Bajo" />
            <Area type="monotone" dataKey="medio" stroke="#f59e0b" fill="url(#gMedio)" strokeWidth={2} name="Medio" />
            <Area type="monotone" dataKey="alto" stroke="#10b981" fill="url(#gAlto)" strokeWidth={2} name="Alto" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
