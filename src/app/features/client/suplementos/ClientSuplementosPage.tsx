import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { COMPONENT_FIELDS, numericError, optionalComponent } from "./supplement-validation";
import { Activity, AlertCircle, Ban, Clock, Edit2, Pill, Plus, ShieldCheck, Sparkles, Utensils } from "lucide-react";
import { OperationNotice } from "../../../components/shared/OperationNotice";
import { AppModal, Badge, Card, KPICard, SectionHeader, StateBadge } from "../../../components/shared";
import { useAuth } from "../../../context/AuthContext";
import { FONT_HEADING } from "../../../types";
import { suplementosService, type SuplementoActualizacionRequest, type SuplementoClienteResponse } from "../../../services/suplementos.service";
import { unidadesService, type UnidadMedidaResponse } from "../../../services/unidades.service";
import { useNavigate } from "react-router-dom";
import { saludService, type OrientacionSuplementoItem, type OrientacionSuplementosResponse } from "../../../services/salud.service";

type SupplementForm = { suplementoId: string; nombre: string; cantidadPorToma: string; unidadCodigo: string; proteinaGPorToma: string; carbohidratosGPorToma: string; grasasGPorToma: string; creatinaGPorToma: string; cafeinaMgPorToma: string; sodioMgPorToma: string; tiempoUso: string; activo: "true" | "false"; fechaInicio: string; fechaFin: string };
const localDate = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });
const timeUseText = (fechaInicio: string, fechaFin = "") => (fechaFin ? `Del ${fechaInicio} al ${fechaFin}` : `En curso desde ${fechaInicio}`);
const emptyForm = (): SupplementForm => { const fechaInicio = localDate(); return { suplementoId: "", nombre: "", cantidadPorToma: "", unidadCodigo: "", proteinaGPorToma: "", carbohidratosGPorToma: "", grasasGPorToma: "", creatinaGPorToma: "", cafeinaMgPorToma: "", sodioMgPorToma: "", tiempoUso: timeUseText(fechaInicio), activo: "true", fechaInicio, fechaFin: "" }; };
const inputClass = "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 shadow-sm transition focus:border-[#397065] focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100";
const errorMessage = (error: unknown) => (error instanceof Error ? error.message : "No se pudo completar la operación.");
const compositionText = (form: SupplementForm) => `Proteína: ${form.proteinaGPorToma || "sin dato"} g; Carbohidratos: ${form.carbohidratosGPorToma || "sin dato"} g; Grasas: ${form.grasasGPorToma || "sin dato"} g; Creatina: ${form.creatinaGPorToma || "sin dato"} g; Cafeína: ${form.cafeinaMgPorToma || "sin dato"} mg; Sodio: ${form.sodioMgPorToma || "sin dato"} mg`;

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
  const saveInFlight = useRef(false);
  const [error, setError] = useState("");
  const [orientation, setOrientation] = useState<OrientacionSuplementosResponse | null>(null);

  const load = useCallback(async () => {
    if (!user?.clienteId) { setError("No se encontró el perfil de cliente."); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const [assigned, unitItems] = await Promise.all([suplementosService.listByCliente(user.clienteId), unidadesService.list()]);
      setRecords(assigned);
      setUnits(unitItems);
      try { setOrientation(await saludService.orientation(user.clienteId)); }
      catch { setOrientation(null); }
    }
    catch (cause) { setError(errorMessage(cause)); } finally { setLoading(false); }
  }, [user?.clienteId]);
  useEffect(() => { void load(); }, [load]);

  const invalidDates = Boolean(form.fechaFin && (form.fechaFin < form.fechaInicio || (form.fechaFin !== editing?.fechaFin && form.fechaFin < localDate())));
  const amountError = numericError(form.cantidadPorToma, true);
  const complete = Boolean(form.nombre.trim() && form.nombre.trim().length <= 255 && !amountError && units.some(u => u.codigo === form.unidadCodigo) && COMPONENT_FIELDS.every(key => !numericError(form[key])) && form.fechaInicio && !invalidDates);
  const update = (field: keyof SupplementForm, value: string) => setForm(current => ({ ...current, [field]: value }));

  const close = () => { if (saveInFlight.current) return; setOpen(false); setEditing(null); setForm(emptyForm()); };
  const startEdit = async (record: SuplementoClienteResponse) => {
    setEditing(record); setOpen(true); setError("");
    setForm({ suplementoId: String(record.suplementoId), nombre: record.nombre, cantidadPorToma: String(record.cantidadPorToma ?? record.cantidad), unidadCodigo: record.unidadCodigo ?? record.unidad, proteinaGPorToma: String(record.proteinaGPorToma ?? ""), carbohidratosGPorToma: String(record.carbohidratosGPorToma ?? ""), grasasGPorToma: String(record.grasasGPorToma ?? ""), creatinaGPorToma: String(record.creatinaGPorToma ?? ""), cafeinaMgPorToma: String(record.cafeinaMgPorToma ?? ""), sodioMgPorToma: String(record.sodioMgPorToma ?? ""), tiempoUso: record.tiempoUso ?? "", activo: record.activo ? "true" : "false", fechaInicio: record.fechaInicio, fechaFin: record.fechaFin ?? "" });
  };
  const save = async () => {
    if (saveInFlight.current || !user?.clienteId || !complete) return;
    const cantidad = Number(form.cantidadPorToma);
    const fechaInicio = editing ? editing.fechaInicio : localDate();
    const data: SuplementoActualizacionRequest = { nombreSuplemento: form.nombre.trim(), cantidad, unidad: form.unidadCodigo, frecuencia: null, tiempoUso: timeUseText(fechaInicio, form.fechaFin), activo: editing ? form.activo === "true" : true, fechaInicio, fechaFin: editing ? form.fechaFin || null : null, cantidadPorToma: cantidad, unidadCodigo: form.unidadCodigo, tomasPorPeriodo: null, periodoFrecuencia: null, componentesDeclarados: compositionText(form), energiaKcalPorToma: null, proteinaGPorToma: optionalComponent(form.proteinaGPorToma), carbohidratosGPorToma: optionalComponent(form.carbohidratosGPorToma), grasasGPorToma: optionalComponent(form.grasasGPorToma), creatinaGPorToma: optionalComponent(form.creatinaGPorToma), cafeinaMgPorToma: optionalComponent(form.cafeinaMgPorToma), sodioMgPorToma: optionalComponent(form.sodioMgPorToma) };
    saveInFlight.current = true;
    setSaving(true); setError("");
    try { if (editing) await suplementosService.update(user.clienteId, editing.suplementoId, data); else await suplementosService.create(user.clienteId, { suplementoId: null, ...data }); setOpen(false); setEditing(null); setForm(emptyForm()); await load(); }
    catch (cause) { setError(errorMessage(cause)); } finally { saveInFlight.current = false; setSaving(false); }
  };
  const activeCount = records.filter(item => item.activo).length;

  return <div>
    <SectionHeader title="Mis suplementos" subtitle="Catálogo personal — qué productos utilizas habitualmente. El consumo diario se registra en Mi alimentación." action={<button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-xl bg-[#173c36] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#225148]"><Plus size={14} /> Añadir suplemento</button>} />
    <OperationNotice message={error}/>

    <Card className="mb-4 overflow-hidden border-emerald-100 p-0">
      <div className="flex items-start gap-3 border-b border-emerald-100 bg-emerald-50/70 p-4">
        <ShieldCheck className="mt-0.5 shrink-0 text-emerald-700" size={20} />
        <div><h2 className="text-sm font-semibold text-slate-900">Orientación inteligente de suplementación</h2><p className="mt-1 text-xs leading-5 text-slate-600">Separa posibles apoyos, componentes sin necesidad demostrada y opciones que debes evitar o revisar. No diagnostica ni prescribe.</p></div>
      </div>
      {!orientation ? <p className="p-4 text-xs text-slate-500">No se pudo consultar la orientación en este momento.</p> : !orientation.disponible ? <div className="p-4"><p className="text-sm font-medium text-slate-800">Completa tu perfil de salud</p><p className="mt-1 text-xs text-slate-500">{orientation.motivoNoDisponible}</p><button onClick={() => navigate("/register?salud=1")} className="mt-3 rounded-lg bg-[#173c36] px-3 py-2 text-xs font-semibold text-white">Completar salud y seguridad</button></div> : <div className="space-y-4 p-4">
        {orientation.alertasSalud.length > 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3"><p className="text-xs font-semibold text-amber-900">Revisión de seguridad</p>{orientation.alertasSalud.map(alerta => <p key={alerta} className="mt-1 text-xs leading-5 text-amber-800">• {alerta}</p>)}</div>}
        <div className="grid gap-3 lg:grid-cols-3">
          <OrientationGroup icon={<Sparkles size={16}/>} title="Podrían apoyar tu objetivo" empty="No hay candidatos con evidencia suficiente." items={orientation.posiblesApoyos} tone="emerald" />
          <OrientationGroup icon={<Pill size={16}/>} title="No parecen necesarios" empty="No hay resultados en esta categoría." items={orientation.noNecesarios} tone="slate" />
          <OrientationGroup icon={<Ban size={16}/>} title="Evitar o revisar" empty="No se detectaron bloqueos específicos." items={orientation.evitarORevisar} tone="rose" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-400"><span>Reglas {orientation.versionReglas} · {orientation.explicacionIaDisponible ? "Explicación personalizada por IA" : "Explicación segura del backend"}</span><button onClick={() => navigate("/register?salud=1")} className="font-semibold text-teal-700 hover:underline">Actualizar datos de salud</button></div>
      </div>}
    </Card>

    {/* Explicación conexión — §12 */}
    <Card className="mb-4 border-indigo-100 bg-indigo-50/40 p-4">
      <p className="text-xs font-semibold text-indigo-800">¿Cómo se usa?</p>
      <p className="mt-1 text-xs leading-5 text-indigo-700/80">Registra tu producto <strong>una vez aquí</strong>. Luego en <button onClick={() => navigate("/client/habitos")} className="font-semibold underline">Mi alimentación → Registrar consumo → Suplemento</button> podrás seleccionar <em>{records[0]?.nombre ?? "Whey Protein, Creatina…"}</em> y registrar <em>¿Cuánto consumiste? 30 g</em> sin volver a escribir marca ni macros. El sistema usa la composición ya persistida.</p>
    </Card>

    <AppModal open={open} onOpenChange={value => { if (!value) close(); else setOpen(true); }} title={editing ? "Editar suplemento" : "Añadir suplemento"} description="Registra el nombre y toda la composición declarada en la etiqueta del suplemento." className="sm:max-w-3xl" footer={<><button onClick={close} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">Cancelar</button><button onClick={() => void save()} disabled={!complete || saving} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45">{saving ? "Guardando..." : "Guardar"}</button></>}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Nombre del suplemento"><input aria-label="Nombre del suplemento" value={form.nombre} onChange={event => update("nombre", event.target.value)} maxLength={255} className={inputClass} placeholder="Ej.: Whey Protein, Creatina monohidratada" /></Field>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs leading-5 text-indigo-800">Ingresa la información tal como figura en la etiqueta. Esta composición quedará asociada a tu suplemento y se reutilizará en el registro diario.</div>
        <Field label="Tamaño de una porción según la etiqueta"><input aria-label="Tamaño de una porción según la etiqueta" aria-invalid={!!amountError} type="number" min="0.0001" step="0.0001" value={form.cantidadPorToma} onChange={event => update("cantidadPorToma", event.target.value)} className={inputClass} placeholder="Ej. 30 (whey), 5 (creatina), 1 (cápsula)" />{form.cantidadPorToma && amountError && <p role="alert" className="mt-1 text-xs text-rose-700">{amountError}</p>}</Field>
        <Field label="Unidad"><select aria-label="Unidad canónica" value={form.unidadCodigo} onChange={event => update("unidadCodigo", event.target.value)} className={inputClass}><option value="">Seleccionar unidad</option>{units.map(unit => <option key={unit.codigo} value={unit.codigo}>{unit.nombre} ({unit.codigo}) — ej. g, mg, µg, ml</option>)}</select></Field>
        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 md:col-span-2"><p className="text-xs font-semibold text-amber-800">Componentes presentes en esa porción (opcionales)</p><p className="mt-1 text-[11px] text-amber-700">Completa solo lo que conoces de la etiqueta. Deja vacío si no hay información; escribe 0 únicamente si confirmas que no lo contiene. Los datos desconocidos no permiten descartar exceso.</p><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{[["proteinaGPorToma","Proteína (g)"],["carbohidratosGPorToma","Carbos (g)"],["grasasGPorToma","Grasas (g)"],["creatinaGPorToma","Creatina (g)"],["cafeinaMgPorToma","Cafeína (mg)"],["sodioMgPorToma","Sodio (mg)"]].map(([key,label]) => <label key={key}><span className="text-[11px] text-slate-600">{label}</span><input aria-label={label} aria-invalid={!!numericError(form[key as keyof SupplementForm])} type="number" min="0" step="0.0001" value={form[key as keyof SupplementForm]} onChange={event => update(key as keyof SupplementForm, event.target.value)} placeholder="Sin dato" className={inputClass} />{numericError(form[key as keyof SupplementForm]) && <p role="alert" className="mt-1 text-xs text-rose-700">{numericError(form[key as keyof SupplementForm])}</p>}</label>)}</div></div>
        <Field label="Fecha de registro"><input aria-label="Fecha de registro del suplemento" type="date" value={editing ? form.fechaInicio : localDate()} disabled className={inputClass} /></Field>
        {editing && <Field label="Fecha de fin (opcional)"><input aria-label="Fecha de fin" type="date" min={localDate()} value={form.fechaFin} onChange={event => update("fechaFin", event.target.value)} className={inputClass} /></Field>}
        {editing ? <Field label="Uso actual"><button type="button" onClick={() => setForm(current => ({ ...current, activo: current.activo === "true" ? "false" : "true", fechaFin: current.activo === "true" ? localDate() : "" }))} className="rounded-lg border px-3 py-2 text-xs">{form.activo === "true" ? "Pasar a inactivo" : "Reactivar suplemento"}</button><span className="ml-2 text-xs text-slate-500">{form.activo === "true" ? "Activo" : "Inactivo"} · se aplica al guardar</span></Field> : <p className="text-xs text-teal-700">Se registrará automáticamente como activo desde hoy.</p>}</div>
      {invalidDates && <p role="alert" className="mt-3 text-xs text-rose-600">La nueva fecha de fin no puede ser anterior a hoy ni a la fecha de inicio.</p>}
      {!complete && !invalidDates && <p className="mt-3 text-xs text-amber-700">Completa el nombre, una porción válida y la unidad. Los componentes pueden quedar vacíos.</p>}
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
              <p className="text-slate-500">Macros: <span className="font-medium text-slate-800">P {record.proteinaGPorToma ?? "sin dato"} g · C {record.carbohidratosGPorToma ?? "sin dato"} g · G {record.grasasGPorToma ?? "sin dato"} g</span></p>
              <p className="text-slate-500">Otros: <span className="font-medium text-slate-800">Creatina {record.creatinaGPorToma ?? "sin dato"} g · Cafeína {record.cafeinaMgPorToma ?? "sin dato"} mg · Sodio {record.sodioMgPorToma ?? "sin dato"} mg</span></p>
              <p className="flex justify-between"><span className="text-slate-500">Periodo</span><span className="font-medium text-slate-800">{record.fechaInicio} → {record.fechaFin || "actualidad"}</span></p>
            </div>
            <div className="mt-3 flex gap-1">
              <button aria-label={`Editar ${record.nombre}`} onClick={() => void startEdit(record)} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"><Edit2 size={12} /> Editar</button>
            </div>
            <button onClick={() => navigate("/client/habitos")} className="mt-2 flex items-center justify-center gap-1 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"><Utensils size={12}/> Usar en Mi alimentación</button>
          </Card>
        ))}
      </div>
    )}

  </div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block"><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-600">{label}</span>{children}</label>; }

function OrientationGroup({ icon, title, empty, items, tone }: { icon: ReactNode; title: string; empty: string; items: OrientacionSuplementoItem[]; tone: "emerald" | "slate" | "rose" }) {
  const tones = { emerald: "border-emerald-100 bg-emerald-50/40 text-emerald-800", slate: "border-slate-200 bg-slate-50 text-slate-700", rose: "border-rose-100 bg-rose-50/50 text-rose-800" };
  return <section className={`rounded-xl border p-3 ${tones[tone]}`}><div className="flex items-center gap-2 text-xs font-semibold">{icon}{title}</div>{items.length === 0 ? <p className="mt-3 text-xs opacity-70">{empty}</p> : <div className="mt-3 space-y-2">{items.map(item => <article key={item.componente} className="rounded-lg border border-white/80 bg-white/80 p-3"><p className="text-xs font-semibold text-slate-900">{item.nombre}</p><p className="mt-1 text-[11px] font-medium text-slate-600">{item.motivo}</p><p className="mt-1 text-[11px] leading-4 text-slate-500">{item.explicacion}</p><a href={item.fuenteUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[10px] font-medium text-teal-700 hover:underline">Fuente: {item.fuente}</a></article>)}</div>}</section>;
}
