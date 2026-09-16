# Auditoría NutriPredict — 16 de septiembre de 2026

## Conocimiento inicial y diario

- El perfil completo y su plan inicial permiten generar cinco preguntas Gemini sin inventar una predicción sobre un día inexistente.
- `POST /api/clientes/{id}/conocimiento/inicial/asegurar` reutiliza la sesión inicial. La migración V23 impone una sola sesión inicial por cliente.
- La evaluación inicial se guarda como línea base. No participa en PCC oficial, que exige una evaluación respondida, válida y vinculada al ciclo V6 DIARIO.
- El ciclo diario conserva generación de preguntas, plan, PCS y orientación sobre el día anterior; los reintentos reutilizan los módulos persistidos.
- Verificación manual en Conocimiento: cinco respuestas guardadas, 10/10 ALTO; prueba de integración: idempotencia y exclusión de la línea base del PCC.

## Datos locales para Administración

Ejecutar `powershell -ExecutionPolicy Bypass -File scripts/load-admin-demo.ps1` con los servicios locales disponibles. El cargador usa `scripts/admin-demo-dataset.json`; repetir el mismo Tag reutiliza los registros.

Los datos de entrada son artificiales y exclusivamente de prueba, no observaciones de tesis. Los clientes se identifican por nombre, dominio E2E y marca NO_USAR_ENTRENAMIENTO, y quedan excluidos del exportador de entrenamiento. Clasificaciones, preguntas y tiempos se obtienen ejecutando los servicios reales; no se insertan probabilidades ni duraciones prefijadas.

Carga ejecutada `dashboard-20260916`: clientes 18–21; predicciones 15–18; cuatro ciclos COMPLETADO; evaluado 2026-09-15, aplicado 2026-09-16; Random Forest `random-forest-v6-final-002`; cuatro tests respondidos. La evidencia detallada permanece local en `.e2e-runtime/admin-demo-dashboard-20260916.json`, sin tokens ni credenciales.

Fotografía de toda la base local después de la carga (incluye registros anteriores):

| Indicador | Resultado | Muestra |
| --- | --- | --- |
| PCC | 75 % | 3 bajos / 4 válidos |
| PCS | 41.67 % | 5 altos / 12 válidos |
| TPP | 20,569.75 ms | 4 ciclos válidos, 19 excluidos |

Estos valores sirven para verificar las vistas, no para demostrar efectividad clínica ni desempeño experimental de una muestra real.

## Archivos y compatibilidad

- Retirados del seguimiento Git: `.env` del frontend, tres archivos compilados de `dist` y 54 archivos temporales de `.pytest-tmp` del servicio IA. Los archivos locales existentes se conservan; las versiones anteriores siguen recuperables mediante Git.
- Retirado el cargador administrativo obsoleto `AdminIndicatorsDevSeedRunner`, sin referencias externas, reemplazado por la carga a través de las APIs reales.
- Se conservan migraciones aplicadas, endpoints tradicionales, V5 y artefactos técnicos que todavía tienen referencias en servicios/pruebas. No se eliminaron tablas ni historial de PostgreSQL.
- El único artefacto servido en el flujo final V6 es el Random Forest final. Los datos públicos de entrenamiento mantienen procedencia y etiquetas derivadas documentadas; no son etiquetas clínicas de especialistas.

## Docker

- Frontend: URL API como argumento de build; proxy Nginx conserva `/api` y resuelve dinámicamente el backend.
- Backend: construye el servicio IA hermano real, usa la URL interna del modelo y espera su healthcheck; exige secretos configurados en Compose.
- IA: rutas del artefacto final V6 y healthcheck Python sin depender de curl.
- `compose.stack.yml` integra PostgreSQL, IA, backend y frontend en el puerto 8081, con volumen independiente de la base local actual.
- Variables necesarias: DB_PASSWORD, JWT_SECRET, ADMIN_PASSWORD y API_KEY_GEMINI; revisar las rutas de repositorios hermanos o definir sus build contexts.
- Arranque: `docker compose --env-file <archivo-local-de-variables> -f compose.stack.yml up --build`.
- Validación realizada: revisión estática y documentación oficial de Docker. Arranque de contenedores BLOQUEADO: Docker no está instalado. No se certifica una ejecución que no se realizó.

## Pruebas

- Frontend: `npm run build` APROBADO; advertencia de bundle grande, no error.
- IA: 233/233 pruebas APROBADAS.
- Backend: pruebas focalizadas de conocimiento inicial y selección de rúbricas vacías APROBADAS.
- Suite completa del backend: 158 pruebas, 145 aprobadas, 3 fallos y 10 errores. Persisten fixtures antiguos de nombres de alimentos/suplementos, agregación proteica (70 frente a 118), mocks incompletos del ciclo V6 y pruebas del contrato V5. No se cambiaron contratos ni fórmulas para ocultar esos fallos; no se presenta el backend como suite completamente aprobada.
