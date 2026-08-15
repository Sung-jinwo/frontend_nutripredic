import { CheckCircle, Target, Database, RefreshCw, Layers, Server, Brain } from "lucide-react";
import { KPICard, SectionHeader, ProgressBar, Card } from "../../../components/shared";
import { FONT_HEADING, FONT_MONO } from "../../../types";

const H = FONT_HEADING;
const MONO = FONT_MONO;

export default function AdminModeloPage() {
  const features = [
    { nombre: "Conocimiento sobre suplementos", importancia: 92 },
    { nombre: "Frecuencia de consumo", importancia: 87 },
    { nombre: "Tipo de alimentación", importancia: 81 },
    { nombre: "Consumo de proteínas", importancia: 76 },
    { nombre: "Número de comidas diarias", importancia: 71 },
    { nombre: "Organización alimenticia", importancia: 65 },
    { nombre: "Consumo de agua", importancia: 58 },
    { nombre: "Edad", importancia: 44 },
    { nombre: "IMC (Peso / Altura²)", importancia: 39 },
    { nombre: "Objetivo físico", importancia: 31 },
  ];

  return (
    <div>
      <SectionHeader
        title="Modelo de inteligencia artificial"
        subtitle="Estado técnico y rendimiento del modelo predictivo"
      />

      {/* Status cards */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <div className="bg-emerald-500 rounded-xl p-4 text-white">
          <CheckCircle size={16} className="mb-2 text-emerald-200" />
          <div className="font-bold text-sm" style={H}>Modelo activo</div>
          <div className="text-emerald-200/80 text-xs mt-0.5">En producción</div>
        </div>
        <KPICard icon={Target} title="Precisión del modelo" value="87.4%" sub="Validación cruzada k=5" iconBg="bg-teal-500" />
        <KPICard icon={Database} title="Datos de entrenamiento" value="248" sub="Registros etiquetados" iconBg="bg-indigo-500" />
        <KPICard icon={RefreshCw} title="Última actualización" value="15 jun." sub="Reentrenamiento mensual" iconBg="bg-amber-500" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Model info */}
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-4" style={H}>Configuración del modelo</h3>
          <div className="space-y-3">
            {[
              { label: "Algoritmo", val: "Random Forest Classifier", badge: true },
              { label: "Biblioteca", val: "Scikit-learn 1.4.0" },
              { label: "Variables de entrada", val: "10 características" },
              { label: "Variable objetivo", val: "Nivel nutricional (3 clases)" },
              { label: "Muestras entrenamiento", val: "198 (80%)" },
              { label: "Muestras validación", val: "50 (20%)" },
              { label: "Profundidad máxima", val: "8 niveles" },
              { label: "N° estimadores", val: "100 árboles" },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-xs text-slate-500">{r.label}</span>
                <span className="text-xs font-semibold text-slate-700" style={MONO}>{r.val}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Feature importance */}
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-4" style={H}>Importancia de variables</h3>
          <div className="space-y-2.5">
            {features.map(f => (
              <div key={f.nombre}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-600 truncate">{f.nombre}</span>
                  <span className="text-[11px] font-bold text-slate-700 ml-2 flex-shrink-0" style={MONO}>{f.importancia}%</span>
                </div>
                <ProgressBar value={f.importancia} color="bg-indigo-400" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tech stack */}
      <Card className="p-5">
        <h3 className="font-semibold text-slate-800 text-sm mb-4" style={H}>Arquitectura tecnológica</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Layers, label: "Frontend", tech: "React 18", ver: "TypeScript · Tailwind CSS", color: "bg-sky-50 border-sky-100 text-sky-600" },
            { icon: Server, label: "Backend", tech: "Spring Boot 3.2", ver: "Java 17 · REST API", color: "bg-emerald-50 border-emerald-100 text-emerald-600" },
            { icon: Database, label: "Base de datos", tech: "PostgreSQL 16", ver: "JPA / Hibernate", color: "bg-indigo-50 border-indigo-100 text-indigo-600" },
            { icon: Brain, label: "Modelo IA", tech: "Python 3.11", ver: "Scikit-learn · Pandas", color: "bg-amber-50 border-amber-100 text-amber-600" },
          ].map(t => (
            <div key={t.label} className={`p-4 rounded-xl border ${t.color}`}>
              <t.icon size={18} className="mb-2" />
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">{t.label}</div>
              <div className="font-bold text-sm text-slate-800" style={H}>{t.tech}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{t.ver}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-[#0a1628] rounded-xl">
          <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" /> Modelo en ejecución
          </div>
          <div className="text-slate-300 text-xs" style={MONO}>
            {">"} modelo.predict([conocimiento, consumo, comidas, agua, proteinas, ...])<br />
            {">"} Output: {'{ nivel: "Moderado", confianza: 0.874, tiempo: 0.28s }'}
          </div>
        </div>
      </Card>
    </div>
  );
}
