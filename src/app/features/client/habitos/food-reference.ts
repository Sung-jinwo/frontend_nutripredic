import type { AlimentoCatalogoResponse, AlimentoUsoResponse } from "../../../services/alimentacion.service";
export interface FoodReference { cantidad: number; unidad: string; proteinaG: number; carbohidratosG: number; grasasG: number }
export function savedReference(food: AlimentoUsoResponse): FoodReference | null {
  if (!(food.ultimaCantidad > 0) || [food.ultimaProteinaG, food.ultimosCarbohidratosG, food.ultimasGrasasG].some(v => v == null)) return null;
  return { cantidad: food.ultimaCantidad, unidad: food.ultimaUnidad, proteinaG: food.ultimaProteinaG!, carbohidratosG: food.ultimosCarbohidratosG!, grasasG: food.ultimasGrasasG! };
}
export function catalogReference(food: AlimentoCatalogoResponse): FoodReference | null {
  if (!food.cantidadReferencia || !food.unidadReferencia || [food.proteinaG, food.carbohidratosG, food.grasasG].some(v => v == null)) return null;
  return { cantidad: food.cantidadReferencia, unidad: food.unidadReferencia, proteinaG: food.proteinaG!, carbohidratosG: food.carbohidratosG!, grasasG: food.grasasG! };
}
export function scaleReference(ref: FoodReference, cantidad: number, unidad: string) {
  if (!Number.isFinite(cantidad) || cantidad <= 0 || unidad !== ref.unidad) return null;
  const factor = cantidad / ref.cantidad;
  return { proteinaG: +(ref.proteinaG * factor).toFixed(4), carbohidratosG: +(ref.carbohidratosG * factor).toFixed(4), grasasG: +(ref.grasasG * factor).toFixed(4) };
}
