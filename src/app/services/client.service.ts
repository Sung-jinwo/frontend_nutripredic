import { api } from "./api";

export type TipoObjetivoFisico =
  | "MANTENER_PESO"
  | "PERDER_PESO"
  | "GANAR_PESO"
  | "GANAR_MASA_MUSCULAR"
  | "MEJORAR_RENDIMIENTO"
  | "RECOMPOSICION_CORPORAL"
  | "OTRO";

export type TipoEntrenamiento = "FUERZA" | "CARDIO" | "MIXTO" | "OTRO";

export const tipoObjetivoDesdeUx = (objetivo: string): TipoObjetivoFisico => {
  if (objetivo === "Reducir grasa corporal") return "PERDER_PESO";
  if (objetivo === "Mantener mi peso/composición") return "MANTENER_PESO";
  if (objetivo === "Aumentar masa muscular") return "GANAR_MASA_MUSCULAR";
  return "OTRO";
};

export interface UpdateClientRequest {
  edad: number;
  pesoKg?: number;
  alturaCm: number;
  objetivoFisico: string;
  tipoObjetivoFisico: TipoObjetivoFisico;
  sexo?: "MASCULINO" | "FEMENINO" | null;
  realizaActividadFisica?: boolean;
  diasEntrenamientoSemana?: number | null;
  tipoActividadFisica?: string | null;
  tipoEntrenamiento?: TipoEntrenamiento | null;
  duracionPromedioSesionMinutos?: number | null;
  objetivoEnergetico?: "DEFICIT" | "MANTENIMIENTO" | "SUPERAVIT";
}

export interface ClienteResponse {
  id: number;
  usuarioId: number;
  email: string;
  nombre: string;
  edad: number | null;
  sexo: "MASCULINO" | "FEMENINO" | null;
  pesoKg: number | null;
  alturaCm: number | null;
  imc: number | null;
  objetivoFisico: string | null;
  tipoObjetivoFisico: TipoObjetivoFisico | null;
  realizaActividadFisica: boolean | null;
  diasEntrenamientoSemana: number | null;
  tipoActividadFisica: string | null;
  tipoEntrenamiento: TipoEntrenamiento | null;
  duracionPromedioSesionMinutos: number | null;
  objetivoEnergetico: "DEFICIT" | "MANTENIMIENTO" | "SUPERAVIT" | null;
  estado: string;
}

export const clientService = {
  get: (clienteId: number) =>
    api.get<ClienteResponse>(`/api/clientes/${clienteId}`),
  update: (clienteId: number, data: UpdateClientRequest, notifySuccess = true) =>
    api.put<ClienteResponse>(`/api/clientes/${clienteId}`, data, { notifySuccess }),
};
