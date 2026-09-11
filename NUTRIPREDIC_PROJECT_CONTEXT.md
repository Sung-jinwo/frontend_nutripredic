# NUTRIPREDIC PROJECT CONTEXT

## 1. CONTEXTO DE TESIS

**Título:** Sistema de análisis predictivo nutricional basado en IA para evaluación de hábitos alimenticios y consumo de suplementos.

**Objetivo:** Predecir el nivel de riesgo nutricional de un cliente basándose en sus hábitos alimenticios, conocimiento nutricional y patrones de suplementación.

**Alcance:** Prototipo funcional frontend + backend. Modelo ML pendiente de entrenamiento y validación.

---

## 2. VARIABLE INDEPENDIENTE (Entrada del modelo)

Tres dimensiones que el backend debe consolidar para el modelo:

1. **Perfil de Hábitos Alimenticios (PHA)** — frecuencia de comidas, consumo de agua, proteínas, tipo de alimentación, nivel de organización, desayuno, snacks, alimentos, comidas cocinadas, restricciones, consumo de suplementos.
2. **Porcentaje de Conocimiento del Cliente (PCC)** — resultado del test de conocimiento nutricional (calculado por backend).
3. **Perfil de Consumo de Suplementos (PCS)** — tipos de suplementos, cantidades, frecuencias, tiempo de uso, estado activo/inactivo.

**Estado actual:** Frontend captura estas tres dimensiones y las envía al backend vía servicios HTTP. Backend las almacena en tablas normalizadas.

---

## 3. VARIABLE DEPENDIENTE (Salida del modelo)

**nivelRiesgo** — clasificación del riesgo nutricional del cliente.

**Categorías propuestas (no definitivas):**
- `ADECUADO` — hábitos saludables, conocimiento alto, consumo controlado
- `MEJORABLE` — hábitos regulares, conocimiento medio, consumo moderado
- `CRÍTICO` — hábitos deficientes, conocimiento bajo, consumo excesivo

**Estado actual:** No existe modelo entrenado. Frontend muestra "Modelo no disponible" en todas las páginas de análisis. Backend no tiene endpoint de predicción activo.

---

## 4. PCC, PCS Y TPP

### PCC (Porcentaje de Conocimiento del Cliente)
- **Definición:** Porcentaje de respuestas correctas en el test de conocimiento nutricional.
- **Cálculo:** Backend calcula `correctas / total * 100` y asigna nivel (`BAJO`, `MEDIO`, `ALTO`).
- **Frontend:** Solo muestra el resultado del backend, no recalcula.

### PCS (Perfil de Consumo de Suplementos)
- **Definición:** Clasificación del patrón de consumo de suplementos.
- **Cálculo:** Pendiente de definición metodológica. Backend no lo calcula aún.
- **Frontend:** No inventa clasificaciones. Muestra datos crudos (cantidad, frecuencia, tiempo de uso).

### TPP (Tiempo de Proceso Predictivo)
- **Definición:** Latencia total del proceso de análisis predictivo (desde que los datos están listos hasta que el resultado está disponible).
- **Medición:** Debe instrumentarse en backend, no usar latencia HTTP del navegador.
- **Frontend:** `AdminTiempoPage` muestra "TPP todavía no disponible". No simula tiempos.

---

