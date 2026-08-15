import { Users, Clock, TrendingUp, FileText, Download, Utensils, Pill } from "lucide-react";
import { SectionHeader, Card } from "../../../components/shared";
import { FONT_HEADING } from "../../../types";

const H = FONT_HEADING;

export default function AdminReportesPage() {
  const reports = [
    { icon: Users, title: "Reporte general de clientes", desc: "Lista completa con estado nutricional y resultados predictivos", last: "15/06/2026", color: "teal" },
    { icon: Utensils, title: "Análisis de conocimiento nutricional", desc: "Distribución por niveles, tendencias y comparativas mensuales", last: "15/06/2026", color: "indigo" },
    { icon: Pill, title: "Análisis de consumo de suplementos", desc: "Clasificación por tipo, frecuencia y nivel de consumo", last: "15/06/2026", color: "rose" },
    { icon: Clock, title: "Rendimiento del modelo IA", desc: "Tiempos de predicción, precisión y estadísticas de uso", last: "26/06/2026", color: "amber" },
    { icon: TrendingUp, title: "Evolución histórica 2026", desc: "Comparativa semestral de indicadores clave", last: "01/06/2026", color: "emerald" },
    { icon: FileText, title: "Reporte ejecutivo mensual", desc: "Resumen consolidado para presentación a directivos", last: "01/06/2026", color: "purple" },
  ];

  const colorMap: Record<string, string> = {
    teal: "bg-teal-50 border-teal-100 text-teal-600",
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-600",
    rose: "bg-rose-50 border-rose-100 text-rose-600",
    amber: "bg-amber-50 border-amber-100 text-amber-600",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
    purple: "bg-purple-50 border-purple-100 text-purple-600",
  };

  return (
    <div>
      <SectionHeader
        title="Reportes del sistema"
        subtitle="Generación y exportación de informes analíticos"
      />
      <div className="grid grid-cols-2 gap-4">
        {reports.map((r, i) => (
          <Card key={i} className="p-5 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl ${colorMap[r.color]} border flex items-center justify-center flex-shrink-0`}>
                <r.icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 text-sm" style={H}>{r.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5 mb-3">{r.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Última generación: {r.last}</span>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex items-center gap-1 px-2.5 py-1 bg-teal-600 text-white text-[11px] font-medium rounded-lg hover:bg-teal-700">
                      <Download size={11} /> PDF
                    </button>
                    <button className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 text-white text-[11px] font-medium rounded-lg hover:bg-indigo-700">
                      <Download size={11} /> Excel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
