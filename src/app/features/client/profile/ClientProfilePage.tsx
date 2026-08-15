import { Edit2 } from "lucide-react";
import { Badge, SectionHeader, Card } from "../../../components/shared";
import { FONT_HEADING, FONT_MONO } from "../../../types";

const H = FONT_HEADING;
const MONO = FONT_MONO;

export default function ClientProfilePage() {
  return (
    <div>
      <SectionHeader
        title="Mi Perfil"
        subtitle="Información personal y datos del registro"
        action={
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-semibold hover:bg-slate-50">
            <Edit2 size={13} /> Editar perfil
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-5">
        <Card className="col-span-1 p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4">
            AR
          </div>
          <h3 className="font-semibold text-slate-800 text-lg mb-0.5" style={H}>Ana María Rodríguez</h3>
          <p className="text-sm text-slate-500 mb-4">ana.rodriguez@email.com</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge label="Activo" variant="success" />
            <Badge label="Cliente" variant="info" />
          </div>
        </Card>

        <Card className="col-span-2 p-6">
          <h4 className="font-semibold text-slate-800 text-sm mb-5" style={H}>Datos personales</h4>
          <div className="grid grid-cols-2 gap-x-10 gap-y-5">
            {[
              ["Edad", "24 años"],
              ["Género", "Femenino"],
              ["Peso", "62 kg"],
              ["Altura", "1.65 m"],
              ["Nivel de actividad", "Moderado (3-5 días/sem)"],
              ["Objetivo", "Mantener peso y tonificar"],
              ["Miembro desde", "Enero 2025"],
              ["Última evaluación", "15 / Jun / 2025"],
            ].map(([label, val]) => (
              <div key={label} className="flex items-center justify-between border-b border-slate-50 pb-3">
                <span className="text-xs text-slate-500 font-medium">{label}</span>
                <span className="text-sm text-slate-800 font-medium" style={MONO}>{val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h4 className="font-semibold text-slate-800 text-sm mb-4" style={H}>Resumen predictivo actual</h4>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Conocimiento nutricional", val: "Medio", color: "amber", pct: 55 },
            { label: "Consumo de suplementos", val: "Alto", color: "rose", pct: 85 },
            { label: "Organización alimenticia", val: "Media", color: "amber", pct: 55 },
            { label: "Nivel general", val: "Moderado", color: "amber", pct: 55 },
          ].map(s => (
            <div key={s.label} className="text-center p-4 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{s.label}</div>
              <div className={`text-2xl font-bold mb-1 ${
                s.color === "emerald" ? "text-emerald-600" : s.color === "amber" ? "text-amber-600" : "text-rose-600"
              }`} style={H}>
                {s.val}
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1">
                <div
                  className={`h-1 rounded-full ${
                    s.color === "emerald" ? "bg-emerald-400" : s.color === "amber" ? "bg-amber-400" : "bg-rose-400"
                  }`}
                  style={{ width: `${s.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
