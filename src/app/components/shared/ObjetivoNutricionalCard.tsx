import { useEffect, useState } from "react";
import { Flame, Drumstick, Wheat, Droplets } from "lucide-react";
import { Card } from "./index";
import { FONT_HEADING } from "../../types";
import { objetivoNutricionalService, type ObjetivoNutricionalResponse } from "../../services/objetivo-nutricional.service";
import { planDiarioService } from "../../services/plan-diario.service";

type Props = {
  clienteId?: number;
  objetivoFisicoFallback?: string | null;
  compact?: boolean;
  onReady?: (data: ObjetivoNutricionalResponse | null) => void;
};

function fmt(n: number | null | undefined) {
  if (n == null || isNaN(Number(n))) return "—";
  return Number(n).toLocaleString("es-PE");
}

export function ObjetivoNutricionalCard({ clienteId, objetivoFisicoFallback, compact }: Props) {
  const [data, setData] = useState<ObjetivoNutricionalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!clienteId) {
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setError("");
    const fecha = new Date().toLocaleDateString("sv-SE");
    planDiarioService
      .inicializar(clienteId, fecha)
      .then(() => objetivoNutricionalService.obtener(clienteId, fecha))
      .then((res) => {
        if (!alive) return;
        setData(res);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "No se pudo consultar el objetivo nutricional.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [clienteId]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 rounded bg-slate-100" />
          <div className="h-6 w-48 rounded bg-slate-100" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-50" />
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">Calculando tu objetivo nutricional…</p>
      </Card>
    );
  }

  if (!data) {
    if (compact) return null;
    return (
      <Card className="p-6 text-center">
        <h3 className="text-sm font-semibold text-slate-800" style={FONT_HEADING}>
          Objetivo nutricional en preparación
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          No se encontró un plan nutricional para hoy. Revisa que el servicio predictivo esté disponible.
        </p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-sm font-semibold text-rose-700">No se pudo cargar el objetivo nutricional</p>
        <p className="mt-1 text-xs text-slate-500">{error}</p>
        <p className="mt-2 text-xs text-slate-400">El cálculo lo realiza el backend. Inténtalo más tarde.</p>
      </Card>
    );
  }

  if (data.estado !== "DISPONIBLE" || (data.metaKcal == null && data.proteinas == null)) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-sm font-semibold text-slate-800" style={FONT_HEADING}>
          Tu objetivo nutricional
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Objetivo: <span className="font-medium text-slate-700">{data.objetivoFisico ?? objetivoFisicoFallback ?? "No disponible"}</span>
        </p>
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Objetivo no disponible aún</p>
          <p className="mt-1 text-xs leading-5 text-amber-700">{data.motivo || "El sistema aún no ha calculado tu meta diaria. Completa tu perfil y vuelve a consultar."}</p>
        </div>
      </Card>
    );
  }

  const objetivoLabel = data.objetivoFisico ?? objetivoFisicoFallback ?? "—";

  return (
    <Card className="p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#397065]">Tu objetivo nutricional</p>
      <h3 className="mt-1 text-lg font-semibold text-slate-900" style={FONT_HEADING}>
        {objetivoLabel}
      </h3>
      <p className="mt-1 text-xs text-slate-500">Meta diaria calculada por el sistema a partir de tu perfil.</p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white">
            <Flame size={16} />
          </div>
          <p className="text-xs font-medium text-amber-800/80">Meta energética diaria</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {fmt(data.metaKcal)} <span className="text-sm font-medium text-slate-600">kcal</span>
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500 text-white">
            <Drumstick size={16} />
          </div>
          <p className="text-xs font-medium text-rose-800/80">Proteínas</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {fmt(data.proteinas)} <span className="text-sm font-medium text-slate-600">g</span>
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white">
            <Wheat size={16} />
          </div>
          <p className="text-xs font-medium text-amber-800/80">Carbohidratos</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {fmt(data.carbohidratos)} <span className="text-sm font-medium text-slate-600">g</span>
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-600 text-white">
            <Droplets size={16} />
          </div>
          <p className="text-xs font-medium text-slate-600">Grasas</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {fmt(data.grasas)} <span className="text-sm font-medium text-slate-600">g</span>
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-400">
        Valores oficiales del backend. No se calculan en frontend.
        {data.calculadoEn && <> · Calculado el {new Date(data.calculadoEn).toLocaleDateString("es-PE")}</>}
      </p>
    </Card>
  );
}

// Variante específica para el onboarding: si no hay dato, muestra "Perfil completado"
export function ObjetivoOnboardingResult({ clienteId, objetivoFisico }: { clienteId?: number; objetivoFisico?: string | null }) {
  const [data, setData] = useState<ObjetivoNutricionalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!clienteId) {
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    const fecha = new Date().toLocaleDateString("sv-SE");
    planDiarioService
      .inicializar(clienteId, fecha)
      .then(() => objetivoNutricionalService.obtener(clienteId, fecha))
      .then((r) => alive && setData(r))
      .catch((e) => alive && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [clienteId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-slate-100" />
        <div className="mx-auto h-4 w-40 animate-pulse rounded bg-slate-100" />
        <div className="h-20 animate-pulse rounded-xl bg-slate-50" />
        <p className="text-center text-xs text-slate-400">Calculando tu objetivo…</p>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <h2 className="text-2xl font-semibold text-slate-900" style={FONT_HEADING}>
          Perfil completado
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Tu perfil se guardó, pero no pudimos consultar el objetivo.</p>
        <p className="mt-2 text-xs text-rose-600">{error}</p>
      </>
    );
  }

  if (!data || data.estado !== "DISPONIBLE" || data.metaKcal == null) {
    return (
      <>
        <h2 className="text-2xl font-semibold text-slate-900" style={FONT_HEADING}>
          Perfil completado
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Ya tenemos la información básica necesaria para personalizar tu experiencia.</p>
        {data?.motivo && <p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-700">{data.motivo}</p>}
      </>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-semibold text-slate-900" style={FONT_HEADING}>
        Tu objetivo nutricional
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Objetivo: <span className="font-medium text-slate-700">{data.objetivoFisico ?? objetivoFisico ?? "—"}</span>
      </p>
      <div className="mt-5 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
        <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-4">
          <p className="text-xs text-amber-800/80">Meta energética diaria</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {fmt(data.metaKcal)} <span className="text-xs font-medium text-slate-600">kcal</span>
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Proteínas</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {fmt(data.proteinas)} <span className="text-xs font-medium text-slate-600">g</span>
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Carbohidratos</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {fmt(data.carbohidratos)} <span className="text-xs font-medium text-slate-600">g</span>
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Grasas</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {fmt(data.grasas)} <span className="text-xs font-medium text-slate-600">g</span>
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-400">Valores oficiales del backend. Calculado el {data.calculadoEn ? new Date(data.calculadoEn).toLocaleDateString("es-PE") : "—"}.</p>
    </>
  );
}
