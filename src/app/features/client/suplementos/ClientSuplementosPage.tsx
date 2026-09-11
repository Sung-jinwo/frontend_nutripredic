import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Activity, AlertCircle, Clock, Edit2, Pill, Plus, Utensils } from "lucide-react";
import { AppModal, Badge, Card, ConfirmModal, KPICard, SectionHeader, StateBadge } from "../../../components/shared";
import { useAuth } from "../../../context/AuthContext";
import { FONT_HEADING } from "../../../types";
import { suplementosService, type SuplementoActualizacionRequest, type SuplementoClienteResponse } from "../../../services/suplementos.service";
import { unidadesService, type UnidadMedidaResponse } from "../../../services/unidades.service";
import { useNavigate } from "react-router-dom";

type SupplementForm = { suplementoId: string; nombre: string; cantidadPorToma: string; unidadCodigo: string; proteinaGPorToma: string; carbohidratosGPorToma: string; grasasGPorToma: string; creatinaGPorToma: string; cafeinaMgPorToma: string; sodioMgPorToma: string; tiempoUso: string; activo: "true" | "false"; fechaInicio: string; fechaFin: string };
const localDate = () => new Date().toLocaleDateString("en-CA");
const timeUseText = (fechaInicio: string, fechaFin = "") => (fechaFin ? `Del ${fechaInicio} al ${fechaFin}` : `En curso desde ${fechaInicio}`);
const emptyForm = (): SupplementForm => { const fechaInicio = localDate(); return { suplementoId: "", nombre: "", cantidadPorToma: "", unidadCodigo: "", proteinaGPorToma: "", carbohidratosGPorToma: "", grasasGPorToma: "", creatinaGPorToma: "", cafeinaMgPorToma: "", sodioMgPorToma: "", tiempoUso: timeUseText(fechaInicio), activo: "true", fechaInicio, fechaFin: "" }; };
const inputClass = "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 shadow-sm transition focus:border-[#397065] focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100";
const errorMessage = (error: unknown) => (error instanceof Error ? error.message : "No se pudo completar la operación.");
const compositionText = (form: SupplementForm) => `Proteína: ${form.proteinaGPorToma || 0} g; Carbohidratos: ${form.carbohidratosGPorToma || 0} g; Grasas: ${form.grasasGPorToma || 0} g; Creatina: ${form.creatinaGPorToma || 0} g; Cafeína: ${form.cafeinaMgPorToma || 0} mg; Sodio: ${form.sodioMgPorToma || 0} mg`;

