import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Droplets, Edit2, Plus, Trash2, Utensils, Apple, Cookie, CupSoda, Pill, Wheat, X, Flame, Clock3, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, SectionHeader, ProgressBar, AppModal, ConfirmModal } from "../../../components/shared";
import { useAuth } from "../../../context/AuthContext";
import { alimentacionService, type AlimentoCatalogoResponse, type AlimentoUsoResponse, type MomentoComida, type RegistroAlimentoResponse } from "../../../services/alimentacion.service";
import { habitosService, type HabitoResponse } from "../../../services/habitos.service";
import { suplementosService, type RegistroConsumoSuplementoResponse, type SuplementoClienteResponse } from "../../../services/suplementos.service";
import { unidadesService, type UnidadMedidaResponse } from "../../../services/unidades.service";
import { resumenDiarioService, type ResumenDiarioResponse } from "../../../services/resumen-diario.service";
import { FONT_HEADING } from "../../../types";

type WizardType = "ALIMENTO" | "SUPLEMENTO" | "AGUA" | null;

const today = () => new Date().toLocaleDateString("en-CA");
const fmtDateLong = (iso: string) => {
  try { return new Date(`${iso}T00:00:00`).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" }); } catch { return iso; }
};
const errorMessage = (e: unknown) => (e instanceof Error ? e.message : "No se pudo completar la operación.");
const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-[#397065] focus:ring-2 focus:ring-emerald-100";
const moments: Array<{ value: MomentoComida; label: string }> = [
  { value: "DESAYUNO", label: "Desayuno" },
  { value: "MEDIA_MANANA", label: "Media mañana" },
  { value: "ALMUERZO", label: "Almuerzo" },
  { value: "MERIENDA", label: "Merienda" },
  { value: "CENA", label: "Cena" },
  { value: "OTRO", label: "Otro" },
];

function getCatalogMacros(c: AlimentoCatalogoResponse | null | undefined) {
  if (!c) return null;
  const kcal = c.kcal;
  const prot = c.proteinaG;
  const carb = c.carbohidratosG;
  const grasa = c.grasasG;
  const fibra = c.fibraG;
  if (kcal == null && prot == null && carb == null && grasa == null) return null;
  return { kcal, prot, carb, grasa, fibra, cantidadReferencia: c.cantidadReferencia, unidadReferencia: c.unidadReferencia };
}
function getRegistroMacros(r: RegistroAlimentoResponse) {
  const kcal = r.kcal ?? null;
  const prot = r.proteinaG ?? null;
  const carb = r.carbohidratosG ?? null;
  const grasa = r.grasasG ?? null;
  if (kcal == null && prot == null && carb == null && grasa == null) return null;
  return { kcal, prot, carb, grasa };
}
function previewProporcional(macros: ReturnType<typeof getCatalogMacros>, cantidad: number, unidad: string) {
  if (!macros || !cantidad || isNaN(cantidad) || !macros.cantidadReferencia || macros.unidadReferencia !== unidad) return null;
  const factor = cantidad / macros.cantidadReferencia;
  return {
    kcal: macros.kcal != null ? Math.round(macros.kcal * factor) : null,
    prot: macros.prot != null ? +(macros.prot * factor).toFixed(1) : null,
    carb: macros.carb != null ? +(macros.carb * factor).toFixed(1) : null,
    grasa: macros.grasa != null ? +(macros.grasa * factor).toFixed(1) : null,
    fibra: macros.fibra != null ? +(macros.fibra * factor).toFixed(1) : null,
  };
}

function previewSuplemento(
  supplement: SuplementoClienteResponse | null,
  amountPerTake: number,
  unit: string,
  takes: number,
) {
  const serving = supplement?.cantidadPorToma;
  const servingUnit = supplement?.unidadCodigo ?? supplement?.unidad;
  if (!supplement || !serving || serving <= 0 || servingUnit !== unit || amountPerTake <= 0 || takes <= 0) return null;
  const factor = (amountPerTake / serving) * takes;
  const scaled = (value: number | null) => value == null ? null : +(value * factor).toFixed(2);
  return {
    totalProduct: +(amountPerTake * takes).toFixed(2),
    servings: +factor.toFixed(2),
    protein: scaled(supplement.proteinaGPorToma),
    carbs: scaled(supplement.carbohidratosGPorToma),
    fat: scaled(supplement.grasasGPorToma),
    creatine: scaled(supplement.creatinaGPorToma),
    caffeine: scaled(supplement.cafeinaMgPorToma),
    sodium: scaled(supplement.sodioMgPorToma),
  };
}
function formatHora(iso?: string | null) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
  } catch { return null; }
}

