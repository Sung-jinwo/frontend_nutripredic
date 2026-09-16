# Informe de prueba integral NutriPredict

Fecha de ejecución: 2026-09-15 (America/Lima)

Estado general: **BLOQUEADO_POR_DATOS**

## Resumen ejecutivo

La prueba integral desde el frontend no puede iniciarse sin incumplir el criterio de usar exclusivamente el modelo Random Forest final. La base PostgreSQL actual no contiene evaluaciones reales entrenables y, por tanto, el entrenador rechazó correctamente la creación del artefacto final. No se usó el modelo técnico como sustituto y no se creó ningún usuario E2E.

## Preflight

| Componente | Resultado | Evidencia |
|---|---|---|
| Frontend React/Vite | APROBADO | Build de producción completado; 2337 módulos transformados. |
| Servicio IA | APROBADO | 226 de 226 pruebas automatizadas aprobadas. |
| Backend Spring Boot | FALLIDO | 156 pruebas: 143 aprobadas, 3 fallidas y 10 con error. |
| PostgreSQL actual | APROBADO | Servicio PostgreSQL 17 activo y backend conectado. |
| Backend en ejecución | APROBADO | `GET /actuator/health` devolvió `UP`. |
| Dataset V6 real | BLOQUEADO | 0 evaluaciones y 0 filas entrenables; ADECUADO=0, MEJORABLE=0, CRITICO=0. |
| Random Forest final | BLOQUEADO | No existe `models/nutripredict_v6.joblib`. |
| Entrenamiento final | BLOQUEADO | `No hay observaciones disponibles para entrenamiento.` |
| Gemini real | NO EJECUTADO | Configurado con mock desactivado, pero el ciclo no debe iniciarse sin modelo final. |
| Flujo desde navegador | NO EJECUTADO | Detenido por la condición obligatoria del modelo final. |

## Fallos detectados en backend

- Contratos de alimentos antiguos construyen `RegistroAlimentoRequest` sin `nombreAlimento` y provocan `NullPointerException`.
- Contratos de suplementos antiguos omiten `nombreSuplemento`/`nombreDeclarado` y reciben HTTP 400 o una violación `NOT NULL`.
- La agregación de suplementación esperaba 70 y obtuvo 118, por lo que debe revisarse la semántica de cantidad y tomas.
- Dos pruebas del ciclo diario no preparan la respuesta V6 y fallan antes de comprobar el reintento de Gemini.
- Varias pruebas del servicio predictivo V5 ya no satisfacen los requisitos actuales de elegibilidad y esquema.

## Recorrido funcional pendiente

Los siguientes pasos quedan sin ejecutar hasta que exista el artefacto Random Forest final con datos reales:

1. Registro y perfil del usuario `E2E-FLUJO-FINAL-*`.
2. Configuración y consumo diario de un suplemento con composición.
3. Registro del alimento, macronutrientes y agua del día anterior.
4. Ciclo diario, predicción, metas, PCS, Gemini, orientación y TPP.
5. Verificación de idempotencia al recargar.
6. Respuesta del test de conocimiento y actualización PCC.
7. Historial, recomendaciones y dashboard administrativo.

## Condición para reanudar

La prueba puede continuar cuando `/api/admin/ml/dataset/v6/calidad` informe una muestra real suficiente y el entrenador genere un artefacto cuya metadata contenga:

- `modelType: RANDOM_FOREST`
- `trainingDataType: REAL`
- `isThesisFinalModel: true`
- `modelVersion` con prefijo `random-forest-v6-final-`

Hasta entonces, el resultado correcto del sistema es bloquear la certificación y no presentar el modelo técnico como final.
