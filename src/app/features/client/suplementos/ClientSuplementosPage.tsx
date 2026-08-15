import { useState } from "react";
import { Plus, X, Pill, Activity, Clock, AlertCircle, Edit2 } from "lucide-react";
import { Badge, StateBadge, KPICard, SectionHeader, Card } from "../../../components/shared";
import { FONT_HEADING, FONT_MONO } from "../../../types";
import { suplementosRegistrados } from "../../../data/mock-data";

const H = FONT_HEADING;
const MONO = FONT_MONO;

export default function ClientSuplementosPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <SectionHeader
        title="Consumo de Suplementos"
        subtitle="Registra y gestiona los suplementos que consumes actualmente"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
          >
            <Plus size={14} /> Agregar suplemento
          </button>
        }
      />

      {showForm && (
        <Card className="p-5 mb-4 border-teal-200 bg-teal-50/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 text-sm" style={H}>Nuevo registro de suplemento</h3>
            <button onClick={() => setShowForm(false)}><X size={16} className="text-slate-400 hover:text-slate-600" /></button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Tipo de suplemento", placeholder: "Proteína Whey, Creatina..." },
              { label: "Frecuencia de consumo", placeholder: "Diaria, 3x semana..." },
              { label: "Cantidad / Dosis", placeholder: "30g, 1 cápsula..." },
              { label: "Tiempo de uso", placeholder: "2 meses, 1 año..." },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{f.label}</label>
                <input
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 text-xs"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-teal-600 rounded-lg text-sm text-white font-semibold hover:bg-teal-700">Guardar</button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { icon: Pill, label: "Suplementos activos", val: "4", iconBg: "bg-teal-500" },
          { icon: Activity, label: "Consumo semanal", val: "Alto", iconBg: "bg-rose-500" },
          { icon: Clock, label: "Tiempo promedio uso", val: "7.2 meses", iconBg: "bg-indigo-500" },
          { icon: AlertCircle, label: "Posibles interacciones", val: "1", iconBg: "bg-amber-500" },
        ].map(s => (
          <KPICard key={s.label} icon={s.icon} title={s.label} value={s.val} iconBg={s.iconBg} />
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 text-sm" style={H}>Historial de consumo</h3>
          <Badge label="4 registros activos" variant="info" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                {["Suplemento", "Frecuencia", "Cantidad / Dosis", "Tiempo de uso", "Estado", "Acciones"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {suplementosRegistrados.map((s, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Pill size={13} className="text-indigo-500" />
                      </div>
                      <span className="text-sm font-medium text-slate-800">{s.nombre}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{s.frecuencia}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600 font-mono" style={MONO}>{s.cantidad}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{s.tiempoUso}</td>
                  <td className="px-5 py-3.5"><StateBadge estado={s.estado} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><Edit2 size={13} /></button>
                      <button className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"><X size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
