import { api } from "./api";

export type TendenciaPeso = "SUBE" | "BAJA" | "ESTABLE" | "SIN_DATOS";

export interface EstadoPesoSemanal {
  registroId: number | null;
  ultimaFecha: string | null;
  proximaFecha: string;
  habilitado: boolean;
  pesoKg: number | null;
  variacionKg: number | null;
  variacionPorcentual: number | null;
  tendencia: TendenciaPeso;
  cambioAnomaloConfirmado: boolean;
}

export const pesoSemanalService = {
  estado: (clienteId: number) =>
    api.get<EstadoPesoSemanal>(`/api/clientes/${clienteId}/peso-semanal`),
  registrar: (clienteId: number, pesoKg: number, confirmarCambioAnomalo = false) =>
    api.post<EstadoPesoSemanal>(`/api/clientes/${clienteId}/peso-semanal`, {
      pesoKg,
      confirmarCambioAnomalo,
    }),
};
