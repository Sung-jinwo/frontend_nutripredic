import type { FieldErrors } from "../../services/validation-errors";

export const REGISTER_FIELDS = {
  1: ["nombre", "email", "password", "confirmPassword"],
  2: ["edad", "pesoKg", "alturaCm", "sexo", "objetivoFisico"],
  3: ["realizaActividadFisica", "diasEntrenamientoSemana", "tipoActividadFisica", "tipoEntrenamiento", "duracionPromedioSesionMinutos"],
} as const;

export interface RegisterValues {
  nombre: string; email: string; password: string; confirmPassword: string;
  edad: string; pesoKg: string; alturaCm: string; sexo: string; objetivoFisico: string;
  realizaActividadFisica: boolean | null; diasEntrenamientoSemana: string;
  tipoActividadFisica: string; tipoEntrenamiento: string; duracionPromedioSesionMinutos: string;
}

export function validateRegistration(v: RegisterValues): FieldErrors {
  const errors: FieldErrors = {};
  const nombreLimpio = v.nombre.trim();
  if (nombreLimpio.length < 2 || nombreLimpio.length > 120) errors.nombre = "El nombre debe tener entre 2 y 120 caracteres.";
  else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü'’.\- ]+$/.test(nombreLimpio)) errors.nombre = "El nombre solo admite letras, espacios, apóstrofes, puntos y guiones.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()) || v.email.trim().length > 254) errors.email = "Ingresa un correo válido de hasta 254 caracteres.";
  if (!v.password.trim() || v.password.length < 8 || v.password.length > 72) errors.password = "La contraseña debe tener entre 8 y 72 caracteres.";
  if (!v.confirmPassword || v.password !== v.confirmPassword) errors.confirmPassword = "Las contraseñas deben coincidir.";
  const number = (field: string, value: string, min: number, max: number, label: string, integer = false) => {
    const n = Number(value);
    if (!value.trim() || !Number.isFinite(n) || n < min || n > max || (integer && !Number.isInteger(n))) errors[field] = label;
  };
  number("edad", v.edad, 13, 120, "Ingresa una edad entera entre 13 y 120 años.", true);
  number("pesoKg", v.pesoKg, 1, 500, "Ingresa un peso entre 1 y 500 kg.");
  number("alturaCm", v.alturaCm, 30, 300, "Ingresa una altura entre 30 y 300 cm.");
  if (!v.sexo) errors.sexo = "Selecciona el sexo biológico.";
  if (!v.objetivoFisico) errors.objetivoFisico = "Selecciona tu objetivo.";
  if (v.realizaActividadFisica === null) errors.realizaActividadFisica = "Indica si realizas actividad física.";
  if (v.realizaActividadFisica) {
    number("diasEntrenamientoSemana", v.diasEntrenamientoSemana, 1, 7, "Selecciona entre 1 y 7 días.", true);
    if (!v.tipoActividadFisica.trim() || v.tipoActividadFisica.trim().length > 120) errors.tipoActividadFisica = "Describe tu actividad en hasta 120 caracteres.";
    else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü,.\- ]+$/.test(v.tipoActividadFisica.trim())) errors.tipoActividadFisica = "Describe tu actividad solo con letras, espacios, comas, puntos y guiones.";
    if (!v.tipoEntrenamiento) errors.tipoEntrenamiento = "Selecciona el tipo de entrenamiento.";
    number("duracionPromedioSesionMinutos", v.duracionPromedioSesionMinutos, 1, 1440, "Ingresa una duración entera entre 1 y 1440 minutos.", true);
  }
  return errors;
}
