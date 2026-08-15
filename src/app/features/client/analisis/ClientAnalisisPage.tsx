import { useState } from "react";
import { Brain, AlertCircle } from "lucide-react";
import { SectionHeader, Card, Badge, ProgressBar } from "../../../components/shared";
import { FONT_HEADING, FONT_MONO } from "../../../types";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar } from "recharts";

const H = FONT_HEADING;
const MONO = FONT_MONO;

export default function ClientAnalisisPage() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(true);

  const handleRun = () => {
    setDone(false);
    setRunning(true);
    setTimeout(() => { setRunning(false); setDone(true); }, 2000);
  };

  const radarData = [
    { dim: "Proteínas", val: 40 },
    { dim: "Hidratación", val: 75 },
    { dim: "Frecuencia", val: 60 },
    { dim: "Organización", val: 50 },
    { dim: "Conocimiento", val: 25 },
    { dim: "Variedad", val: 55 },
  ];

  return (
    <div>
      <SectionHeader
        title="Mi Análisis Predictivo"
        subtitle="Resultados generados por el modelo de inteligencia artificial"
        action={
          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            <Brain size={14} />
            {running ? "Procesando..." : "Ejecutar nuevo análisis"}
          </button>
        }
      />

      {running && (
        <Card className="p-6 mb-4 border-indigo-200 bg-indigo-50/30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
            <div>
              <div className="font-semibold text-slate-800 text-sm" style={H}>Procesando análisis...</div>
              <div className="text-xs text-slate-500 mt-0.5">El modelo IA está evaluando tus datos nutricionales</div>
            </div>
            <div className="ml-auto text-xs text-indigo-600 font-medium" style={MONO}>~0.30s</div>
          </div>
          <div className="mt-4 h-1.5 bg-indigo-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full animate-pulse w-3/4" />
          </div>
        </Card>
      )}

      {done && (
        <>
          <Card className="p-5 mb-4 border-l-4 border-l-amber-400">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Resultado del análisis · 15 jun. 2026</div>
                <div className="text-xl font-bold text-slate-800 mb-2" style={H}>Perfil nutricional: Nivel Moderado</div>
                <div className="flex items-center gap-3">
                  <Badge label="Conocimiento nutricional: Bajo" variant="danger" />
                  <Badge label="Consumo de suplementos: Alto" variant="danger" />
                  <Badge label="Organización: Media" variant="warning" />
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400">Confianza del modelo</div>
                <div className="text-2xl font-bold text-indigo-600" style={H}>87.4%</div>
                <div className="text-[10px] text-slate-400">Tiempo: 0.28s</div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              {
                title: "Conocimiento Nutricional", level: "Bajo", val: 22, color: "rose",
                desc: "Tu comprensión sobre alimentación saludable y nutrición requiere mayor atención.",
                items: [],
              },
              {
                title: "Consumo de Suplementos", level: "Alto", val: 85, color: "rose",
                desc: "El consumo de suplementos está por encima de lo recomendado para tu perfil.",
                items: [],
              },
              {
                title: "Organización Alimenticia", level: "Medio", val: 55, color: "amber",
                desc: "Existe una organización parcial que puede optimizarse para mejores resultados.",
                items: [],
              },
            ].map(c => (
              <Card key={c.title} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-700 text-xs uppercase tracking-wide">{c.title}</h4>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    c.color === "rose" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                  }`}>{c.level}</span>
                </div>
                <div className="mb-3">
                  <ProgressBar value={c.val} color={c.color === "rose" ? "bg-rose-400" : "bg-amber-400"} />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0</span>
                    <span className={`font-bold ${c.color === "rose" ? "text-rose-500" : "text-amber-500"}`}>{c.val}%</span>
                    <span>100</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">{c.desc}</p>
                <ul className="space-y-1">
                  {c.items.map(it => (
                    <li key={it} className="flex items-start gap-1.5 text-[11px] text-slate-500">
                      <AlertCircle size={10} className={`mt-0.5 flex-shrink-0 ${c.color === "rose" ? "text-rose-400" : "text-amber-400"}`} />
                      {it}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5">
              <h4 className="font-semibold text-slate-800 text-sm mb-4" style={H}>Dimensiones evaluadas</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={radarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis dataKey="dim" type="category" tick={{ fontSize: 11, fill: "#64748b" }} width={85} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="val" fill="#0d9488" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
