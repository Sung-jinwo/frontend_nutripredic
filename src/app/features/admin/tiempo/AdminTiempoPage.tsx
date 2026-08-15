import { Clock, Zap, Activity, Brain } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { Badge, KPICard, SectionHeader, Card } from "../../../components/shared";
import { FONT_HEADING, FONT_MONO } from "../../../types";
import { weeklyTimes } from "../../../data/mock-data";

const H = FONT_HEADING;
const MONO = FONT_MONO;

export default function AdminTiempoPage() {
  return (
    <div>
      <SectionHeader
        title="Rendimiento del modelo de predicción"
        subtitle="Métricas de tiempo y eficiencia del sistema de inteligencia artificial"
      />

      {/* Main metric */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <div className="col-span-1 bg-[#0a1628] rounded-xl p-6 text-white flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full border-2 border-teal-400/50 flex items-center justify-center mb-3">
            <Clock size={22} className="text-teal-400" />
          </div>
          <div className="text-5xl font-bold text-teal-400 mb-1" style={{ ...H, ...MONO }}>0.30</div>
          <div className="text-slate-400 text-xs">segundos · promedio</div>
          <div className="mt-3 text-[10px] text-slate-500">Tiempo de respuesta del modelo</div>
        </div>
        <KPICard icon={Zap} title="Tiempo mínimo" value="0.12s" sub="Mejor registro" iconBg="bg-emerald-500" />
        <KPICard icon={Activity} title="Tiempo máximo" value="0.87s" sub="Carga alta" iconBg="bg-rose-500" />
        <KPICard icon={Brain} title="Total predicciones" value="312" change={15} sub="Acumulado 2025" iconBg="bg-indigo-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-4" style={H}>Tiempo de respuesta — últimos 7 días</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyTimes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, 1]} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => [`${v}s`, "Tiempo"]} />
              <Line type="monotone" dataKey="tiempo" stroke="#0d9488" strokeWidth={2.5} dot={{ fill: "#0d9488", r: 4 }} name="Segundos" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-4" style={H}>Predicciones por día</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyTimes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="predicciones" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Predicciones" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Metrics table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm" style={H}>Detalle de sesiones recientes</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              {["Día", "Predicciones", "Tiempo promedio", "Tiempo mínimo", "Tiempo máximo", "Estado"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {weeklyTimes.map((d, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{d.dia}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600" style={MONO}>{d.predicciones}</td>
                <td className="px-5 py-3.5 text-sm font-medium text-teal-600" style={MONO}>{d.tiempo}s</td>
                <td className="px-5 py-3.5 text-sm text-emerald-600" style={MONO}>{(d.tiempo * 0.5).toFixed(2)}s</td>
                <td className="px-5 py-3.5 text-sm text-rose-500" style={MONO}>{(d.tiempo * 1.8).toFixed(2)}s</td>
                <td className="px-5 py-3.5">
                  <Badge label={d.tiempo < 0.35 ? "Óptimo" : "Normal"} variant={d.tiempo < 0.35 ? "success" : "warning"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
