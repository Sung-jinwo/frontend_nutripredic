export function validarPesoSemanal(value: string): string {
  if (!value.trim()) return "Ingresa el peso medido.";
  if (!/^\d+(?:\.\d{1,2})?$/.test(value.trim())) return "Usa un número con hasta dos decimales, sin letras ni notación científica.";
  const peso = Number(value);
  return Number.isFinite(peso) && peso >= 1 && peso <= 500 ? "" : "El peso debe estar entre 1 y 500 kg.";
}
