import { useState } from "react";
import { Search, Filter, Download, Plus, Eye, Edit2, Settings } from "lucide-react";
import { Badge, StateBadge, SectionHeader, Card } from "../../../components/shared";
import { clients } from "../../../data/mock-data";

export default function AdminClientesPage() {
  const [search, setSearch] = useState("");
  const filtered = clients.filter(c => c.nombre.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <SectionHeader
        title="Gestión de clientes"
        subtitle="248 clientes registrados en el sistema"
        action={
          <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 rounded-lg text-white text-sm font-semibold hover:bg-teal-700 transition-colors">
            <Plus size={14} /> Nuevo cliente
          </button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50">
          <Filter size={13} /> Filtrar
        </button>
        <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50">
          <Download size={13} /> Exportar
        </button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              {["Cliente", "Edad", "Estado", "Última evaluación", "Conocimiento nutr.", "Consumo suplementos", "Resultado", "Acciones"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {c.nombre.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-800">{c.nombre}</div>
                      <div className="text-[10px] text-slate-400">ID #{String(c.id).padStart(4, "0")}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{c.edad} años</td>
                <td className="px-5 py-3.5"><StateBadge estado={c.estado} /></td>
                <td className="px-5 py-3.5 text-sm text-slate-500">{c.ultimaEval}</td>
                <td className="px-5 py-3.5">
                  {c.conocimiento === "—" ? <span className="text-slate-300 text-xs">—</span> :
                    <Badge label={c.conocimiento} variant={c.conocimiento === "Alto" ? "success" : c.conocimiento === "Medio" ? "warning" : "danger"} />}
                </td>
                <td className="px-5 py-3.5">
                  {c.consumo === "—" ? <span className="text-slate-300 text-xs">—</span> :
                    <Badge label={c.consumo} variant={c.consumo === "Bajo" ? "success" : c.consumo === "Moderado" ? "warning" : "danger"} />}
                </td>
                <td className="px-5 py-3.5">
                  <Badge label={c.resultado} variant={c.resultado === "Favorable" ? "success" : c.resultado === "Crítico" ? "danger" : c.resultado === "Sin evaluar" ? "neutral" : "warning"} />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded hover:bg-teal-50 text-slate-400 hover:text-teal-600 transition-colors" title="Ver detalle"><Eye size={13} /></button>
                    <button className="p-1.5 rounded hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors" title="Editar"><Edit2 size={13} /></button>
                    <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="Gestionar"><Settings size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">Mostrando {filtered.length} de 248 clientes</div>
          <div className="flex gap-1">
            {[1, 2, 3, "...", 35].map((p, i) => (
              <button key={i} className={`w-7 h-7 rounded text-xs font-medium ${p === 1 ? "bg-teal-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
