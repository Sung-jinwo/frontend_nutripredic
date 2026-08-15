import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { AlertCircle, Pill, Info, CheckCircle } from "lucide-react";
import { SectionHeader, Card } from "../../../components/shared";
import { FONT_HEADING, FONT_MONO } from "../../../types";
import { supplementLevelData, SUPP_COLORS, supplementBarData } from "../../../data/mock-data";

const H = FONT_HEADING;
const MONO = FONT_MONO;

export default function AdminConsumoPage() {
  return (
    <div>
      <SectionHeader
        title="Análisis de consumo de suplementos"
        subtitle="Evaluación del nivel de suplementación en la base de clientes"
      />

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-emerald-500 rounded-xl p-5 text-white">
          <div className="text-3xl font-bold mb-1" style={H}>28%</div>
          <div className="text-emerald-100 text-sm font-medium">Bajo consumo</div>
          <div className="text-emerald-200/70 text-xs mt-0.5">70 clientes</div>
        </div>
        <div className="bg-amber-500 rounded-xl p-5 text-white">
          <div className="text-3xl font-bold mb-1" style={H}>30%</div>
          <div className="text-amber-100 text-sm font-medium">Consumo moderado</div>
          <div className="text-amber-200/70 text-xs mt-0.5">74 clientes</div>
        </div>
        <div className="bg-rose-500 rounded-xl p-5 text-white">
          <div className="text-3xl font-bold mb-1" style={H}>42%</div>
          <div className="text-rose-100 text-sm font-medium">Alto consumo</div>
          <div className="text-rose-200/70 text-xs mt-0.5">104 clientes</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Donut */}
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-3" style={H}>Distribución total</h3>
          <div className="flex flex-col items-center">
            <div className="relative">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={supplementLevelData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" strokeWidth={2} stroke="#fff">
                    {supplementLevelData.map((_, i) => <Cell key={i} fill={SUPP_COLORS[i]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-lg font-bold text-rose-500" style={H}>42%</div>
                <div className="text-[10px] text-slate-400">consumo alto</div>
              </div>
            </div>
            <div className="space-y-1.5 w-full mt-2">
              {supplementLevelData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: SUPP_COLORS[i] }} />
                    {d.name}
                  </div>
                  <span className="text-xs font-bold text-slate-700" style={MONO}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Bar chart by type */}
        <Card className="col-span-2 p-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-3" style={H}>Consumo por tipo de suplemento</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={supplementBarData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis dataKey="tipo" type="category" tick={{ fontSize: 11, fill: "#64748b" }} width={80} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="bajo" fill="#10b981" stackId="a" name="Bajo" />
              <Bar dataKey="moderado" fill="#f59e0b" stackId="a" name="Moderado" />
              <Bar dataKey="alto" fill="#f43f5e" stackId="a" name="Alto" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Observations */}
      <Card className="p-5">
        <h3 className="font-semibold text-slate-800 text-sm mb-3" style={H}>Observaciones del análisis</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: AlertCircle, color: "rose", title: "Alto consumo predominante", desc: "El 42% de los clientes presenta un consumo elevado de suplementos, superando las recomendaciones estándar para su perfil físico." },
            { icon: Pill, color: "indigo", title: "Proteína: suplemento más consumido", desc: "El 50% de los clientes que consumen proteína lo hacen en niveles altos. Es el suplemento con mayor penetración en la base de clientes." },
            { icon: Info, color: "amber", title: "Creatina y pre-entreno con alta prevalencia", desc: "Combinados representan más del 45% en consumo elevado, sugiriendo un perfil de clientes orientados al rendimiento deportivo." },
            { icon: CheckCircle, color: "emerald", title: "Omega-3 y vitaminas bien calibrados", desc: "El 55% y 45% respectivamente presentan bajo consumo, lo cual es adecuado para suplementos de soporte general." },
          ].map(o => (
            <div key={o.title} className={`flex items-start gap-3 p-3.5 rounded-lg border ${o.color === "rose" ? "bg-rose-50 border-rose-100" : o.color === "amber" ? "bg-amber-50 border-amber-100" : o.color === "emerald" ? "bg-emerald-50 border-emerald-100" : "bg-indigo-50 border-indigo-100"}`}>
              <o.icon size={15} className={`mt-0.5 flex-shrink-0 ${o.color === "rose" ? "text-rose-500" : o.color === "amber" ? "text-amber-500" : o.color === "emerald" ? "text-emerald-500" : "text-indigo-500"}`} />
              <div>
                <div className="text-xs font-semibold text-slate-700">{o.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{o.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
