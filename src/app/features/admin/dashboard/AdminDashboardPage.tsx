import { useNavigate } from "react-router-dom";
import { Users, CheckCircle, Brain, Clock, RefreshCw, Eye, ChevronRight } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Badge, StateBadge, KPICard, SectionHeader, Card } from "../../../components/shared";
import { FONT_HEADING, FONT_MONO } from "../../../types";
import { nutritionData, NUTR_COLORS, supplementBarData, clients } from "../../../data/mock-data";

const H = FONT_HEADING;
const MONO = FONT_MONO;

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  return (
    <div>
      <SectionHeader
        title="Panel general"
        subtitle="Visión global del sistema · 16 de junio, 2026"
        action={<button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-semibold hover:bg-slate-50"><RefreshCw size={13} /> Actualizar</button>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <KPICard icon={Users} title="Clientes registrados" value="248" change={12} sub="vs. mes anterior" iconBg="bg-teal-500" />
        <KPICard icon={CheckCircle} title="Clientes evaluados" value="189" change={8} sub="76.2% del total" iconBg="bg-indigo-500" />
        <KPICard icon={Brain} title="Análisis realizados" value="312" change={15} sub="Acumulado 2025" iconBg="bg-purple-500" />
        <KPICard icon={Clock} title="Tiempo promedio IA" value="0.30s" change={-5} sub="Predicción por cliente" iconBg="bg-amber-500" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-5 gap-4 mb-5">
        {/* Nutrition donut */}
        <Card className="col-span-2 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800 text-sm" style={H}>Conocimiento nutricional</h3>
            <button onClick={() => navigate("/admin/conocimiento")} className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
              Ver detalle <ChevronRight size={11} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={nutritionData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                  {nutritionData.map((_, i) => <Cell key={i} fill={NUTR_COLORS[i]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {nutritionData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: NUTR_COLORS[i] }} />
                    <span className="text-xs text-slate-600">{d.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800" style={MONO}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Supplement bar */}
        <Card className="col-span-3 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800 text-sm" style={H}>Consumo de suplementos por tipo</h3>
            <button onClick={() => navigate("/admin/consumo")} className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
              Ver detalle <ChevronRight size={11} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={supplementBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="tipo" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="bajo" fill="#10b981" stackId="a" name="Bajo" />
              <Bar dataKey="moderado" fill="#f59e0b" stackId="a" name="Moderado" />
              <Bar dataKey="alto" fill="#f43f5e" stackId="a" name="Alto" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent clients */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 text-sm" style={H}>Clientes recientes</h3>
          <button onClick={() => navigate("/admin/clientes")} className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1">
            Ver todos <ChevronRight size={11} />
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              {["Cliente", "Edad", "Estado", "Última evaluación", "Resultado predictivo", ""].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {clients.slice(0, 5).map(c => (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-[11px] font-bold">
                      {c.nombre.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-800">{c.nombre}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{c.edad} años</td>
                <td className="px-5 py-3.5"><StateBadge estado={c.estado} /></td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{c.ultimaEval}</td>
                <td className="px-5 py-3.5">
                  <Badge label={c.resultado} variant={c.resultado === "Favorable" ? "success" : c.resultado === "Crítico" ? "danger" : c.resultado === "Sin evaluar" ? "neutral" : "warning"} />
                </td>
                <td className="px-5 py-3.5">
                  <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-colors"><Eye size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
