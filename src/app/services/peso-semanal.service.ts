import { api } from "./api";

export type TendenciaPeso = "SUBE" | "BAJA" | "ESTABLE" | "SIN_DATOS";

export interface RegistroPeso {
  id: number;
  fechaMedicion: string;
  pesoKg: number;
  variacionKg: number | null;
  variacionPorcentual: number | null;
  cambioAnomaloConfirmado: boolean;
}

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
  historial: (clienteId: number, notifyError = true) => api.get<RegistroPeso[]>(`/api/clientes/${clienteId}/peso-semanal/historial`, { notifyError }),
  estado: (clienteId: number, notifyError = true) =>
    api.get<EstadoPesoSemanal>(`/api/clientes/${clienteId}/peso-semanal`, { notifyError }),
  registrar: (clienteId: number, pesoKg: number, confirmarCambioAnomalo = false) =>
    api.post<EstadoPesoSemanal>(`/api/clientes/${clienteId}/peso-semanal`, {
      pesoKg,
      confirmarCambioAnomalo,
    }, { notifySuccess: false, silentStatuses: [409] }),
};
