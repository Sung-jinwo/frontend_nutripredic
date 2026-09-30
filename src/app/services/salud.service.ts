import { api } from "./api";

export type EstadoPatologia = "CONFIRMADA" | "SOSPECHADA" | "NO_DECLARADA";
export type PatronAlimentario = "OMNIVORO" | "VEGETARIANO" | "VEGANO" | "OTRO";
export type EstadoReproductivo = "NO_APLICA" | "NINGUNO" | "EMBARAZO" | "LACTANCIA";
export type ResultadoOrientacion =
  | "POSIBLE_APOYO_CONDICIONAL"
  | "NO_NECESARIO_CON_DATOS_ACTUALES"
  | "EVITAR"
  | "REQUIERE_EVALUACION_PROFESIONAL"
  | "DATOS_INSUFICIENTES";

export interface PatologiaCatalogo { codigo: string; nombre: string; descripcion: string | null }
export interface CatalogoPerfilSalud {
  patologias: PatologiaCatalogo[];
  patronesAlimentarios: PatronAlimentario[];
  estadosReproductivos: EstadoReproductivo[];
  deficienciasSugeridas: string[];
}
export interface PerfilSaludRequest {
  ningunaPatologiaConocida: boolean;
  patronAlimentario: PatronAlimentario;
  estadoReproductivo: EstadoReproductivo;
  sensibilidadCafeina: boolean;
  declaracionAceptada: boolean;
  patologias: Array<{ codigo: string; estado: Exclude<EstadoPatologia, "NO_DECLARADA"> }>;
  medicamentos: string[];
  alergias: string[];
  deficiencias: Array<{ nombre: string; confirmada: boolean }>;
}
export interface PerfilSaludResponse {
  completo: boolean;
  ningunaPatologiaConocida: boolean;
  patronAlimentario: PatronAlimentario;
  estadoReproductivo: EstadoReproductivo;
  sensibilidadCafeina: boolean;
  declaracionAceptada: boolean;
  medicamentos: string[];
  alergias: string[];
  deficiencias: Array<{ nombre: string; confirmada: boolean }>;
  actualizadoEn: string | null;
  patologias: Array<{ codigo: string; nombre: string; estado: EstadoPatologia }>;
}
export interface OrientacionSuplementoItem {
  componente: string;
  nombre: string;
  resultado: ResultadoOrientacion;
  motivo: string;
  explicacion: string;
  fuente: string;
  fuenteUrl: string;
  fechaRevision: string;
}
export interface OrientacionSuplementosResponse {
  disponible: boolean;
  motivoNoDisponible: string | null;
  versionReglas: string;
  evaluadaEn: string | null;
  explicacionIaDisponible: boolean;
  alertasSalud: string[];
  posiblesApoyos: OrientacionSuplementoItem[];
  noNecesarios: OrientacionSuplementoItem[];
  evitarORevisar: OrientacionSuplementoItem[];
}

export const saludService = {
  catalog: () => api.get<CatalogoPerfilSalud>("/api/catalogos/perfil-salud"),
  getProfile: (clienteId: number) => api.get<PerfilSaludResponse>(`/api/clientes/${clienteId}/perfil-salud`),
  updateProfile: (clienteId: number, data: PerfilSaludRequest) =>
    api.put<PerfilSaludResponse>(`/api/clientes/${clienteId}/perfil-salud`, data),
  orientation: (clienteId: number) =>
    api.get<OrientacionSuplementosResponse>(`/api/clientes/${clienteId}/orientacion-suplementos`),
};