export default function ClientSuplementosPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<SuplementoClienteResponse[]>([]);
  const [units, setUnits] = useState<UnidadMedidaResponse[]>([]);
  const [form, setForm] = useState<SupplementForm>(emptyForm);
  const [editing, setEditing] = useState<SuplementoClienteResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<SuplementoClienteResponse | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user?.clienteId) { setError("No se encontró el perfil de cliente."); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const [assigned, unitItems] = await Promise.all([suplementosService.listByCliente(user.clienteId), unidadesService.list()]);
      setRecords(assigned);
      setUnits(unitItems);
    }
    catch (cause) { setError(errorMessage(cause)); } finally { setLoading(false); }
  }, [user?.clienteId]);
  useEffect(() => { void load(); }, [load]);

  const invalidDates = Boolean(form.fechaFin && form.fechaFin < form.fechaInicio);
  const complete = Boolean(form.nombre.trim() && Number(form.cantidadPorToma) > 0 && form.unidadCodigo && form.proteinaGPorToma !== "" && form.carbohidratosGPorToma !== "" && form.grasasGPorToma !== "" && form.creatinaGPorToma !== "" && form.cafeinaMgPorToma !== "" && form.sodioMgPorToma !== "" && form.fechaInicio && !invalidDates);
  const update = (field: keyof SupplementForm, value: string) => setForm(current => ({ ...current, [field]: value }));

  const close = () => { setOpen(false); setEditing(null); setForm(emptyForm()); };
  const startEdit = async (record: SuplementoClienteResponse) => {
    setEditing(record); setOpen(true); setError("");
    setForm({ suplementoId: String(record.suplementoId), nombre: record.nombre, cantidadPorToma: String(record.cantidadPorToma ?? record.cantidad), unidadCodigo: record.unidadCodigo ?? record.unidad, proteinaGPorToma: String(record.proteinaGPorToma ?? ""), carbohidratosGPorToma: String(record.carbohidratosGPorToma ?? ""), grasasGPorToma: String(record.grasasGPorToma ?? ""), creatinaGPorToma: String(record.creatinaGPorToma ?? ""), cafeinaMgPorToma: String(record.cafeinaMgPorToma ?? ""), sodioMgPorToma: String(record.sodioMgPorToma ?? ""), tiempoUso: record.tiempoUso ?? "", activo: record.activo ? "true" : "false", fechaInicio: record.fechaInicio, fechaFin: record.fechaFin ?? "" });
  };
  const save = async () => {
    if (!user?.clienteId || !complete) return;
    const cantidad = Number(form.cantidadPorToma);
    const data: SuplementoActualizacionRequest = { nombreSuplemento: form.nombre.trim(), cantidad, unidad: form.unidadCodigo, frecuencia: null, tiempoUso: timeUseText(form.fechaInicio, form.fechaFin), activo: form.activo === "true", fechaInicio: form.fechaInicio, fechaFin: form.fechaFin || null, cantidadPorToma: cantidad, unidadCodigo: form.unidadCodigo, tomasPorPeriodo: null, periodoFrecuencia: null, componentesDeclarados: compositionText(form), energiaKcalPorToma: null, proteinaGPorToma: Number(form.proteinaGPorToma), carbohidratosGPorToma: Number(form.carbohidratosGPorToma), grasasGPorToma: Number(form.grasasGPorToma), creatinaGPorToma: Number(form.creatinaGPorToma), cafeinaMgPorToma: Number(form.cafeinaMgPorToma), sodioMgPorToma: Number(form.sodioMgPorToma) };
    setSaving(true); setError("");
    try { if (editing) await suplementosService.update(user.clienteId, editing.suplementoId, data); else await suplementosService.create(user.clienteId, { suplementoId: null, ...data }); close(); await load(); }
    catch (cause) { setError(errorMessage(cause)); } finally { setSaving(false); }
  };
  const remove = async () => { if (!user?.clienteId || !pendingRemoval) return; setRemoving(true); try { await suplementosService.delete(user.clienteId, pendingRemoval.suplementoId); setPendingRemoval(null); await load(); } catch (cause) { setError(errorMessage(cause)); } finally { setRemoving(false); } };
  const activeCount = records.filter(item => item.activo).length;

  return <div>
    <SectionHeader title="Mis suplementos" subtitle="Catálogo personal — qué productos utilizas habitualmente. El consumo diario se registra en Mi alimentación." action={<button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-xl bg-[#173c36] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#225148]"><Plus size={14} /> Añadir suplemento</button>} />
    {error && <div role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

    {/* Explicación conexión — §12 */}
    <Card className="mb-4 border-indigo-100 bg-indigo-50/40 p-4">
      <p className="text-xs font-semibold text-indigo-800">¿Cómo se usa?</p>
      <p className="mt-1 text-xs leading-5 text-indigo-700/80">Registra tu producto <strong>una vez aquí</strong>. Luego en <button onClick={() => navigate("/client/habitos")} className="font-semibold underline">Mi alimentación → Registrar consumo → Suplemento</button> podrás seleccionar <em>{records[0]?.nombre ?? "Whey Protein, Creatina…"}</em> y registrar <em>¿Cuánto consumiste? 30 g</em> sin volver a escribir marca ni macros. El sistema usa la composición ya persistida.</p>
    </Card>

    <AppModal open={open} onOpenChange={value => { if (!value) close(); else setOpen(true); }} title={editing ? "Editar suplemento" : "Añadir suplemento"} description="Registra el nombre y toda la composición declarada en la etiqueta del suplemento." className="sm:max-w-3xl" footer={<><button onClick={close} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">Cancelar</button><button onClick={() => void save()} disabled={!complete || saving} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45">{saving ? "Guardando..." : "Guardar"}</button></>}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Nombre del suplemento"><input aria-label="Nombre del suplemento" value={form.nombre} onChange={event => update("nombre", event.target.value)} maxLength={255} className={inputClass} placeholder="Ej.: Whey Protein, Creatina monohidratada" /></Field>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs leading-5 text-indigo-800">Ingresa la información tal como figura en la etiqueta. Esta composición quedará asociada a tu suplemento y se reutilizará en el registro diario.</div>
        <Field label="Tamaño de una porción según la etiqueta"><input aria-label="Tamaño de una porción según la etiqueta" type="number" min="0.0001" step="any" value={form.cantidadPorToma} onChange={event => update("cantidadPorToma", event.target.value)} className={inputClass} placeholder="Ej. 30 (whey), 5 (creatina), 1 (cápsula)" /></Field>
        <Field label="Unidad"><select aria-label="Unidad canónica" value={form.unidadCodigo} onChange={event => update("unidadCodigo", event.target.value)} className={inputClass}><option value="">Seleccionar unidad</option>{units.map(unit => <option key={unit.codigo} value={unit.codigo}>{unit.nombre} ({unit.codigo}) — ej. g, mg, µg, ml</option>)}</select></Field>
        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 md:col-span-2"><p className="text-xs font-semibold text-amber-800">Componentes presentes en esa porción</p><p className="mt-1 text-[11px] text-amber-700">Copia los valores “por porción” de la etiqueta. Escribe 0 únicamente si confirmas que el producto no contiene ese componente.</p><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{[["proteinaGPorToma","Proteína (g)"],["carbohidratosGPorToma","Carbos (g)"],["grasasGPorToma","Grasas (g)"],["creatinaGPorToma","Creatina (g)"],["cafeinaMgPorToma","Cafeína (mg)"],["sodioMgPorToma","Sodio (mg)"]].map(([key,label]) => <label key={key}><span className="text-[11px] text-slate-600">{label}</span><input type="number" min="0" step="any" value={form[key as keyof SupplementForm]} onChange={event => update(key as keyof SupplementForm, event.target.value)} className={inputClass} /></label>)}</div></div>
        <Field label="¿Desde cuándo lo consumes habitualmente?"><input aria-label="Fecha de inicio de uso habitual" type="date" value={form.fechaInicio} onChange={event => update("fechaInicio", event.target.value)} className={inputClass} /></Field>
        <Field label="Fecha de fin (opcional)"><input aria-label="Fecha de fin" type="date" value={form.fechaFin} onChange={event => update("fechaFin", event.target.value)} className={inputClass} /></Field>
        <Field label="Uso actual"><select aria-label="Actualmente lo consumo" value={form.activo} onChange={event => update("activo", event.target.value)} className={inputClass}><option value="true">Activo — lo consumo</option><option value="false">Inactivo</option></select></Field></div>
      {invalidDates && <p role="alert" className="mt-3 text-xs text-rose-600">La fecha de fin no puede ser anterior a la fecha de inicio.</p>}
      {!complete && !invalidDates && <p className="mt-3 text-xs text-amber-700">Completa producto, porción, composición cuantificada y fecha de inicio. Usa 0 cuando un componente no esté presente.</p>}
    </AppModal>

    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-4">{[{ icon: Pill, label: "Activos", value: activeCount, color: "bg-teal-500" }, { icon: Activity, label: "Total productos", value: records.length, color: "bg-indigo-500" }, { icon: Clock, label: "Con composición", value: records.filter(record => record.proteinaGPorToma != null && record.carbohidratosGPorToma != null && record.grasasGPorToma != null && record.creatinaGPorToma != null && record.cafeinaMgPorToma != null && record.sodioMgPorToma != null).length, color: "bg-slate-600" }, { icon: AlertCircle, label: "Inactivos", value: records.length - activeCount, color: "bg-amber-500" }].map(item => <KPICard key={item.label} icon={item.icon} title={item.label} value={String(item.value)} iconBg={item.color} />)}</div>

    {/* Catálogo personal — cards, no tabla en mobile (§27) */}
    {loading ? <Card className="p-8 text-center text-sm text-slate-500">Cargando…</Card> : records.length === 0 ? (
      <Card className="p-8 text-center">
        <Pill size={28} className="mx-auto mb-2 text-slate-300" />
        <p className="text-sm font-medium text-slate-700">Aún no tienes productos registrados</p>
        <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">Añade aquí los suplementos que usas habitualmente (whey, creatina 5 g, vitaminas mg/µg, omega…). Luego los registrarás en <strong>Mi alimentación</strong> sin repetir datos.</p>
        <button onClick={() => setOpen(true)} className="mt-4 rounded-xl bg-[#173c36] px-4 py-2 text-sm font-semibold text-white">+ Añadir suplemento</button>
      </Card>
    ) : (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {records.map(record => (
          <Card key={record.id} className="flex flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><Pill size={18} /></div>
              <StateBadge estado={record.activo ? "Activo" : "Inactivo"} />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-800" style={FONT_HEADING}>{record.nombre}</h3>
            <p className="text-xs text-slate-500">Composición declarada por el cliente</p>
            <div className="mt-3 space-y-1.5 rounded-xl bg-slate-50 p-3 text-xs">
              <p className="flex justify-between"><span className="text-slate-500">Porción</span><span className="font-medium text-slate-800">{record.cantidadPorToma ?? record.cantidad} {record.unidadCodigo ?? record.unidad}</span></p>
              <p className="text-slate-500">Macros: <span className="font-medium text-slate-800">P {record.proteinaGPorToma ?? 0} g · C {record.carbohidratosGPorToma ?? 0} g · G {record.grasasGPorToma ?? 0} g</span></p>
              <p className="text-slate-500">Otros: <span className="font-medium text-slate-800">Creatina {record.creatinaGPorToma ?? 0} g · Cafeína {record.cafeinaMgPorToma ?? 0} mg · Sodio {record.sodioMgPorToma ?? 0} mg</span></p>
              <p className="flex justify-between"><span className="text-slate-500">Periodo</span><span className="font-medium text-slate-800">{record.fechaInicio} → {record.fechaFin || "actualidad"}</span></p>
            </div>
            <div className="mt-3 flex gap-1">
              <button aria-label={`Editar ${record.nombre}`} onClick={() => void startEdit(record)} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"><Edit2 size={12} /> Editar</button>
              {record.activo && <button aria-label={`Desactivar ${record.nombre}`} onClick={() => setPendingRemoval(record)} className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50">Desactivar</button>}
            </div>
            <button onClick={() => navigate("/client/habitos")} className="mt-2 flex items-center justify-center gap-1 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"><Utensils size={12}/> Usar en Mi alimentación</button>
          </Card>
        ))}
      </div>
    )}

    <ConfirmModal open={Boolean(pendingRemoval)} onOpenChange={value => { if (!value && !removing) setPendingRemoval(null); }} title="Desactivar suplemento" description={`¿Desactivar ${pendingRemoval?.nombre ?? "este suplemento"}? Seguirá en historial y podrás reactivarlo editando.`} confirmLabel="Desactivar" destructive busy={removing} onConfirm={() => void remove()} />
  </div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block"><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-600">{label}</span>{children}</label>; }
