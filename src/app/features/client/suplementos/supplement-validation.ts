export const COMPONENT_FIELDS = ["proteinaGPorToma", "carbohidratosGPorToma", "grasasGPorToma", "creatinaGPorToma", "cafeinaMgPorToma", "sodioMgPorToma"] as const;
export const optionalComponent = (value: string) => value.trim() === "" ? null : Number(value);
export function numericError(value: string, required = false): string {
  if (!value.trim()) return required ? "Este campo es obligatorio." : "";
  if (!/^\d+(?:\.\d{1,4})?$/.test(value) || !Number.isFinite(Number(value))) return "Usa un número con hasta 4 decimales, sin signos ni letras.";
  if ((required && Number(value) <= 0) || Number(value) >= 100000000) return "Ingresa una cantidad válida mayor que cero y menor que 100000000.";
  return "";
}
