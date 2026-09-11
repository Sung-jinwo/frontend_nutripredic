import { useEffect, useState } from "react";
import { Brain, Clock, Database, RefreshCw } from "lucide-react";
import { SectionHeader, Card, Badge } from "../../../components/shared";
import { FONT_HEADING } from "../../../types";
import { adminDatasetService } from "../../../services/admin-dataset.service";
import { groundTruthService } from "../../../services/ground-truth.service";

export default function AdminModeloPage() {
  const [calidad, setCalidad] = useState<Record<string, unknown> | null>(null);
  const [prep, setPrep] = useState<Record<string, unknown> | null>(null);
  const [evidencia, setEvidencia] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const fechaCorte = new Date().toLocaleDateString("sv-SE");

  const load = async () => {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([adminDatasetService.calidad().catch(() => null), adminDatasetService.preparacion().catch(() => null)]);
      setCalidad(c as unknown as Record<string, unknown>);
      setPrep(p as unknown as Record<string, unknown>);
      // evidencia ejemplo cliente 554
      const ev = await groundTruthService.evidencia(554, fechaCorte).catch(() => null);
      setEvidencia(ev as unknown as Record<string, unknown>);
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  return (
    <div>
      <SectionHeader title="Modelo de inteligencia artificial" subtitle="V6 técnico — LOGISTIC_REGRESSION" action={<button onClick={() => void load()} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs"><RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Actualizar</button>} />
      <Card className="mb-4 border-l-4 border-l-emerald-400 p-6">
        <div className="flex items-start gap-4">
          <Brain size={24} className="mt-1 text-emerald-600" />
          <div>
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800" style={FONT_HEADING}>Modelo técnico de integración</h2>
              <Badge label="LOGISTIC_REGRESSION" variant="info" />
            </div>
            <p className="text-sm text-slate-600">technical-v6-integration-001 · variables-modelo-v6 · 28/28 X · SYNTHETIC_TECHNICAL · isThesisFinalModel:false</p>
            <p className="mt-1 text-xs text-slate-500">No es modelo final ni Random Forest. Entrenado con datos sintéticos técnicos.</p>
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <Database size={18} className="mb-3 text-slate-400" />
          <h3 className="mb-1 text-sm font-semibold text-slate-800" style={FONT_HEADING}>Dataset V6 — calidad</h3>
          {loading ? <p className="text-xs text-slate-500">Cargando...</p> : <pre className="max-h-40 overflow-auto rounded bg-slate-50 p-2 text-xs">{JSON.stringify(calidad, null, 2)}</pre>}
        </Card>
        <Card className="p-5">
          <Clock size={18} className="mb-3 text-slate-400" />
          <h3 className="mb-1 text-sm font-semibold text-slate-800" style={FONT_HEADING}>Preparación V6</h3>
          {loading ? <p className="text-xs text-slate-500">Cargando...</p> : <pre className="max-h-40 overflow-auto rounded bg-slate-50 p-2 text-xs">{JSON.stringify(prep, null, 2)}</pre>}
        </Card>
      </div>
      <Card className="mt-4 p-5">
        <h3 className="text-sm font-semibold text-slate-800" style={FONT_HEADING}>Ground Truth V6 — evidencia cliente 554 ({fechaCorte})</h3>
        {evidencia ? <pre className="mt-2 max-h-60 overflow-auto rounded bg-slate-50 p-2 text-xs">{JSON.stringify(evidencia, null, 2)}</pre> : <p className="mt-2 text-xs text-slate-500">Sin evidencia o cliente sin datos para fecha.</p>}
        <p className="mt-2 text-xs text-slate-500">POST /api/admin/evaluaciones-perfil/candidata-v6/clientes/{"{id}"}?fechaCorte= — backend calcula puntaje, cobertura y clasificación. Frontend no envía clasificacionReal.</p>
      </Card>
    </div>
  );
}
