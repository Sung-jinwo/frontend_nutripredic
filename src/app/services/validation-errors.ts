export type FieldErrors = Record<string, string>;

const LABELS: Record<string, string> = {
  nombre: "Nombre", email: "Correo electrónico", password: "Contraseña",
  edad: "Edad", sexo: "Sexo biológico", pesoKg: "Peso (kg)", alturaCm: "Altura (cm)",
  objetivoFisico: "Objetivo", realizaActividadFisica: "Actividad física",
  diasEntrenamientoSemana: "Días de entrenamiento", tipoActividadFisica: "Tipo de actividad",
  tipoEntrenamiento: "Tipo de entrenamiento", duracionPromedioSesionMinutos: "Duración de sesión (minutos)",
  nombreAlimento: "Nombre del alimento", nombreSuplemento: "Nombre del suplemento",
  proteinaG: "Proteínas (g)", carbohidratosG: "Carbohidratos (g)", grasasG: "Grasas (g)",
  consumoAgua: "Agua consumida", cantidad: "Cantidad", cantidadConsumida: "Cantidad consumida",
  cantidadPorToma: "Tamaño de porción", unidadCodigo: "Unidad", numeroTomas: "Número de tomas",
  proteinaGPorToma: "Proteína por porción", carbohidratosGPorToma: "Carbohidratos por porción",
  grasasGPorToma: "Grasas por porción", creatinaGPorToma: "Creatina por porción",
  cafeinaMgPorToma: "Cafeína por porción", sodioMgPorToma: "Sodio por porción",
  fechaInicio: "Fecha de inicio", fechaFin: "Fecha de fin", fecha: "Fecha",
};

export function readFieldErrors(payload: unknown): FieldErrors {
  if (!payload || typeof payload !== "object" || !("fieldErrors" in payload) || !Array.isArray(payload.fieldErrors)) return {};
  const errors: FieldErrors = {};
  for (const item of payload.fieldErrors) {
    if (!item || typeof item !== "object" || typeof item.field !== "string" || typeof item.message !== "string") continue;
    if (!item.field || !item.message) continue;
    errors[item.field] = errors[item.field] ? `${errors[item.field]} ${item.message}` : item.message;
  }
  return errors;
}

export function apiErrorMessage(payload: unknown, fallback: string): string {
  const fields = Object.entries(readFieldErrors(payload));
  if (fields.length) return fields.map(([field, message]) => `${LABELS[field] ?? field}: ${message}`).join("\n");
  if (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string" && payload.message) return payload.message;
  return typeof payload === "string" && payload ? payload : fallback;
}
