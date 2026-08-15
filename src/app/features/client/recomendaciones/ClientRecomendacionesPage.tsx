import { BookOpen, Pill, Utensils, Droplets, TrendingUp, CheckCircle } from "lucide-react";
import { SectionHeader, Card, Badge } from "../../../components/shared";
import { FONT_HEADING } from "../../../types";

const H = FONT_HEADING;

export default function ClientRecomendacionesPage() {
  const recs = [
    {
      cat: "Educación nutricional", icon: BookOpen, color: "indigo", priority: "Alta",
      title: "Aprender fundamentos de macronutrientes",
      desc: "Comprender proteínas, carbohidratos y grasas te permitirá tomar mejores decisiones alimenticias y utilizar suplementos de forma más eficiente.",
      steps: ["Identificar fuentes proteicas naturales", "Calcular requerimiento calórico diario", "Distinguir entre carbohidratos simples y complejos"],
    },
    {
      cat: "Gestión de suplementos", icon: Pill, color: "rose", priority: "Alta",
      title: "Revisar y reducir la suplementación actual",
      desc: "Cuatro suplementos simultáneos representan un consumo elevado. Se recomienda evaluar con un asesor cuáles son realmente necesarios.",
      steps: ["Consultar a un nutricionista deportivo", "Priorizar proteína y creatina si entrenas", "Eliminar pre-entrenamientos en días de descanso"],
    },
    {
      cat: "Hábitos alimenticios", icon: Utensils, color: "teal", priority: "Media",
      title: "Estructurar un plan de comidas semanal",
      desc: "Establecer horarios regulares de comida mejora el metabolismo, la energía y la adherencia a los objetivos físicos.",
      steps: ["Definir 5 comidas al día", "Preparar comidas con anticipación", "Establecer ventana de alimentación consistente"],
    },
    {
      cat: "Hidratación", icon: Droplets, color: "sky", priority: "Media",
      title: "Mantener y optimizar la hidratación",
      desc: "Tu consumo actual de agua es adecuado. Continúa con este hábito y ajusta el consumo en días de entrenamiento intenso.",
      steps: ["Mantener 2L diarios como mínimo", "Aumentar a 3L en días de entrenamiento", "Electrolitos post-entrenamiento intenso"],
    },
    {
      cat: "Seguimiento", icon: TrendingUp, color: "emerald", priority: "Baja",
      title: "Realizar análisis mensualmente",
      desc: "La constancia en el registro y análisis de hábitos permite visualizar la evolución y ajustar estrategias a tiempo.",
      steps: ["Actualizar hábitos cada 15 días", "Ejecutar análisis predictivo mensual", "Comparar resultados con períodos anteriores"],
    },
  ];

  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-600",
    rose: "bg-rose-50 border-rose-100 text-rose-600",
    teal: "bg-teal-50 border-teal-100 text-teal-600",
    sky: "bg-sky-50 border-sky-100 text-sky-600",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
  };

  return (
    <div>
      <SectionHeader
        title="Recomendaciones"
        subtitle="Sugerencias generadas a partir de tu último análisis predictivo"
      />
      <div className="space-y-3">
        {recs.map((r, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl ${colorMap[r.color]} border flex items-center justify-center flex-shrink-0`}>
                <r.icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.cat}</span>
                  <Badge label={`Prioridad ${r.priority}`} variant={r.priority === "Alta" ? "danger" : r.priority === "Media" ? "warning" : "neutral"} />
                </div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1" style={H}>{r.title}</h3>
                <p className="text-xs text-slate-500 mb-3">{r.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {r.steps.map((s, j) => (
                    <div key={j} className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                      <CheckCircle size={10} className="text-teal-500 flex-shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-200" style={H}>0{i + 1}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