export default function ClientHabitosPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(today());
  const [records, setRecords] = useState<HabitoResponse[]>([]);
  const [foodCatalog, setFoodCatalog] = useState<AlimentoCatalogoResponse[]>([]);
  const [recent, setRecent] = useState<AlimentoUsoResponse[]>([]);
  const [frequent, setFrequent] = useState<AlimentoUsoResponse[]>([]);
  const [units, setUnits] = useState<UnidadMedidaResponse[]>([]);
  const [habituals, setHabituals] = useState<SuplementoClienteResponse[]>([]);
  const [resumen, setResumen] = useState<ResumenDiarioResponse | null>(null);
  const [resumenLoading, setResumenLoading] = useState(true);
  const [resumenError, setResumenError] = useState("");
  const [alimentosHoy, setAlimentosHoy] = useState<RegistroAlimentoResponse[]>([]);
  const [consumosHoy, setConsumosHoy] = useState<RegistroConsumoSuplementoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardType, setWizardType] = useState<WizardType>(null);
  const [foodSearch, setFoodSearch] = useState("");
  const [foodSelection, setFoodSelection] = useState("");
  const [foodAmount, setFoodAmount] = useState("");
  const [foodUnit, setFoodUnit] = useState("");
  const [foodMoment, setFoodMoment] = useState<MomentoComida>("ALMUERZO");
  const [foodProtein, setFoodProtein] = useState("");
  const [foodCarbs, setFoodCarbs] = useState("");
  const [foodFat, setFoodFat] = useState("");
  const [supplementSelection, setSupplementSelection] = useState("");
  const [consumptionAmount, setConsumptionAmount] = useState("");
  const [consumptionUnit, setConsumptionUnit] = useState("");
  const [consumptionTakes, setConsumptionTakes] = useState("1");
  const [waterAmount, setWaterAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [editFood, setEditFood] = useState<RegistroAlimentoResponse | null>(null);
  const [editConsumo, setEditConsumo] = useState<RegistroConsumoSuplementoResponse | null>(null);
  const [detailFood, setDetailFood] = useState<RegistroAlimentoResponse | null>(null);
  const [confirmDeleteFood, setConfirmDeleteFood] = useState<RegistroAlimentoResponse | null>(null);
  const [confirmDeleteSup, setConfirmDeleteSup] = useState<RegistroConsumoSuplementoResponse | null>(null);

  const todayHabit = useMemo(() => records.find((r) => r.fecha === selectedDate) ?? null, [records, selectedDate]);
  const selectedHabitual = useMemo(() => habituals.find((item) => String(item.id) === supplementSelection) ?? null, [habituals, supplementSelection]);
  const supplementPreview = useMemo(
    () => previewSuplemento(selectedHabitual, Number(consumptionAmount), consumptionUnit, Number(consumptionTakes)),
    [selectedHabitual, consumptionAmount, consumptionUnit, consumptionTakes],
  );

  const refreshResumen = useCallback(async (fecha: string) => {
    if (!user?.clienteId) return;
    setResumenLoading(true);
    setResumenError("");
    try {
      const r = await resumenDiarioService.get(user.clienteId, fecha);
      setResumen(r);
    } catch (e) {
      setResumen(null);
      setResumenError(e instanceof Error ? e.message : String(e));
    } finally {
      setResumenLoading(false);
    }
  }, [user?.clienteId]);

  const refreshDayDetails = useCallback(async () => {
    if (!todayHabit) { setAlimentosHoy([]); setConsumosHoy([]); return; }
    try {
      const [foods, cons] = await Promise.all([alimentacionService.listByHabit(todayHabit.id), suplementosService.dailyConsumptions(todayHabit.id)]);
      // Ordenar por hora si existe creadoEn/hora, sino por id
      const sortedFoods = [...foods].sort((a: any, b: any) => {
        const ha = a.creadoEn ?? a.hora ?? a.id;
        const hb = b.creadoEn ?? b.hora ?? b.id;
        if (typeof ha === "string" && typeof hb === "string") return ha.localeCompare(hb);
        return (a.id ?? 0) - (b.id ?? 0);
      });
      setAlimentosHoy(sortedFoods);
      setConsumosHoy(cons);
    } catch {
      setAlimentosHoy([]); setConsumosHoy([]);
    }
  }, [todayHabit]);

  const load = useCallback(async () => {
    if (!user?.clienteId) { setError("No se encontró el perfil de cliente."); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const [habits, catalog, recentItems, frequentItems, unitItems] = await Promise.all([
        habitosService.listByCliente(user.clienteId),
        alimentacionService.catalog(),
        alimentacionService.recent(user.clienteId),
        alimentacionService.frequent(user.clienteId),
        unidadesService.list(),
      ]);
      setRecords(habits);
      setFoodCatalog(catalog.filter((i) => i.activo));
      setRecent(recentItems);
      setFrequent(frequentItems);
      setUnits(unitItems);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally { setLoading(false); }
  }, [user?.clienteId]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { void refreshResumen(selectedDate); }, [selectedDate, refreshResumen]);
  useEffect(() => { void refreshDayDetails(); }, [refreshDayDetails]);
  useEffect(() => {
    if (!user?.clienteId || !todayHabit) { setHabituals([]); return; }
    void suplementosService.habituals(user.clienteId, todayHabit.fecha).then(setHabituals).catch(() => setHabituals([]));
  }, [todayHabit, user?.clienteId]);

  const selectedFood = foodCatalog.find((i) => i.id === Number(foodSelection));
  const selectedFoodMacros = getCatalogMacros(selectedFood);

  const ensureHabit = async (): Promise<HabitoResponse> => {
    if (todayHabit) return todayHabit;
    if (!user?.clienteId) throw new Error("Sin cliente");
    const habit = await habitosService.create({
      clienteId: user.clienteId,
      fecha: selectedDate,
      cantidadComidas: null,
      consumoAgua: null,
      proteinas: null,
      tipoAlimentacion: null,
      nivelOrganizacion: null,
      desayuno: null,
    });
    setRecords((prev) => [...prev, habit].sort((a, b) => a.fecha.localeCompare(b.fecha)));
    return habit;
  };

  const handleAddFood = async () => {
    if (!foodSearch.trim() || Number(foodAmount) <= 0 || !foodUnit || [foodProtein, foodCarbs, foodFat].some((value) => value === "" || Number(value) < 0)) return;
    setSaving(true); setError("");
    try {
      const habit = await ensureHabit();
      if (editFood) {
        await alimentacionService.updateInHabit(habit.id, editFood.id, { alimentoId: selectedFood?.id ?? null, nombreAlimento: foodSearch.trim(), cantidad: Number(foodAmount), unidadCodigo: foodUnit, momentoComida: foodMoment, proteinaG: Number(foodProtein), carbohidratosG: Number(foodCarbs), grasasG: Number(foodFat) });
      } else {
        await alimentacionService.addToHabit(habit.id, { alimentoId: selectedFood?.id ?? null, nombreAlimento: foodSearch.trim(), cantidad: Number(foodAmount), unidadCodigo: foodUnit, momentoComida: foodMoment, proteinaG: Number(foodProtein), carbohidratosG: Number(foodCarbs), grasasG: Number(foodFat) });
      }
      setWizardOpen(false); setWizardType(null); setEditFood(null);
      setFoodSearch(""); setFoodSelection(""); setFoodAmount(""); setFoodUnit("");
      // SSOT: refrescar resumen-diario
      await Promise.all([refreshDayDetails(), refreshResumen(selectedDate), load()]);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally { setSaving(false); }
  };

  const handleAddSuplemento = async () => {
    if (!selectedHabitual || Number(consumptionAmount) <= 0 || !consumptionUnit) return;
    setSaving(true); setError("");
    try {
      const habit = await ensureHabit();
      if (editConsumo) {
        await suplementosService.updateDailyConsumption(habit.id, editConsumo.id, { suplementoClienteId: selectedHabitual.id, cantidadConsumida: Number(consumptionAmount), unidadCodigo: consumptionUnit, numeroTomas: Number(consumptionTakes) || 1, observacion: null });
      } else {
        await suplementosService.createDailyConsumption(habit.id, { suplementoClienteId: selectedHabitual.id, cantidadConsumida: Number(consumptionAmount), unidadCodigo: consumptionUnit, numeroTomas: Number(consumptionTakes) || 1, observacion: null });
      }
      setWizardOpen(false); setWizardType(null); setEditConsumo(null);
      await Promise.all([refreshDayDetails(), refreshResumen(selectedDate), load()]);
    } catch (cause) { setError(errorMessage(cause)); } finally { setSaving(false); }
  };

  const handleAddWater = async () => {
    const ml = Number(waterAmount);
    if (!ml || ml <= 0) return;
    setSaving(true); setError("");
    try {
      const habit = await ensureHabit();
      const litros = ml / 1000;
      await habitosService.update(habit.id, {
        fecha: habit.fecha, cantidadComidas: habit.cantidadComidas, consumoAgua: Number(((habit.consumoAgua ?? 0) + litros).toFixed(2)),
        proteinas: habit.proteinas, tipoAlimentacion: habit.tipoAlimentacion, nivelOrganizacion: habit.nivelOrganizacion,
        desayuno: habit.desayuno, snacks: habit.snacks, alimentos: habit.alimentos, comidasCocinadas: habit.comidasCocinadas,
        restricciones: habit.restricciones, consumeSuplementos: habit.consumeSuplementos,
      });
      setWizardOpen(false); setWizardType(null); setWaterAmount("");
      await Promise.all([load(), refreshResumen(selectedDate), refreshDayDetails()]);
    } catch (cause) { setError(errorMessage(cause)); } finally { setSaving(false); }
  };

  const handleDeleteFoodConfirmed = async () => {
    if (!todayHabit || !confirmDeleteFood) return;
    try { await alimentacionService.removeFromHabit(todayHabit.id, confirmDeleteFood.id); setConfirmDeleteFood(null); await Promise.all([refreshDayDetails(), refreshResumen(selectedDate)]); } catch (cause) { setError(errorMessage(cause)); }
  };
  const handleDeleteSupConfirmed = async () => {
    if (!todayHabit || !confirmDeleteSup) return;
    try { await suplementosService.deleteDailyConsumption(todayHabit.id, confirmDeleteSup.id); setConfirmDeleteSup(null); await Promise.all([refreshDayDetails(), refreshResumen(selectedDate)]); } catch (cause) { setError(errorMessage(cause)); }
  };

  const openWizard = (type: WizardType) => {
    setWizardType(type); setWizardOpen(true); setError("");
    setFoodSearch(""); setFoodSelection(""); setFoodAmount(""); setFoodUnit(""); setFoodMoment("ALMUERZO");
    setFoodProtein(""); setFoodCarbs(""); setFoodFat("");
    setSupplementSelection(""); setConsumptionAmount(""); setConsumptionUnit(""); setWaterAmount("");
    setEditFood(null); setEditConsumo(null);
    if (type === "SUPLEMENTO" && user?.clienteId && todayHabit) { void suplementosService.habituals(user.clienteId, todayHabit.fecha).then(setHabituals).catch(() => {}); }
  };

  const quickWaterMl = 250;
  const aguaHoyMl = resumen?.agua.consumidoMl ?? Math.round((todayHabit?.consumoAgua ?? 0) * 1000);
  const totalRegistrosHoy = alimentosHoy.length + consumosHoy.length + (aguaHoyMl > 0 ? 1 : 0);

  return (
    <div className="pb-20">
      <SectionHeader
        title="Mi alimentación"
        subtitle="Registro diario · registra lo consumido y visualiza tu progreso contra objetivos"
        action={<input type="date" value={selectedDate} max={today()} onChange={(e) => setSelectedDate(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Fecha del registro" />}
      />

      {error && <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      {/* RESUMEN DEL DÍA — SSOT resumen-diario */}
      <DailyNutritionSummary resumen={resumen} loading={resumenLoading} error={resumenError} selectedDate={selectedDate} />

      <div className="mb-4 flex gap-2">
        <button onClick={() => openWizard(null as any)} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#173c36] px-5 py-4 text-sm font-semibold text-white shadow-sm hover:bg-[#225148] sm:flex-none">
          <Plus size={18} /> Registrar consumo
        </button>
        <button onClick={() => setSelectedDate(today())} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">Hoy</button>
      </div>

      {/* REGISTROS DE HOY */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800" style={FONT_HEADING}>Registros de hoy</h3>
          <span className="text-xs text-slate-500">{totalRegistrosHoy} elementos</span>
        </div>

        {loading ? <p className="mt-4 text-center text-sm text-slate-500">Cargando…</p> : !todayHabit ? (
          <EmptyHoy selectedDate={selectedDate} onRegistrar={() => openWizard(null as any)} />
        ) : alimentosHoy.length === 0 && consumosHoy.length === 0 && aguaHoyMl <= 0 ? (
          <EmptyHoy selectedDate={selectedDate} onRegistrar={() => openWizard("ALIMENTO" as any)} quickWaterMl={quickWaterMl} onWater={() => openWizard("AGUA")} />
        ) : (
          <div className="mt-4 space-y-2">
            {alimentosHoy.map((a) => {
              const macros = getRegistroMacros(a);
              const catalogInfo = foodCatalog.find((c) => c.id === a.alimentoId);
              // RegistroAlimentoResponse no incluye macros. Si la unidad coincide con la
              // referencia del catálogo, mostramos el aporte proporcional; para otras
              // conversiones el backend sigue siendo la fuente oficial del total diario.
              const fallbackMacros = !macros
                ? previewProporcional(getCatalogMacros(catalogInfo), Number(a.cantidad), a.unidad)
                : null;
              const displayMacros = macros ?? fallbackMacros;
              const hora = formatHora((a as any).creadoEn ?? (a as any).hora ?? (a as any).horaRegistro);
              return (
                <DailyConsumptionItem
                  key={`food-${a.id}`}
                  icon={<Utensils size={16} />}
                  iconBg="bg-amber-50 text-amber-600"
                  title={a.nombre}
                  subtitle={`${hora ? `${hora} · ` : ""}${moments.find((m) => m.value === a.momentoComida)?.label} · ${a.cantidad} ${a.unidad} · ${a.categoria}`}
                  kcal={displayMacros?.kcal ?? null}
                  macros={displayMacros}
                  onDetail={() => setDetailFood(a)}
                  onEdit={() => { setEditFood(a); setFoodSearch(a.nombre); setFoodSelection(a.alimentoId == null ? "" : String(a.alimentoId)); setFoodAmount(String(a.cantidad)); setFoodUnit(a.unidad); setFoodMoment(a.momentoComida); setFoodProtein(String(a.proteinaG)); setFoodCarbs(String(a.carbohidratosG)); setFoodFat(String(a.grasasG)); setWizardType("ALIMENTO"); setWizardOpen(true); }}
                  onDelete={() => setConfirmDeleteFood(a)}
                />
              );
            })}
            {consumosHoy.map((c) => {
              const hora = formatHora((c as any).creadoEn);
              return (
                <DailyConsumptionItem
                  key={`sup-${c.id}`}
                  icon={<Pill size={16} />}
                  iconBg="bg-indigo-500 text-white"
                  title={[c.nombre, c.marca].filter(Boolean).join(" · ")}
                  subtitle={`${hora ? `${hora} · ` : ""}${c.cantidadConsumida} ${c.unidad} · ${c.numeroTomas ?? 1} toma(s)`}
                  onEdit={() => { setEditConsumo(c); setSupplementSelection(String(c.suplementoClienteId)); setConsumptionAmount(String(c.cantidadConsumida)); setConsumptionUnit(c.unidad); setConsumptionTakes(String(c.numeroTomas ?? 1)); setWizardType("SUPLEMENTO"); setWizardOpen(true); }}
                  onDelete={() => setConfirmDeleteSup(c)}
                  bg="bg-indigo-50/40 border-indigo-100"
                />
              );
            })}
            {aguaHoyMl > 0 && (
              <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white"><Droplets size={16} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-slate-800">Agua</p><p className="text-sm font-bold text-sky-800">{aguaHoyMl} ml</p></div>
                    <p className="text-xs text-slate-500">Cantidad total registrada hoy</p>
                    {resumen?.agua.objetivoMl && <div className="mt-2"><ProgressBar value={(aguaHoyMl / resumen.agua.objetivoMl) * 100} color="bg-sky-500" /></div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => openWizard("AGUA")} className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs font-semibold text-sky-700"><Droplets size={12} /> Registrar agua</button>
          <button onClick={() => navigate("/client/suplementos")} className="text-xs text-slate-500 underline">Gestionar mis suplementos</button>
        </div>
      </Card>

      <div className="mt-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800" style={FONT_HEADING}><Clock3 size={14} /> Historial reciente</h3>
        {records.length === 0 ? <Card className="p-6 text-center text-sm text-slate-500">Sin registros previos.</Card> : (
          <div className="grid gap-2 sm:grid-cols-2">
            {records.slice(-6).reverse().map((r) => (
              <button key={r.id} onClick={() => setSelectedDate(r.fecha)} className={`rounded-xl border p-3 text-left ${r.fecha === selectedDate ? "border-teal-300 bg-teal-50" : "border-slate-200 bg-white"}`}>
                <p className="text-xs font-semibold text-slate-700">{r.fecha}</p>
                <p className="mt-1 text-xs text-slate-500">{r.cantidadComidas} comidas · {r.consumoAgua} L · Suplementos {r.consumeSuplementos ? "sí" : "no"}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* WIZARD */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 sm:items-center sm:p-4">
          <Card className="max-h-[90vh] w-full overflow-y-auto rounded-b-none p-5 sm:max-w-lg sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800" style={FONT_HEADING}>{wizardType ? `Registrar ${wizardType.toLowerCase()}` : "¿Qué consumiste?"}</h3>
              <button onClick={() => { setWizardOpen(false); setWizardType(null); setEditFood(null); setEditConsumo(null); }} className="rounded-lg p-1 hover:bg-slate-50" aria-label="Cerrar"><X size={18} /></button>
            </div>

            {!wizardType ? (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: "ALIMENTO" as const, label: "Alimento", icon: Utensils, color: "bg-amber-50 text-amber-700" },
                  { v: "SUPLEMENTO" as const, label: "Suplemento", icon: Pill, color: "bg-indigo-50 text-indigo-700" },
                  { v: "AGUA" as const, label: "Agua", icon: Droplets, color: "bg-sky-50 text-sky-600" },
                ].map((b) => (
                  <button key={b.v} onClick={() => setWizardType(b.v)} className={`flex flex-col items-center gap-2 rounded-2xl border border-slate-100 p-6 hover:bg-slate-50 ${b.color}`}>
                    <b.icon size={24} />
                    <span className="text-sm font-semibold">{b.label}</span>
                  </button>
                ))}
                <p className="col-span-3 mt-1 text-center text-xs text-slate-400">Alimento incluye fruta, snack y bebida según categoría del catálogo.</p>
              </div>
            ) : wizardType === "AGUA" ? (
              <WaterQuickAdd waterAmount={waterAmount} setWaterAmount={setWaterAmount} onSave={handleAddWater} onBack={() => setWizardType(null)} saving={saving} />
            ) : wizardType === "SUPLEMENTO" ? (
              <div className="space-y-3">
                <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Suplemento (de Mis suplementos)</span>
                  <select value={supplementSelection} onChange={(e) => { setSupplementSelection(e.target.value); const it = habituals.find(x=>String(x.id)===e.target.value); if(it){ setConsumptionAmount(String(it.cantidadPorToma ?? it.cantidad)); setConsumptionUnit(it.unidadCodigo ?? it.unidad); }}} className={inputClass}>
                    <option value="">Seleccionar</option>
                    {habituals.map((h) => <option key={h.id} value={h.id}>{h.nombre} {h.marca ? `· ${h.marca}` : ""}</option>)}
                  </select>
                </label>
                {habituals.length===0 && <p className="text-xs text-slate-500">No tienes suplementos habituales para esta fecha. <button onClick={()=>{ setWizardOpen(false); navigate("/client/suplementos");}} className="text-indigo-700 underline">Configurar</button></p>}
                <div className="grid grid-cols-2 gap-3">
                  <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Cantidad en cada toma</span><input type="number" min="0.0001" step="any" value={consumptionAmount} onChange={(e)=>setConsumptionAmount(e.target.value)} className={inputClass} /></label>
                  <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Unidad de la etiqueta</span><select value={consumptionUnit} onChange={(e)=>setConsumptionUnit(e.target.value)} className={inputClass}><option value="">Seleccionar</option>{units.map(u=><option key={u.codigo} value={u.codigo}>{u.nombre} ({u.codigo})</option>)}</select></label>
                </div>
                <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Número de tomas realizadas hoy</span><input type="number" min={1} step={1} value={consumptionTakes} onChange={(e)=>setConsumptionTakes(e.target.value)} className={inputClass} /></label>
                {selectedHabitual && supplementPreview && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                    <p className="text-xs font-semibold text-emerald-800">Aporte total que se registrará hoy</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-full border bg-white px-2.5 py-1 text-xs font-semibold text-slate-800">{supplementPreview.totalProduct} {consumptionUnit} en total · {supplementPreview.servings} porción(es) de etiqueta</span>
                      {supplementPreview.protein != null && <span className="rounded-full border bg-white px-2.5 py-1 text-xs text-slate-700">Proteína {supplementPreview.protein} g</span>}
                      {supplementPreview.carbs != null && <span className="rounded-full border bg-white px-2.5 py-1 text-xs text-slate-700">Carbos {supplementPreview.carbs} g</span>}
                      {supplementPreview.fat != null && <span className="rounded-full border bg-white px-2.5 py-1 text-xs text-slate-700">Grasas {supplementPreview.fat} g</span>}
                      {supplementPreview.creatine != null && <span className="rounded-full border bg-white px-2.5 py-1 text-xs text-slate-700">Creatina {supplementPreview.creatine} g</span>}
                      {supplementPreview.caffeine != null && <span className="rounded-full border bg-white px-2.5 py-1 text-xs text-slate-700">Cafeína {supplementPreview.caffeine} mg</span>}
                      {supplementPreview.sodium != null && <span className="rounded-full border bg-white px-2.5 py-1 text-xs text-slate-700">Sodio {supplementPreview.sodium} mg</span>}
                    </div>
                    <p className="mt-2 text-xs leading-4 text-slate-500">Fórmula: cantidad por toma ÷ tamaño de porción de la etiqueta × número de tomas × componente por porción.</p>
                  </div>
                )}
                <p className="text-xs leading-4 text-slate-400">Se usa la composición registrada en Mis suplementos; no se vuelve a pedir marca/macros.</p>
                <div className="flex justify-end gap-2">
                  <button onClick={()=>setWizardType(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Atrás</button>
                  <button onClick={()=>void handleAddSuplemento()} disabled={!supplementSelection || !Number(consumptionAmount) || !consumptionUnit || saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving?"Guardando…": editConsumo ? "Guardar cambios" : "Agregar"}</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Nombre de la comida</span><input value={foodSearch} onChange={(e)=>{ setFoodSearch(e.target.value); setFoodSelection(""); }} placeholder="Ej. arroz con pollo" maxLength={200} className={inputClass} aria-label="Nombre de la comida" /></label>
                {selectedFood && <FoodNutritionInfo food={selectedFood} macros={selectedFoodMacros} />}
                {(recent.length>0 || frequent.length>0) && !foodSearch.trim() && (
                  <div className="space-y-2">
                    {recent.length>0 && <div><p className="mb-1 text-xs font-semibold text-slate-500">Recientes</p><div className="flex flex-wrap gap-1">{recent.slice(0,4).map((s,index)=> <button key={`r-${s.alimentoId ?? s.nombre}-${index}`} onClick={()=>{ setFoodSelection(s.alimentoId == null ? "" : String(s.alimentoId)); setFoodSearch(s.nombre); setFoodAmount(String(s.ultimaCantidad)); setFoodUnit(s.ultimaUnidad); setFoodMoment(s.ultimoMomento); }} className="rounded-full border bg-white px-3 py-1 text-xs">{s.nombre}</button>)}</div></div>}
                    {frequent.length>0 && <div><p className="mb-1 text-xs font-semibold text-slate-500">Frecuentes</p><div className="flex flex-wrap gap-1">{frequent.slice(0,4).map((s,index)=> <button key={`f-${s.alimentoId ?? s.nombre}-${index}`} onClick={()=>{ setFoodSelection(s.alimentoId == null ? "" : String(s.alimentoId)); setFoodSearch(s.nombre); setFoodAmount(String(s.ultimaCantidad)); setFoodUnit(s.ultimaUnidad); setFoodMoment(s.ultimoMomento); }} className="rounded-full border bg-white px-3 py-1 text-xs">{s.nombre}</button>)}</div></div>}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Cantidad consumida</span><input type="number" value={foodAmount} onChange={(e)=>setFoodAmount(e.target.value)} placeholder="Ej. 65" className={inputClass} /></label>
                  <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Unidad</span><select value={foodUnit} onChange={(e)=>setFoodUnit(e.target.value)} className={inputClass}><option value="">Seleccionar</option>{units.map(u=><option key={u.codigo} value={u.codigo}>{u.nombre} ({u.codigo})</option>)}</select></label>
                </div>
                <div className="grid grid-cols-3 gap-3"><label><span className="mb-1 block text-xs font-semibold text-slate-600">Proteínas (g)</span><input type="number" min="0" value={foodProtein} onChange={e=>setFoodProtein(e.target.value)} className={inputClass}/></label><label><span className="mb-1 block text-xs font-semibold text-slate-600">Carbos (g)</span><input type="number" min="0" value={foodCarbs} onChange={e=>setFoodCarbs(e.target.value)} className={inputClass}/></label><label><span className="mb-1 block text-xs font-semibold text-slate-600">Grasas (g)</span><input type="number" min="0" value={foodFat} onChange={e=>setFoodFat(e.target.value)} className={inputClass}/></label></div>
                {foodAmount && foodUnit && <ServingPreview macros={selectedFoodMacros} cantidad={Number(foodAmount)} unidad={foodUnit} />}
                <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Momento</span><select value={foodMoment} onChange={(e)=>setFoodMoment(e.target.value as MomentoComida)} className={inputClass}>{moments.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}</select></label>
                <div className="flex justify-end gap-2">
                  <button onClick={()=>setWizardType(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Atrás</button>
                  <button onClick={()=>void handleAddFood()} disabled={!foodSearch.trim() || !Number(foodAmount) || !foodUnit || [foodProtein, foodCarbs, foodFat].some(value => value === "" || Number(value) < 0) || saving} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving?"Guardando…": editFood ? "Guardar cambios" : "Agregar"}</button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Detalle y confirmaciones */}
      {detailFood && <AppModal open={!!detailFood} onOpenChange={(v)=> !v && setDetailFood(null)} title={detailFood.nombre} description={`${detailFood.cantidad} ${detailFood.unidad} · ${moments.find(m=>m.value===detailFood.momentoComida)?.label}`}>
        <FoodDetailContent food={detailFood} catalog={foodCatalog} />
      </AppModal>}
      <ConfirmModal open={!!confirmDeleteFood} onOpenChange={(v)=> !v && setConfirmDeleteFood(null)} title="¿Eliminar este registro?" description={`${confirmDeleteFood?.nombre} · ${confirmDeleteFood?.cantidad} ${confirmDeleteFood?.unidad}`} confirmLabel="Eliminar" destructive onConfirm={handleDeleteFoodConfirmed} />
      <ConfirmModal open={!!confirmDeleteSup} onOpenChange={(v)=> !v && setConfirmDeleteSup(null)} title="¿Eliminar consumo de suplemento?" description={`${confirmDeleteSup?.nombre} · ${confirmDeleteSup?.cantidadConsumida} ${confirmDeleteSup?.unidad}`} confirmLabel="Eliminar" destructive onConfirm={handleDeleteSupConfirmed} />
    </div>
  );
}

function DailyNutritionSummary({ resumen, loading, error, selectedDate }: { resumen: ResumenDiarioResponse | null; loading: boolean; error: string; selectedDate: string }) {
  if (loading) {
    return <Card className="mb-5 p-5"><div className="space-y-3"><div className="h-6 w-32 animate-pulse rounded bg-slate-100" /><div className="grid gap-3 sm:grid-cols-2">{[1,2,3,4].map(i=> <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-50"/> )}</div></div></Card>;
  }
  if (error) {
    return <Card className="mb-5 border-amber-200 bg-amber-50 p-4"><p className="text-sm font-medium text-amber-800">No se pudo cargar el resumen</p><p className="text-xs text-amber-700">{error}</p></Card>;
  }
  if (!resumen) {
    return <Card className="mb-5 border-dashed p-6 text-center"><p className="text-sm text-slate-500">Resumen no disponible para {selectedDate}.</p></Card>;
  }
  const isDisponible = resumen.objetivo.estado === "DISPONIBLE";
  const kcalObjetivo = resumen.objetivo.kcal;
  const kcalConsumido = resumen.consumido.kcal;
  const pctKcal = resumen.porcentajeKcal ?? (kcalObjetivo && kcalConsumido != null ? Math.round((kcalConsumido/kcalObjetivo)*100) : null);
  const aguaMl = resumen.agua.consumidoMl;
  const aguaObjetivo = resumen.agua.objetivoMl;
  const restanteKcal = kcalObjetivo != null ? kcalObjetivo - (kcalConsumido ?? 0) : null;

  return (
    <Card className="mb-5 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800" style={FONT_HEADING}><Calendar size={16} className="text-teal-600" /> Resumen del día · {fmtDateLong(selectedDate)}</h3>
          <p className="mt-1 text-xs text-slate-500">{isDisponible ? `Meta del plan vinculado al análisis predictivo · ${resumen.objetivo.fuente ?? "backend"}` : "Consumo registrado · meta del análisis predictivo aún pendiente"}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isDisponible ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>{isDisponible ? "Meta predictiva disponible" : "Meta predictiva pendiente"}</span>
      </div>

      <div className="mt-4 space-y-4">
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
          <div className="flex items-center justify-between gap-3 text-xs font-medium text-amber-800"><span>Calorías consumidas / objetivo</span><span className="text-sm font-bold">{kcalConsumido ?? 0} / {kcalObjetivo ?? "pendiente"} kcal</span></div>
          <div className="mt-2"><ProgressBar value={pctKcal ?? 0} color="bg-amber-500" /></div>
          {pctKcal != null && <p className="mt-1 text-xs text-slate-500">{Math.round(pctKcal)}% del objetivo{resumen.diferenciaKcal != null ? ` · diferencia ${resumen.diferenciaKcal > 0 ? "+" : ""}${resumen.diferenciaKcal} kcal` : ""}</p>}
          {restanteKcal != null && <p className={`mt-1 text-xs font-medium ${restanteKcal >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{restanteKcal >= 0 ? `Faltan ${Math.round(restanteKcal)} kcal para la meta de hoy` : `Exceso de ${Math.round(Math.abs(restanteKcal))} kcal sobre la meta de hoy`}</p>}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <MacroProgress label="Proteínas" consumido={resumen.consumido.proteina} objetivo={resumen.objetivo.proteina} unidad="g" color="bg-rose-500" />
          <MacroProgress label="Carbohidratos" consumido={resumen.consumido.carbohidratos} objetivo={resumen.objetivo.carbohidratos} unidad="g" color="bg-orange-500" />
          <MacroProgress label="Grasas" consumido={resumen.consumido.grasas} objetivo={resumen.objetivo.grasas} unidad="g" color="bg-teal-500" />
        </div>
        <MacroProgress label="Agua" consumido={aguaMl} objetivo={aguaObjetivo ?? null} unidad="ml" color="bg-sky-500" />
        {!isDisponible && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3"><p className="text-xs font-semibold text-amber-800">El consumo está registrado. Las cantidades objetivo aparecerán cuando exista un plan para esta fecha vinculado al análisis predictivo.</p>{resumen.objetivo.motivo && <p className="mt-1 text-xs leading-5 text-amber-700">{resumen.objetivo.motivo}</p>}</div>}
      </div>
    </Card>
  );
}

function MacroProgress({ label, consumido, objetivo, unidad, color }: { label: string; consumido: number | null; objetivo: number | null; unidad: string; color: string }) {
  const hasObjective = objetivo != null && objetivo > 0;
  const pct = hasObjective && consumido != null ? Math.min(100, Math.round((consumido / objetivo) * 100)) : 0;
  const restante = hasObjective ? objetivo - (consumido ?? 0) : null;
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <div className="flex justify-between text-xs"><span className="font-semibold text-slate-700">{label}</span><span className="text-slate-500">{unidad}</span></div>
      <p className="mt-1 text-sm font-bold text-slate-900">{consumido ?? 0} / {hasObjective ? objetivo : "objetivo pendiente"} <span className="text-xs font-normal text-slate-500">{unidad}</span></p>
      <div className="mt-2"><ProgressBar value={pct} color={color} /></div>
      {hasObjective && <p className="mt-1 text-[11px] text-slate-500">{pct}% alcanzado</p>}
      {restante != null && <p className={`mt-1 text-[11px] font-semibold ${restante >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{restante >= 0 ? `Faltan ${Math.round(restante * 10) / 10} ${unidad}` : `Exceso de ${Math.round(Math.abs(restante) * 10) / 10} ${unidad}`}</p>}
    </div>
  );
}

function FoodNutritionInfo({ food, macros }: { food: AlimentoCatalogoResponse; macros: ReturnType<typeof getCatalogMacros> }) {
  if (!macros) return <div className="rounded-xl border border-dashed bg-slate-50 p-3"><p className="text-xs text-slate-500">Información nutricional de referencia no disponible para este alimento.</p><p className="text-xs text-slate-400">El backend no expuso kcal/proteína/carbos/grasas para porción de referencia.</p></div>;
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-700">{food.nombre} <span className="font-normal text-slate-500">· {food.categoria} {food.porcionReferencia ? `· ${food.porcionReferencia}` : "· Por 100 g"}</span></p>
      <p className="mt-1 text-xs font-medium text-slate-600">Información nutricional de referencia</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {macros.kcal != null && <span className="rounded-full bg-amber-50 border px-2.5 py-1 text-xs font-semibold text-amber-700">{macros.kcal} kcal</span>}
        {macros.prot != null && <span className="rounded-full bg-rose-50 border px-2.5 py-1 text-xs font-semibold text-rose-700">{macros.prot} g proteína</span>}
        {macros.carb != null && <span className="rounded-full bg-orange-50 border px-2.5 py-1 text-xs font-semibold text-orange-700">{macros.carb} g carbos</span>}
        {macros.grasa != null && <span className="rounded-full bg-teal-50 border px-2.5 py-1 text-xs font-semibold text-teal-700">{macros.grasa} g grasa</span>}
        {macros.fibra != null && <span className="rounded-full bg-emerald-50 border px-2.5 py-1 text-xs font-semibold text-emerald-700">{macros.fibra} g fibra</span>}
      </div>
      <p className="mt-2 text-xs leading-4 text-slate-400">Mostrado por referencia del catálogo; cantidad consumida se ingresa abajo.</p>
    </div>
  );
}

function ServingPreview({ macros, cantidad, unidad }: { macros: ReturnType<typeof getCatalogMacros>; cantidad: number; unidad: string }) {
  const preview = previewProporcional(macros, cantidad, unidad);
  if (!preview) return <p className="rounded-xl border border-dashed bg-slate-50 p-3 text-xs text-slate-500">El backend calculará los nutrientes al guardar. No se muestra una estimación porque la unidad no coincide con la referencia del catálogo.</p>;
  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
      <p className="text-xs font-semibold text-emerald-800">Esta porción aporta <span className="font-normal text-emerald-700">({cantidad} {unidad} · estimación; oficial tras guardar)</span></p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {preview.kcal != null && <span className="rounded-full bg-white border px-2.5 py-1 text-xs font-bold text-slate-800">{preview.kcal} kcal</span>}
        {preview.prot != null && <span className="rounded-full bg-white border px-2.5 py-1 text-xs text-slate-700">{preview.prot} g proteína</span>}
        {preview.carb != null && <span className="rounded-full bg-white border px-2.5 py-1 text-xs text-slate-700">{preview.carb} g carbos</span>}
        {preview.grasa != null && <span className="rounded-full bg-white border px-2.5 py-1 text-xs text-slate-700">{preview.grasa} g grasa</span>}
        {preview.fibra != null && <span className="rounded-full bg-white border px-2.5 py-1 text-xs text-slate-700">{preview.fibra} g fibra</span>}
      </div>
      <p className="mt-1 text-xs text-slate-500">Calculado proporcionalmente contra la cantidad de referencia publicada por el catálogo.</p>
    </div>
  );
}

function DailyConsumptionItem({ icon, iconBg, title, subtitle, kcal, macros, onDetail, onEdit, onDelete, bg }: any) {
  return (
    <div className={`flex flex-col gap-2 rounded-xl border p-3 ${bg ?? "border-slate-100 bg-white"}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>{icon}</span>
          <div>
            <button onClick={onDetail} className="text-left text-sm font-medium text-slate-800 hover:underline">{title}</button>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onDetail} className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-50">Ver detalle</button>
          <button onClick={onEdit} className="rounded-lg p-2 text-slate-500 hover:bg-slate-50" aria-label={`Editar ${title}`}><Edit2 size={14} /></button>
          <button onClick={onDelete} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50" aria-label={`Eliminar ${title}`}><Trash2 size={14} /></button>
        </div>
      </div>
      {(kcal != null || macros) && (
        <div className="flex flex-wrap gap-1.5 pl-12">
          {kcal != null && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">{kcal} kcal</span>}
          {macros?.prot != null && <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs text-rose-700">{macros.prot} g P</span>}
          {macros?.carb != null && <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs text-orange-700">{macros.carb} g C</span>}
          {macros?.grasa != null && <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs text-teal-700">{macros.grasa} g G</span>}
        </div>
      )}
    </div>
  );
}

function FoodDetailContent({ food, catalog }: { food: RegistroAlimentoResponse; catalog: AlimentoCatalogoResponse[] }) {
  const cat = catalog.find(c=> c.id===food.alimentoId);
  const macros = getRegistroMacros(food) ?? getCatalogMacros(cat);
  const hora = formatHora((food as any).creadoEn ?? (food as any).hora);
  return (
    <div className="space-y-3 text-sm">
      <p><span className="font-semibold">Cantidad:</span> {food.cantidad} {food.unidad}</p>
      {hora && <p><span className="font-semibold">Hora:</span> {hora}</p>}
      <p><span className="font-semibold">Momento:</span> {food.momentoComida}</p>
      {macros ? (
        <div className="rounded-xl bg-slate-50 p-3 grid gap-2 text-xs">
          {macros.kcal != null && <p><span className="font-semibold">Calorías:</span> {macros.kcal} kcal</p>}
          {macros.prot != null && <p><span className="font-semibold">Proteínas:</span> {macros.prot} g</p>}
          {macros.carb != null && <p><span className="font-semibold">Carbohidratos:</span> {macros.carb} g</p>}
          {macros.grasa != null && <p><span className="font-semibold">Grasas:</span> {macros.grasa} g</p>}
          {macros.fibra != null && <p><span className="font-semibold">Fibra:</span> {macros.fibra} g</p>}
        </div>
      ) : <p className="text-xs text-slate-500">Sin desglose macro persistido para este registro.</p>}
      <p className="text-xs text-slate-400">Fuente: {cat ? `${cat.nombre} · ${cat.categoria}` : "catálogo"} · backend autoridad.</p>
    </div>
  );
}

function WaterQuickAdd({ waterAmount, setWaterAmount, onSave, onBack, saving }: any) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Flujo simplificado — solo cantidad. No se solicitan proteínas, carbohidratos ni calorías.</p>
      <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Cantidad (ml)</span><input type="number" value={waterAmount} onChange={(e)=>setWaterAmount(e.target.value)} placeholder="500" className={inputClass} aria-label="Cantidad agua ml" /></label>
      <div className="grid grid-cols-3 gap-2">
        {[250,500,750].map(ml=> <button key={ml} onClick={()=>setWaterAmount(String(ml))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">{ml} ml</button>)}
        <button onClick={()=>setWaterAmount("1000")} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">1000 ml</button>
        <button onClick={()=>setWaterAmount("1500")} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">1500 ml</button>
        <button onClick={()=>setWaterAmount("2000")} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">2000 ml</button>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onBack} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Atrás</button>
        <button onClick={onSave} disabled={!Number(waterAmount) || saving} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving?"Guardando…":"Guardar"}</button>
      </div>
    </div>
  );
}

function EmptyHoy({ selectedDate, onRegistrar, quickWaterMl, onWater }: any) {
  if (!onWater) {
    return <div className="mt-4 rounded-xl border border-dashed p-6 text-center"><p className="text-sm text-slate-600">Aún no hay registro para {selectedDate}.</p><p className="mt-1 text-xs text-slate-500">Pulsa “Registrar consumo” para crear tu registro diario.</p><button onClick={onRegistrar} className="mt-3 rounded-xl bg-[#173c36] px-4 py-2 text-sm font-semibold text-white">+ Registrar consumo</button></div>;
  }
  return <div className="mt-4 rounded-xl border border-dashed p-6 text-center"><p className="text-sm text-slate-600">Sin alimentos ni suplementos registrados hoy.</p><p className="mt-1 text-xs text-slate-500">El resumen nutricional se actualizará al registrar.</p><p className="mt-2 text-xs text-slate-400">Aún no registraste alimentos hoy. Registra tu primer consumo para comenzar a ver tu resumen diario.</p><div className="mt-3 flex justify-center gap-2"><button onClick={onRegistrar} className="rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white">+ Alimento</button><button onClick={onWater} className="rounded-lg border border-sky-200 px-3 py-2 text-xs font-semibold text-sky-700">+ Agua {quickWaterMl} ml</button></div></div>;
}

function DrumstickIcon(props: any) { return <Utensils {...props} />; }
