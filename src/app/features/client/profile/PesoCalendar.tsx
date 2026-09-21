import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { RegistroPeso } from "../../../services/peso-semanal.service";

export function PesoCalendar({ registros, proximaFecha, historialDisponible = true, cargando = false }: { registros: RegistroPeso[]; proximaFecha?: string; historialDisponible?: boolean; cargando?: boolean }) {
  const [mes, setMes] = useState(() => {
    const lima = new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });
    return lima.slice(0, 7);
  });
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [year, month] = mes.split("-").map(Number);
  const inicio = new Date(year, month - 1, 1);
  const offset = (inicio.getDay() + 6) % 7;
  const dias = new Date(year, month, 0).getDate();
  const porFecha = new Map(registros.map(r => [r.fechaMedicion, r]));
  const elegido = seleccion ? porFecha.get(seleccion) : null;
  const cambiar = (delta: number) => {
    const fecha = new Date(year, month - 1 + delta, 1);
    setMes(`${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`);
    setSeleccion(null);
  };
  return <section className="mt-5 border-t border-slate-100 pt-5" aria-label="Calendario de pesos registrados">
    <div className="mb-3 flex items-center justify-between gap-2"><h5 className="text-sm font-semibold text-slate-800">Historial de peso</h5><div className="flex items-center gap-3"><button type="button" aria-label="Mes anterior" onClick={() => cambiar(-1)} className="rounded-lg border p-2"><ChevronLeft size={16}/></button><span aria-live="polite" className="text-xs capitalize text-slate-700">{inicio.toLocaleDateString("es-PE", { month: "long", year: "numeric" })}</span><button type="button" aria-label="Mes siguiente" onClick={() => cambiar(1)} className="rounded-lg border p-2"><ChevronRight size={16}/></button></div></div>
    <p className="mb-3 text-xs text-slate-500">Selecciona una medición para ver su peso y variación. El borde discontinuo indica la próxima fecha habilitada, no una medición.</p>
    <div className="grid grid-cols-7 gap-1 sm:gap-2">{["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(d => <span key={d} className="py-1 text-center text-xs text-slate-500">{d}</span>)}
      {Array.from({ length: offset }, (_, i) => <span key={`vacio-${i}`}/>)}
      {Array.from({ length: dias }, (_, i) => {
        const dia = i + 1;
        const fecha = `${mes}-${String(dia).padStart(2, "0")}`;
        const registro = porFecha.get(fecha);
        const clases = `min-h-14 rounded-lg border p-1 text-center text-xs sm:min-h-16 ${registro ? "border-teal-200 bg-teal-50 text-teal-900" : fecha === proximaFecha ? "border-dashed border-teal-500 text-slate-600" : "border-slate-100 text-slate-400"} ${seleccion === fecha ? "ring-2 ring-teal-600" : ""}`;
        return registro ? <button type="button" key={fecha} onClick={() => setSeleccion(fecha)} aria-pressed={seleccion === fecha} aria-label={`${fecha}: ${registro.pesoKg} kg`} className={clases}><span className="block">{dia}</span><span className="mt-1 block font-semibold">{registro.pesoKg} kg</span></button> : <div key={fecha} className={clases}>{dia}</div>;
      })}
    </div>
    {elegido && <div aria-live="polite" className="mt-3 rounded-xl bg-teal-50 p-3 text-sm text-teal-900"><p className="font-semibold">{new Date(`${elegido.fechaMedicion}T12:00:00`).toLocaleDateString("es-PE", { dateStyle: "long" })}: {elegido.pesoKg} kg</p><p className="mt-1 text-xs">Variación respecto a la referencia anterior: {elegido.variacionKg == null ? "Sin referencia" : `${elegido.variacionKg > 0 ? "+" : ""}${elegido.variacionKg} kg`}{elegido.variacionPorcentual != null ? ` (${elegido.variacionPorcentual} % absoluto)` : ""}.</p></div>}
    {!cargando && !historialDisponible && <p className="mt-3 text-xs text-slate-500">No se pudo actualizar el historial. Solo se muestran las mediciones previamente cargadas, si existen.</p>}
    {!cargando && historialDisponible && !registros.some(r => r.fechaMedicion.startsWith(mes)) && <p className="mt-3 text-xs text-slate-500">No hay mediciones guardadas en este mes.</p>}
  </section>;
}
