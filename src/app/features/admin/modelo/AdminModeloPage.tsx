import { useEffect, useState } from "react";
import { Brain, CheckCircle2, Clock, Database, RefreshCw } from "lucide-react";
import { SectionHeader, Card, Badge } from "../../../components/shared";
import { FONT_HEADING } from "../../../types";
import { adminDatasetService } from "../../../services/admin-dataset.service";

export default function AdminModeloPage() {
  const [calidad, setCalidad] = useState<Record<string, unknown> | null>(null);
  const [prep, setPrep] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([adminDatasetService.calidad().catch(() => null), adminDatasetService.preparacion().catch(() => null)]);
      setCalidad(c as unknown as Record<string, unknown>);
      setPrep(p as unknown as Record<string, unknown>);
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  return (
    <div>
      <SectionHeader title="Modelo de inteligencia artificial" subtitle="Clasificador oficial: Random Forest" action={<button onClick={() => void load()} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs"><RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Actualizar</button>} />
      <Card className="mb-4 border-l-4 border-l-emerald-400 p-6">
        <div className="flex items-start gap-4">
          <Brain size={24} className="mt-1 text-emerald-600" />
          <div>
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800" style={FONT_HEADING}>Modelo final promocionable</h2>
              <Badge label="RANDOM_FOREST" variant="success" />
            </div>
            <p className="text-sm text-slate-600">Un único clasificador para ADECUADO, MEJORABLE y CRÍTICO. Las metas de kcal, macronutrientes y agua siguen calculándose mediante fórmulas nutricionales.</p>
            <p className="mt-1 text-xs text-slate-500">Solo se activa al entrenarse con exportes reales validados. Los artefactos técnicos o sintéticos no pueden promocionarse ni presentarse como modelo final.</p>
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <Database size={18} className="mb-3 text-slate-400" />
          <h3 className="mb-1 text-sm font-semibold text-slate-800" style={FONT_HEADING}>Dataset V6 — calidad</h3>
          {loading ? <p className="text-xs text-slate-500">Cargando...</p> : <DatasetSummary data={calidad} empty="Aún no hay datos reales suficientes para validar el entrenamiento." />}
        </Card>
        <Card className="p-5">
          <Clock size={18} className="mb-3 text-slate-400" />
          <h3 className="mb-1 text-sm font-semibold text-slate-800" style={FONT_HEADING}>Preparación V6</h3>
          {loading ? <p className="text-xs text-slate-500">Cargando...</p> : <DatasetSummary data={prep} empty="No hay una preparación de dataset disponible todavía." />}
        </Card>
      </div>
      <Card className="mt-4 p-5">
        <div className="flex gap-3">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
          <div>
            <h3 className="text-sm font-semibold text-slate-800" style={FONT_HEADING}>Regla de activación</h3>
            <p className="mt-1 text-sm text-slate-600">El entrenamiento se bloquea si faltan filas reales, clientes, fechas, clases, calidad mínima o una mejora verificable frente al baseline. Cuando pasa esas validaciones, el servicio de predicción carga únicamente el artefacto Random Forest promocionado.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function DatasetSummary({ data, empty }: { data: Record<string, unknown> | null; empty: string }) {
  if (!data) return <p className="text-xs text-slate-500">{empty}</p>;
  const values = Object.entries(data).filter(([, value]) => typeof value !== "object");
  if (!values.length) return <p className="text-xs text-slate-500">{empty}</p>;
  return <dl className="space-y-1.5 text-xs text-slate-600">
    {values.map(([key, value]) => <div key={key} className="flex justify-between gap-3"><dt className="capitalize">{key.replace(/([A-Z])/g, " $1")}</dt><dd className="font-semibold text-slate-800">{String(value)}</dd></div>)}
  </dl>;
}
