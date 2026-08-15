export const nutritionData = [
  { name: "Bajo", value: 35 },
  { name: "Medio", value: 40 },
  { name: "Alto", value: 25 },
];
export const NUTR_COLORS = ["#f43f5e", "#f59e0b", "#10b981"];

export const supplementLevelData = [
  { name: "Bajo consumo", value: 28 },
  { name: "Moderado", value: 30 },
  { name: "Alto consumo", value: 42 },
];
export const SUPP_COLORS = ["#10b981", "#f59e0b", "#f43f5e"];

export const supplementBarData = [
  { tipo: "Proteína", bajo: 15, moderado: 35, alto: 50 },
  { tipo: "Creatina", bajo: 30, moderado: 25, alto: 45 },
  { tipo: "Vitaminas", bajo: 45, moderado: 32, alto: 23 },
  { tipo: "Omega-3", bajo: 55, moderado: 28, alto: 17 },
  { tipo: "Pre-entreno", bajo: 20, moderado: 30, alto: 50 },
];

export const weeklyTimes = [
  { dia: "Lun", tiempo: 0.28, predicciones: 42 },
  { dia: "Mar", tiempo: 0.31, predicciones: 38 },
  { dia: "Mié", tiempo: 0.24, predicciones: 51 },
  { dia: "Jue", tiempo: 0.35, predicciones: 29 },
  { dia: "Vie", tiempo: 0.29, predicciones: 45 },
  { dia: "Sáb", tiempo: 0.42, predicciones: 18 },
  { dia: "Dom", tiempo: 0.26, predicciones: 22 },
];

export const clientEvolution = [
  { mes: "Ene", conocimiento: 32, suplementos: 78 },
  { mes: "Feb", conocimiento: 40, suplementos: 72 },
  { mes: "Mar", conocimiento: 52, suplementos: 68 },
  { mes: "Abr", conocimiento: 59, suplementos: 61 },
  { mes: "May", conocimiento: 55, suplementos: 58 },
  { mes: "Jun", conocimiento: 71, suplementos: 50 },
];

export const knowledgeTrend = [
  { mes: "Ene", bajo: 42, medio: 35, alto: 23 },
  { mes: "Feb", bajo: 40, medio: 37, alto: 23 },
  { mes: "Mar", bajo: 38, medio: 38, alto: 24 },
  { mes: "Abr", bajo: 36, medio: 40, alto: 24 },
  { mes: "May", bajo: 35, medio: 40, alto: 25 },
  { mes: "Jun", bajo: 35, medio: 40, alto: 25 },
];

export const clients = [
  { id: 1, nombre: "Ana María Rodríguez", edad: 24, estado: "Activo", ultimaEval: "15/06/2025", conocimiento: "Alto", consumo: "Moderado", resultado: "Favorable" },
  { id: 2, nombre: "Carlos Pérez Torres", edad: 31, estado: "Activo", ultimaEval: "12/06/2025", conocimiento: "Bajo", consumo: "Alto", resultado: "Crítico" },
  { id: 3, nombre: "Laura Gómez Sánchez", edad: 28, estado: "Evaluado", ultimaEval: "08/06/2025", conocimiento: "Medio", consumo: "Bajo", resultado: "Moderado" },
  { id: 4, nombre: "Diego Ramírez Vega", edad: 22, estado: "Pendiente", ultimaEval: "—", conocimiento: "—", consumo: "—", resultado: "Sin evaluar" },
  { id: 5, nombre: "Sofía Méndez Luna", edad: 35, estado: "Activo", ultimaEval: "01/06/2025", conocimiento: "Medio", consumo: "Alto", resultado: "Seguimiento" },
  { id: 6, nombre: "Miguel Torres Castro", edad: 29, estado: "Activo", ultimaEval: "28/05/2025", conocimiento: "Bajo", consumo: "Alto", resultado: "Crítico" },
  { id: 7, nombre: "Valentina Ríos Blanco", edad: 26, estado: "Evaluado", ultimaEval: "20/05/2025", conocimiento: "Alto", consumo: "Moderado", resultado: "Favorable" },
];

export const historialRegistros = [
  { fecha: "15/06/2025", tipo: "Análisis completo", conocimiento: "Medio", consumo: "Alto", nivel: "Moderado", cambio: "↑ Mejora" },
  { fecha: "01/04/2025", tipo: "Análisis completo", conocimiento: "Bajo", consumo: "Alto", nivel: "Crítico", cambio: "— Estable" },
  { fecha: "15/01/2025", tipo: "Análisis inicial", conocimiento: "Bajo", consumo: "Muy alto", nivel: "Crítico", cambio: "— Inicio" },
];

export const suplementosRegistrados = [
  { nombre: "Proteína Whey", frecuencia: "Diaria", cantidad: "30g / dosis", tiempoUso: "8 meses", estado: "Activo" },
  { nombre: "Creatina", frecuencia: "Diaria", cantidad: "5g / dosis", tiempoUso: "6 meses", estado: "Activo" },
  { nombre: "Pre-entreno", frecuencia: "5x / semana", cantidad: "1 scoop", tiempoUso: "3 meses", estado: "Activo" },
  { nombre: "Multivitamínico", frecuencia: "Diaria", cantidad: "1 cápsula", tiempoUso: "12 meses", estado: "Pausado" },
];
