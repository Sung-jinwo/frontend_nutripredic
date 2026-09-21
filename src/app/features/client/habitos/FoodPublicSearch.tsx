import { useEffect, useRef, useState } from "react";
import { alimentacionService, type AlimentoUsda, type AlimentoUsoResponse, type AlimentoCatalogoResponse } from "../../../services/alimentacion.service";
import { ApiError } from "../../../services/api";
import { toast } from "../../../services/notifications";

interface Props {
  value: string; selected: boolean; onChange: (value: string) => void;
  recent: AlimentoUsoResponse[]; frequent: AlimentoUsoResponse[]; catalog: AlimentoCatalogoResponse[];
  onSelect: (food: AlimentoUsda) => void; onSaved: (food: AlimentoUsoResponse) => void;
  onCatalog: (food: AlimentoCatalogoResponse) => void;
}
const normalized = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function FoodPublicSearch({ value, selected, onChange, recent, frequent, catalog, onSelect, onSaved, onCatalog }: Props) {
  const [results, setResults] = useState<AlimentoUsda[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [searched, setSearched] = useState(false);
  const [failed, setFailed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const cache = useRef(new Map<string, AlimentoUsda[]>());
  useEffect(() => {
    let active = true;
    setResults([]); setSearched(false); setFailed(false); setLoading(false); setActiveIndex(-1);
    if (selected || value.trim().length < 2 || value.trim().length > 100) return;
    const key = value.trim();
    if (cache.current.has(key)) { setResults(cache.current.get(key)!); setSearched(true); return; }
    setLoading(true);
    const timer = setTimeout(() => {
      void alimentacionService.searchUsda(key).then(foods => {
        if (!active) return;
        if (cache.current.size >= 30) cache.current.clear();
        cache.current.set(key, foods); setResults(foods); setSearched(true);
      }).catch(cause => {
        if (!active) return;
        setFailed(true);
        toast.error(cause instanceof ApiError && (cause.status === 404 || cause.status === 500)
          ? "La búsqueda de alimentos no está disponible. Actualiza o reinicia el backend y vuelve a intentar."
          : cause instanceof Error ? cause.message : "No se pudo buscar alimentos.", { id: "food-autocomplete-error" });
      }).finally(() => { if (active) setLoading(false); });
    }, 850);
    return () => { active = false; clearTimeout(timer); };
  }, [value, selected]);
  const query = normalized(value.trim());
  const saved = [...new Map([...recent, ...frequent].map(food => [normalized(food.nombre), food])).values()]
    .filter(food => !query || normalized(food.nombre).includes(query)).slice(0, 6);
  const local = catalog.filter(food => (!query || normalized(food.nombre).includes(query)) && !saved.some(s => s.alimentoId === food.id)).slice(0, 12);
  const options = [
    ...saved.map(food => ({ key: "saved-" + food.nombre, name: food.nombre, detail: "Guardado · " + food.ultimaCantidad + " " + food.ultimaUnidad, choose: () => onSaved(food) })),
    ...local.map(food => ({ key: "catalog-" + food.id, name: food.nombre, detail: food.proteinaG != null && food.carbohidratosG != null && food.grasasG != null
      ? "Por " + food.cantidadReferencia + " " + food.unidadReferencia + ": P " + food.proteinaG + " · C " + food.carbohidratosG + " · G " + food.grasasG
      : "Catálogo · composición por completar", choose: () => onCatalog(food) })),
    ...results.map(food => ({ key: "usda-" + food.fdcId, name: food.nombre, detail: "USDA · por 100 g: P " + food.proteinaG + " · C " + food.carbohidratosG + " · G " + food.grasasG, choose: () => onSelect(food) })),
  ];
  const expanded = focused && !selected;
  const choose = (index: number) => { options[index]?.choose(); setFocused(false); setActiveIndex(-1); };
  return <div className="relative" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}>
    <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Nombre de la comida</span>
      <input role="combobox" aria-label="Nombre de la comida" aria-autocomplete="list" aria-expanded={expanded} aria-controls="food-search-options" aria-activedescendant={expanded && activeIndex >= 0 ? "food-option-" + activeIndex : undefined}
        value={value} maxLength={200} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} placeholder="Escribe para buscar, ej. arroz cocido"
        onKeyDown={e => {
          if (e.key === "ArrowDown") { e.preventDefault(); setFocused(true); setActiveIndex(i => Math.min(i + 1, options.length - 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
          if (e.key === "Enter" && expanded && activeIndex >= 0) { e.preventDefault(); choose(activeIndex); }
          if (e.key === "Escape") setFocused(false);
        }} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800" />
    </label>
    {expanded && <div id="food-search-options" role="listbox" aria-label="Comidas encontradas" className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
      {loading && <p role="status" className="px-3 py-2 text-xs text-slate-500">Buscando alimentos…</p>}
      {options.map((option, i) => <button type="button" role="option" aria-selected={activeIndex === i} id={"food-option-" + i} key={option.key} onMouseDown={e => e.preventDefault()} onClick={() => choose(i)} className={"block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-teal-50 " + (activeIndex === i ? "bg-teal-50" : "")}><span className="block font-semibold text-slate-800">{option.name}</span><span className="text-slate-500">{option.detail}</span></button>)}
      {options.length === 0 && !loading && <p className="px-3 py-2 text-xs text-slate-500">{failed ? "La fuente pública no está disponible; puedes registrar manualmente datos verificados." : searched ? "No hay coincidencias con los tres nutrientes. Prueba otra preparación o usa datos verificados." : "Escribe al menos dos caracteres para buscar."}</p>}
    </div>}
    <p className="mt-1 text-xs text-slate-500">Selecciona una coincidencia para cargar nutrientes. Para una receta no encontrada, usa datos verificados. USDA conserva los nombres originales en inglés.</p>
  </div>;
}