## 5. ARQUITECTURA GLOBAL

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────┐
│   Frontend      │ ──JWT─► │   Backend        │ ──SQL─► │  PostgreSQL  │
│  React + Vite   │ ◄────── │  Spring Boot     │ ◄────── │              │
│  (Puerto 5173)  │         │  (Puerto 8080)   │         │              │
└─────────────────┘         └──────────────────┘         └──────────────┘
```

**Frontend:** React 18 + TypeScript + Vite 6 + Tailwind v4 + shadcn/ui + MUI 7.
**Backend:** Spring Boot 3 + Java 21 + PostgreSQL + Flyway + JWT.

---

## 6. ESTADO FUNCIONAL BACKEND

**Endpoints activos:**
- `POST /api/auth/login` — autenticación JWT
- `POST /api/auth/register` — registro de usuario
- `GET /api/usuarios/me` — perfil del usuario autenticado
- `PUT /api/clientes/{id}` — completar perfil de cliente
- `GET/POST/PUT/DELETE /api/habitos/*` — CRUD de hábitos
- `GET/POST/PUT/DELETE /api/clientes/{id}/suplementos` — CRUD de suplementos por cliente
- `GET /api/suplementos` — catálogo de suplementos
- `GET /api/preguntas` — preguntas del test de conocimiento
- `POST /api/tests/respuestas` — enviar respuestas del test
- `GET /api/clientes/{id}/tests` — historial de tests

**Endpoints pendientes:**
- Predicción ML (no existe aún)
- Historial de análisis predictivos
- Recomendaciones automáticas
- Métricas de modelo (precisión, SHAP, etc.)

---

## 7. ESTADO FUNCIONAL FRONTEND

**Fase 3.3 completada (2026-08-24):**

- ✅ Autenticación JWT funcional contra backend
- ✅ Registro + completar perfil en 2 pasos
- ✅ CRUD Hábitos con persistencia verificada
- ✅ CRUD Suplementos con catálogo y persistencia verificada
- ✅ Test de Conocimiento con preguntas, envío y resultado del backend
- ✅ Perfil de cliente muestra datos reales
- ✅ Análisis/Historial/Recomendaciones muestran "no disponible" (sin mocks predictivos)
- ✅ Admin pages usan mock-data con banners "Vista demostrativa"
- ✅ Build exitoso sin errores

**Módulos neutralizados (sin predicciones falsas):**
- `ClientAnalisisPage` — botón disabled, estado `unavailable`
- `ClientHomePage` — sin KPIs predictivos
- `ClientProfilePage` — sin resumen predictivo inventado
- `ClientHistorialPage` — estado vacío informativo
- `ClientRecomendacionesPage` — sin recomendaciones automáticas
- `AdminModeloPage` — "Modelo no disponible"
- `AdminTiempoPage` — "TPP todavía no disponible"

---

## 8. MODELO DE DATOS RELEVANTE

**Tablas backend:**
- `usuarios` — credenciales, rol, estado activo
- `clientes` — perfil físico (edad, peso, altura, IMC, objetivo)
- `habitos` — registros diarios de hábitos alimenticios
- `suplementos` — catálogo de suplementos disponibles
- `cliente_suplemento` — asignación de suplementos a clientes (cantidad, unidad, frecuencia, tiempo de uso, activo, fechas)
- `preguntas` — preguntas del test de conocimiento
- `tests` — resultados de tests realizados por clientes

**VariablesModeloService:** Servicio backend que extrae y normaliza las tres dimensiones (PHA, PCC, PCS) para el modelo. Usa snapshots con `fechaCorte` para versionar estados.

---

## 9. CONTRATOS IMPORTANTES

### Autenticación
```typescript
// Frontend → Backend
POST /api/auth/login
{ email: string, password: string }
→ { token, tokenType, usuarioId, clienteId, email, nombre, rol }

POST /api/auth/register
{ nombre, email, password }
→ { token, tokenType, usuarioId, clienteId, email, nombre, rol }

GET /api/usuarios/me (con Bearer token)
→ { id, clienteId, email, nombre, rol, activo, edad, pesoKg, alturaCm, imc, objetivoFisico }
```

### Hábitos
```typescript
POST /api/habitos
{ clienteId, fecha, cantidadComidas, consumoAgua, proteinas, tipoAlimentacion, nivelOrganizacion, desayuno, snacks, alimentos, comidasCocinadas, restricciones, consumeSuplementos }
→ HabitoResponse (con id)

PUT /api/habitos/{id}
{ fecha, cantidadComidas, consumoAgua, proteinas, tipoAlimentacion, nivelOrganizacion, desayuno, snacks, alimentos, comidasCocinadas, restricciones, consumeSuplementos }
→ HabitoResponse
```

### Suplementos
```typescript
GET /api/suplementos
→ SuplementoCatalogo[] { id, nombre, tipo, descripcion, beneficios, recomendaciones }

POST /api/clientes/{clienteId}/suplementos
{ suplementoId, cantidad, unidad, frecuencia, tiempoUso, activo, fechaInicio, fechaFin }
→ SuplementoClienteResponse
```

### Conocimiento
```typescript
GET /api/preguntas
→ PreguntaConocimiento[] { id, enunciado, opcionA, opcionB, opcionC, opcionD, categoria, dificultad }

POST /api/tests/respuestas
{ clienteId, respuestas: [{ preguntaId, opcion }] }
→ ResultadoTestResponse { id, clienteId, total, correctas, porcentaje, nivel, fecha }
```

### Predicción (PENDIENTE)
```typescript
// NO DEFINIDO AÚN
POST /api/analisis/prediccion
{ clienteId }
→ { nivelRiesgo, probabilidad, shap_values, fechaCorte, ... }
```

---

## 10. VARIABLESMODELOSERVICE Y SNAPSHOTS

**VariablesModeloService:** Servicio backend desacoplado que:
- Extrae datos de hábitos, suplementos y conocimiento
- Normaliza valores categóricos (tipoAlimentacion, nivelOrganizacion)
- Calcula agregaciones (promedios, frecuencias)
- Genera snapshots con `fechaCorte` para versionar estados del cliente

**Snapshots:** Registros históricos del estado de un cliente en un momento dado. Permiten rastrear evolución y entrenar el modelo con datos históricos.

**Estado actual:** Backend implementa extracción básica. Frontend no consume snapshots directamente (solo ve el estado actual).

---

## 11. ESTADO ACTUAL DE MACHINE LEARNING

**Modelo:** NO ENTRENADO.

**Algoritmo propuesto:** Random Forest (pendiente de validación).

**Datos disponibles para entrenamiento:**
- Hábitos de múltiples clientes
- Resultados de tests de conocimiento
- Asignaciones de suplementos
- Snapshots históricos

**Pendiente:**
- Definir features finales (¿cuáles variables usar?)
- Definir target (¿nivelRiesgo es la Y definitiva?)
- Entrenar modelo con datos reales
- Validar precisión y robustez
- Implementar endpoint de predicción
- Calcular SHAP values para explicabilidad

**Frontend:** No simula predicciones. Muestra "Modelo no disponible" en todas las páginas de análisis.

---

## 12. DECISIONES METODOLÓGICAS PENDIENTES

1. **Definición de PCS:** ¿Cómo clasificar el consumo de suplementos? ¿Bajo/Medio/Alto? ¿Umbral de cantidad? ¿Considerar tiempo de uso?
2. **Definición de Y (target):** ¿`nivelRiesgo` con 3 categorías (ADECUADO/MEJORABLE/CRÍTICO) es suficiente? ¿O se necesita regresión (score continuo)?
3. **Features del modelo:** ¿Incluir todas las variables de hábitos? ¿Solo las más correlacionadas? ¿Agregar variables derivadas (IMC, tendencia de conocimiento)?
4. **Validación del modelo:** ¿Métricas mínimas aceptables? ¿Precision/Recall/F1? ¿AUC-ROC?
5. **Explicabilidad:** ¿SHAP values obligatorios? ¿O solo feature importance global?
6. **Actualización del modelo:** ¿Reentrenar cada X semanas? ¿Con nuevos datos? ¿Versionado de modelos?

---

## 13. LIMITACIONES CONOCIDAS

1. **Sin modelo entrenado:** Frontend y backend están listos para consumir predicciones, pero el modelo no existe aún.
2. **PCS no definido:** Backend no calcula perfil de consumo de suplementos. Frontend no inventa clasificaciones.
3. **Admin pages con mock-data:** Dashboard, clientes, conocimiento, consumo, reportes usan datos estáticos con banners "Vista demostrativa".
4. **Sin historial predictivo:** No hay endpoint ni UI para mostrar análisis pasados (porque no hay análisis).
5. **Sin recomendaciones automáticas:** Frontend muestra "Recomendaciones no disponibles". No hay motor de reglas.
6. **TPP no instrumentado:** No se mide el tiempo real del proceso predictivo.
7. **TypeScript sin typecheck:** Frontend usa TypeScript pero no tiene `tsconfig.json` ni `npm run typecheck`. Build usa esbuild para transpilación.
8. **Sin tests automatizados:** No hay suite de tests en frontend ni backend (solo validación manual).

---

## 14. PRÓXIMA FASE

**Fase 4: Entrenamiento e integración del modelo ML**

**Objetivos:**
1. Definir features finales y target (Y)
2. Entrenar Random Forest (o algoritmo validado) con datos reales
3. Calcular métricas de desempeño (accuracy, precision, recall, F1)
4. Implementar endpoint `POST /api/analisis/prediccion`
5. Calcular SHAP values para explicabilidad
6. Integrar predicciones en frontend (ClientAnalisisPage, ClientHistorialPage)
7. Generar recomendaciones automáticas basadas en predicción
8. Instrumentar TPP (tiempo de proceso predictivo)
9. Conectar admin pages a datos reales (reemplazar mock-data)

**Dependencias:**
- Backend debe implementar VariablesModeloService completo
- Backend debe entrenar y validar modelo
- Backend debe exponer endpoint de predicción
- Frontend debe consumir contrato real de predicción

---

## 15. ÚLTIMO CHECKPOINT FUNCIONAL

**Fase 3.3 completada — 2026-08-24**

**Estado:**
- ✅ Frontend conectado a backend real (JWT, hábitos, suplementos, conocimiento)
- ✅ CRUD completo con persistencia verificada
- ✅ Sin predicciones simuladas (todas neutralizadas)
- ✅ Build exitoso sin errores
- ⏳ Modelo ML pendiente de entrenamiento
- ⏳ Admin pages con mock-data (banners "Vista demostrativa")

**Validación:**
- Usuario test: `fase33test@example.com` / `TestPass123`
- Backend: `http://localhost:8080`
- Todos los endpoints activos responden correctamente
- Hábitos: crear, editar, persistir — OK
- Suplementos: catálogo, asignar, editar tiempoUso, persistir — OK
- Test de conocimiento: cargar preguntas, enviar respuestas, resultado backend — OK

---

## ÚLTIMA ACTUALIZACIÓN

**Fase actual:** 3.3 completada

**Fecha:** 2026-08-24

**Cambios relevantes:**
1. Frontend consume backend real vía servicios HTTP centralizados
2. Autenticación JWT funcional (login, register, completeProfile)
3. CRUD Hábitos completo con persistencia verificada
4. CRUD Suplementos con catálogo y persistencia verificada
5. Test de Conocimiento integrado con backend (preguntas, envío, resultado)
6. Todas las páginas de análisis neutralizadas (sin mocks predictivos)
7. Admin pages mantienen mock-data con banners "Vista demostrativa"
8. Build exitoso sin errores
9. Contratos frontend-backend alineados con endpoints reales
10. VariablesModeloService y snapshots documentados (backend)

**Estado de la fase:** ✅ COMPLETADA Y VALIDADA

**Siguiente paso recomendado:** Definir features finales y entrenar modelo ML (Fase 4).
