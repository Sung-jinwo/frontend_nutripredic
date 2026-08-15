import { useState } from "react";
import { Plus, X, Calendar, Utensils, Droplets, Sun, Coffee } from "lucide-react";
import { Badge, SectionHeader, Card } from "../../../components/shared";
import { FONT_HEADING, FONT_MONO } from "../../../types";
import type { SupplementoRegreso, DailyHabitRecord } from "../../../types";

const H = FONT_HEADING;
const MONO = FONT_MONO;

export default function ClientHabitosPage() {
  const [showForm, setShowForm] = useState(false);
  const [registroActual, setRegistroActual] = useState<Partial<DailyHabitRecord>>({});
  const [suplementosRegreso, setSuplementosRegreso] = useState<SupplementoRegreso[]>([]);
  const [nuevoSuplemento, setNuevoSuplemento] = useState<Partial<SupplementoRegreso>>({});

  const ultimosDias: DailyHabitRecord[] = [
    {
      fecha: "2026-06-15",
      comidas: 4,
      agua: 8,
      desayuno: true,
      snacks: 2,
      proteinas: "medio",
      tipoAlim: "omnivora",
      organizacion: 4,
      comidasCocinadas: "mayoria",
      alimentos: ["verduras", "frutas", "granos"],
      restricciones: ["gluten"],
      suplementos: [{ nombre: "Proteína Whey", cantidad: 30, unidad: "g" }],
    },
    {
      fecha: "2026-06-14",
      comidas: 3,
      agua: 6,
      desayuno: false,
      snacks: 1,
      proteinas: "alto",
      tipoAlim: "mixta",
      organizacion: 3,
      comidasCocinadas: "mixta",
      alimentos: ["carnes", "granos"],
      restricciones: [],
      suplementos: [{ nombre: "Creatina", cantidad: 5, unidad: "g" }],
    },
    {
      fecha: "2026-06-13",
      comidas: 5,
      agua: 10,
      desayuno: true,
      snacks: 3,
      proteinas: "medio",
      tipoAlim: "vegetariana",
      organizacion: 5,
      comidasCocinadas: "mayoria",
      alimentos: ["verduras", "frutas", "legumbres", "granos"],
      restricciones: ["lactosa", "gluten"],
      suplementos: [
        { nombre: "Proteína Whey", cantidad: 30, unidad: "g" },
        { nombre: "Multivitamínico", cantidad: 1, unidad: "caps" },
      ],
    },
  ];

  const cargarRegistroDelDia = (record: DailyHabitRecord) => {
    setRegistroActual(record);
    setSuplementosRegreso(record.suplementos || []);
    setShowForm(true);
  };

  const agregarSuplementoRegreso = () => {
    if (nuevoSuplemento.nombre && nuevoSuplemento.cantidad && nuevoSuplemento.unidad) {
      setSuplementosRegreso([...suplementosRegreso, nuevoSuplemento as SupplementoRegreso]);
      setNuevoSuplemento({});
    }
  };

  const eliminarSuplementoRegreso = (idx: number) => {
    setSuplementosRegreso(suplementosRegreso.filter((_, i) => i !== idx));
  };

  const guardarRegistro = () => {
    console.log("Guardando registro:", { ...registroActual, suplementos: suplementosRegreso });
    setShowForm(false);
    setRegistroActual({});
    setSuplementosRegreso([]);
  };

  return (
    <div>
      <SectionHeader
        title="Mis Hábitos Alimenticios"
        subtitle="Registra y consulta tus hábitos diarios"
        action={
          <button
            onClick={() => { setShowForm(true); setRegistroActual({}); setSuplementosRegreso([]); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
          >
            <Plus size={14} /> Nuevo registro
          </button>
        }
      />

      {showForm && (
        <Card className="p-5 mb-4 border-teal-200 bg-teal-50/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 text-sm" style={H}>Registro de hábitos del día</h3>
            <button onClick={() => { setShowForm(false); setRegistroActual({}); setSuplementosRegreso([]); }}>
              <X size={16} className="text-slate-400 hover:text-slate-600" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Comidas al día</label>
              <select
                value={registroActual.comidas || ""}
                onChange={e => setRegistroActual({ ...registroActual, comidas: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 text-xs"
              >
                <option value="">Seleccionar</option>
                <option value="1">1 comida</option>
                <option value="2">2 comidas</option>
                <option value="3">3 comidas</option>
                <option value="4">4 comidas</option>
                <option value="5">5+ comidas</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Vasos de agua</label>
              <select
                value={registroActual.agua || ""}
                onChange={e => setRegistroActual({ ...registroActual, agua: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 text-xs"
              >
                <option value="">Seleccionar</option>
                {[...Array(13)].map((_, i) => (
                  <option key={i} value={i}>{i} vasos</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Desayuno</label>
              <select
                value={registroActual.desayuno === undefined ? "" : registroActual.desayuno ? "si" : "no"}
                onChange={e => setRegistroActual({ ...registroActual, desayuno: e.target.value === "si" })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 text-xs"
              >
                <option value="">Seleccionar</option>
                <option value="si">Sí desayuno</option>
                <option value="no">No desayuno</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Snacks</label>
              <select
                value={registroActual.snacks || ""}
                onChange={e => setRegistroActual({ ...registroActual, snacks: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 text-xs"
              >
                <option value="">Seleccionar</option>
                <option value="0">0 snacks</option>
                <option value="1">1 snack</option>
                <option value="2">2 snacks</option>
                <option value="3">3 snacks</option>
                <option value="4">4+ snacks</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Nivel de proteínas</label>
              <select
                value={registroActual.proteinas || ""}
                onChange={e => setRegistroActual({ ...registroActual, proteinas: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 text-xs"
              >
                <option value="">Seleccionar</option>
                <option value="bajo">Bajo</option>
                <option value="medio">Medio</option>
                <option value="alto">Alto</option>
                <option value="muy_alto">Muy alto</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Tipo alimentación</label>
              <select
                value={registroActual.tipoAlim || ""}
                onChange={e => setRegistroActual({ ...registroActual, tipoAlim: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 text-xs"
              >
                <option value="">Seleccionar</option>
                <option value="omnivora">Omnívora</option>
                <option value="vegetariana">Vegetariana</option>
                <option value="vegana">Vegana</option>
                <option value="mixta">Mixta</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Organización (1-5)</label>
              <select
                value={registroActual.organizacion || ""}
                onChange={e => setRegistroActual({ ...registroActual, organizacion: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 text-xs"
              >
                <option value="">Seleccionar</option>
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n} - {n === 1 ? "Muy baja" : n === 2 ? "Baja" : n === 3 ? "Media" : n === 4 ? "Buena" : "Excelente"}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Comidas cocinadas</label>
              <select
                value={registroActual.comidasCocinadas || ""}
                onChange={e => setRegistroActual({ ...registroActual, comidasCocinadas: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 text-xs"
              >
                <option value="">Seleccionar</option>
                <option value="mayoria">Mayoría en casa</option>
                <option value="mixta">Mixta</option>
                <option value="mayoria_comprada">Mayoría comprada</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[10px] font-semibold text-slate-600 mb-2 uppercase tracking-wide">Alimentos frecuentes</label>
            <div className="flex flex-wrap gap-2">
              {["verduras", "frutas", "granos", "lacteos", "carnes", "pescado", "legumbres", "ultraprocesados"].map(al => (
                <button
                  key={al}
                  onClick={() => {
                    const current = registroActual.alimentos || [];
                    setRegistroActual({
                      ...registroActual,
                      alimentos: current.includes(al) ? current.filter(a => a !== al) : [...current, al],
                    });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    (registroActual.alimentos || []).includes(al)
                      ? "bg-teal-50 border-teal-300 text-teal-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {al.charAt(0).toUpperCase() + al.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[10px] font-semibold text-slate-600 mb-2 uppercase tracking-wide">Restricciones alimentarias</label>
            <div className="flex flex-wrap gap-2">
              {["gluten", "lactosa", "mariscos", "frutos_secos", "huevo", "soya", "pescado"].map(r => (
                <button
                  key={r}
                  onClick={() => {
                    const current = registroActual.restricciones || [];
                    setRegistroActual({
                      ...registroActual,
                      restricciones: current.includes(r) ? current.filter(x => x !== r) : [...current, r],
                    });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    (registroActual.restricciones || []).includes(r)
                      ? "bg-red-50 border-red-300 text-red-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {r === "gluten" ? "Sin gluten" : r === "lactosa" ? "Sin lactosa" : r === "mariscos" ? "Sin mariscos" : r === "frutos_secos" ? "Sin f. secos" : r === "huevo" ? "Sin huevo" : r === "soya" ? "Sin soya" : "Sin pescado"}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wide">Suplementos consumidos hoy</label>
              <button
                onClick={agregarSuplementoRegreso}
                disabled={!nuevoSuplemento.nombre || !nuevoSuplemento.cantidad || !nuevoSuplemento.unidad}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                + Agregar suplemento
              </button>
            </div>

            {suplementosRegreso.length > 0 && (
              <div className="space-y-2 mb-3">
                {suplementosRegreso.map((sup, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                    <span className="text-xs text-slate-700 flex-1">
                      {sup.nombre} - {sup.cantidad} {sup.unidad}
                    </span>
                    <button onClick={() => eliminarSuplementoRegreso(idx)} className="text-slate-400 hover:text-rose-500">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <input
                placeholder="Nombre del suplemento"
                value={nuevoSuplemento.nombre || ""}
                onChange={e => setNuevoSuplemento({ ...nuevoSuplemento, nombre: e.target.value })}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 text-xs"
              />
              <input
                placeholder="Cantidad"
                type="number"
                value={nuevoSuplemento.cantidad || ""}
                onChange={e => setNuevoSuplemento({ ...nuevoSuplemento, cantidad: parseFloat(e.target.value) })}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 text-xs"
              />
              <select
                value={nuevoSuplemento.unidad || ""}
                onChange={e => setNuevoSuplemento({ ...nuevoSuplemento, unidad: e.target.value })}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 text-xs"
              >
                <option value="">Unidad</option>
                <option value="g">gramos (g)</option>
                <option value="mg">miligramos (mg)</option>
                <option value="caps">cápsulas</option>
                <option value="tabs">tabletas</option>
                <option value="ml">mililitros (ml)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setShowForm(false); setRegistroActual({}); setSuplementosRegreso([]); }}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={guardarRegistro}
              className="px-4 py-2 bg-teal-600 rounded-lg text-sm text-white font-semibold hover:bg-teal-700"
            >
              Guardar registro
            </button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { icon: Calendar, label: "Días registrados", val: "3", iconBg: "bg-teal-500" },
          { icon: Utensils, label: "Promedio comidas", val: "4.0", iconBg: "bg-indigo-500" },
          { icon: Droplets, label: "Promedio agua", val: "8.0 vasos", iconBg: "bg-sky-500" },
          { icon: Sun, label: "Días con desayuno", val: "2/3", iconBg: "bg-yellow-500" },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.iconBg}`}>
                <s.icon size={16} className="text-white" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-medium">{s.label}</div>
                <div className="text-lg font-bold text-slate-800" style={MONO}>{s.val}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-slate-800 text-sm mb-3" style={H}>Últimos registros</h3>
        <div className="space-y-3">
          {ultimosDias.map((record) => {
            const fechaObj = new Date(record.fecha + "T12:00:00");
            const hoy = new Date();
            const ayer = new Date(hoy);
            ayer.setDate(ayer.getDate() - 1);

            const esHoy = fechaObj.toDateString() === hoy.toDateString();
            const esAyer = fechaObj.toDateString() === ayer.toDateString();
            const labelFecha = esHoy ? "Hoy" : esAyer ? "Ayer" : "Anterior";

            const proteinasLabel = {
              bajo: "Bajo",
              medio: "Medio",
              alto: "Alto",
              muy_alto: "Muy alto"
            }[record.proteinas] || record.proteinas;

            const tipoAlimLabel = {
              omnivora: "Omnívora",
              vegetariana: "Vegetariana",
              vegana: "Vegana",
              mixta: "Mixta"
            }[record.tipoAlim] || record.tipoAlim;

            const comidasCocinadasLabel = {
              mayoria: "Casera",
              mixta: "Mixta",
              mayoria_comprada: "Comprada"
            }[record.comidasCocinadas] || "Mixta";

            const alimentosMap: Record<string, string> = {
              verduras: "Verduras",
              frutas: "Frutas",
              granos: "Granos",
              lacteos: "Lácteos",
              carnes: "Carnes",
              pescado: "Pescado",
              legumbres: "Legumbres",
              ultraprocesados: "Ultraprocesados"
            };

            const restriccionesMap: Record<string, string> = {
              gluten: "Sin gluten",
              lactosa: "Sin lactosa",
              mariscos: "Sin mariscos",
              frutos_secos: "Sin f.secos",
              huevo: "Sin huevo",
              soya: "Sin soya",
              pescado: "Sin pescado"
            };

            return (
              <div key={record.fecha} className="bg-white border border-slate-100 rounded-lg p-4 hover:border-teal-200 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="font-semibold text-slate-800 text-sm">
                        {fechaObj.toLocaleDateString("es-ES", { weekday: "short", month: "short", day: "numeric" })}
                      </div>
                      <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded">
                        {labelFecha}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <Utensils size={13} className="text-teal-600" />
                        <span className="text-slate-600"><span className="font-semibold text-slate-800">{record.comidas}</span> comidas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Droplets size={13} className="text-sky-500" />
                        <span className="text-slate-600"><span className="font-semibold text-slate-800">{record.agua}</span> vasos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sun size={13} className={record.desayuno ? "text-yellow-500" : "text-slate-300"} />
                        <span className="text-slate-600">{record.desayuno ? "✓ Desayuno" : "✗ Sin desayuno"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Coffee size={13} className="text-orange-500" />
                        <span className="text-slate-600"><span className="font-semibold text-slate-800">{record.snacks}</span> snacks</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs mt-2">
                      <div className="text-slate-600">
                        Proteínas: <span className="font-semibold text-slate-800">{proteinasLabel}</span>
                      </div>
                      <div className="text-slate-600">
                        Tipo: <span className="font-semibold text-slate-800">{tipoAlimLabel}</span>
                      </div>
                      <div className="text-slate-600">
                        Organización: <span className="font-semibold text-slate-800">{record.organizacion}/5</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs mt-2">
                      <div className="text-slate-600">
                        Comidas: <span className="font-semibold text-slate-800">{comidasCocinadasLabel}</span>
                      </div>
                      <div className="text-slate-600">
                        Alimentos: <span className="font-semibold text-slate-800">{(record.alimentos?.length || 0) > 0 ? record.alimentos!.slice(0, 2).map(a => alimentosMap[a]).join(", ") + ((record.alimentos?.length || 0) > 2 ? `+${(record.alimentos?.length || 0) - 2}` : "") : "Ninguno"}</span>
                      </div>
                    </div>
                    {(record.restricciones?.length || 0) > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {record.restricciones!.slice(0, 3).map(r => (
                          <span key={r} className="inline-block bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded text-[10px] font-medium">
                            {restriccionesMap[r] || r}
                          </span>
                        ))}
                        {(record.restricciones?.length || 0) > 3 && (
                          <span className="inline-block text-slate-500 px-2 py-1 text-[10px]">+{(record.restricciones?.length || 0) - 3}</span>
                        )}
                      </div>
                    )}
                    {record.suplementos && record.suplementos.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {record.suplementos.slice(0, 3).map((sup, idx) => (
                          <span key={idx} className="inline-block bg-purple-50 border border-purple-200 text-purple-700 px-2 py-1 rounded text-[10px] font-medium">
                            {sup.nombre} ({sup.cantidad}{sup.unidad})
                          </span>
                        ))}
                        {(record.suplementos?.length || 0) > 3 && (
                          <span className="inline-block text-slate-500 px-2 py-1 text-[10px]">+{(record.suplementos?.length || 0) - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => cargarRegistroDelDia(record)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    Cargar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {ultimosDias.length === 0 && (
        <Card className="p-8 text-center mt-8 border-dashed">
          <Calendar size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium mb-1">Sin registros aún</p>
          <p className="text-slate-400 text-xs">Completa el formulario y guarda tu primer registro diario</p>
        </Card>
      )}
    </div>
  );
}
