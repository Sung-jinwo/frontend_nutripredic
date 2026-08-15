import { Download } from "lucide-react";
import { SectionHeader, Card, Badge } from "../../../components/shared";
import { FONT_HEADING } from "../../../types";
import { clientEvolution, historialRegistros } from "../../../data/mock-data";
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer } from "recharts";

const H = FONT_HEADING;

export default function ClientHistorialPage() {
  return (
    <div>
      <SectionHeader
        title="Historial de Análisis"
        subtitle="Evolución y seguimiento de tus evaluaciones"
        action={
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-semibold hover:bg-slate-50">
            <Download size={14} /> Exportar
          </button>
        }
      />

      <Card className="p-5 mb-4">
        <h3 className="font-semibold text-slate-800 text-sm mb-4" style={H}>Evolución 2026</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={clientEvolution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, 100]} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="conocimiento" stroke="#14b8a6" strokeWidth={2.5} dot={{ fill: "#14b8a6", r: 4 }} name="Conocimiento nutricional" />
            <Line type="monotone" dataKey="suplementos" stroke="#f43f5e" strokeWidth={2.5} dot={{ fill: "#f43f5e", r: 4 }} name="Consumo suplementos" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm" style={H}>Registros de análisis</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              {["Fecha", "Tipo", "Conocimiento nutricional", "Consumo suplementos", "Nivel general", "Variación"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {historialRegistros.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5 text-sm text-slate-600 font-medium">{r.fecha}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{r.tipo}</td>
                <td className="px-5 py-3.5">
                  <Badge label={r.conocimiento} variant={r.conocimiento === "Alto" ? "success" : r.conocimiento === "Medio" ? "warning" : "danger"} />
                </td>
                <td className="px-5 py-3.5">
                  <Badge label={r.consumo === "Muy alto" ? "Muy alto" : r.consumo} variant={r.consumo === "Bajo" ? "success" : r.consumo === "Moderado" ? "warning" : "danger"} />
                </td>
                <td className="px-5 py-3.5">
                  <Badge label={r.nivel} variant={r.nivel === "Favorable" ? "success" : r.nivel === "Moderado" ? "warning" : "danger"} />
                </td>
                <td className="px-5 py-3.5 text-xs font-medium text-slate-500">{r.cambio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
