# Correcciones verificadas — 2026-09-16

Usuario conservado: e2e-flujo-final-20260916-01@example.com.

- Inicio: verificado en navegador, 2770/3126 kcal y barra 89%. Se usa la energía del resumen diario oficial, igual que Registro diario. La consulta antigua de análisis nutricional no se modificó: todavía puede devolver energía no calculable cuando falta energía declarada de suplementos.
- PCS: la base contenía SMOKE_TECNICO_ADMIN_PCS activa y validada pero sin reglas. La selección elegía esa rúbrica antes que PCS_SUPLEMENTACION_DIARIA_ADULTOS. Ahora una consulta con EXISTS excluye rúbricas vacías sin consultar reglas repetidamente por cada candidata; no se borra ninguna configuración. Verificado desde navegador: ALTO, cafeína 450 MG, límite 400 MG.
- Análisis: se mantiene el requisito de consumo real del día anterior. La pantalla explica que Perfil está listo y ofrece Registro diario; los nombres técnicos de las cinco variables faltantes se agrupan en un detalle desplegable. No se sustituyen valores ausentes por cero ni por las metas.
- Conocimiento: consultar la evaluación guardada no genera preguntas ni predicciones. Se recarga la sesión tras eventos del ciclo diario y se usa la fecha de Lima. Un 404 esperado informa que la evaluación está pendiente; otros errores no se ocultan como ausencia de test.
- Orientación: verificado panel de datos actuales, con cinco comparaciones reales y diferencias: energía -356 kcal, proteína -16.3 g, carbohidratos -40.8 g, grasas -14.2 g, agua/bebidas -2000 ml. El panel no se presenta como nueva clasificación ni orientación personalizada predictiva.
- Avisos flotantes: Toaster global arriba a la derecha, cerrable. Errores HTTP y de conexión, operaciones de escritura, consulta manual de orientación/análisis/conocimiento, detalle de alimento y validación de Perfil disponen de avisos. Inicialización automática del plan y asegurar ciclo no anuncian falsamente una nueva ejecución exitosa. Verificado aviso «Orientación y consumo actualizados» en navegador.

Validación: nueve pruebas PCS focalizadas aprobaron (ocho de clasificación y una regresión de selección); backend compilado, empaquetado y reiniciado con salud UP. Compilación frontend aprobada con advertencia de tamaño del bundle.

Pendiente: el test Gemini del usuario nuevo no se ha generado ni respondido porque no tiene un día anterior completo. Los registros del 2026-09-16 podrán evaluarse el 2026-09-17. No se certifican todavía generación Gemini, PCC respondido, orientación personalizada predictiva ni TPP completo del usuario. No se retrofecharon registros ni se modificó el reloj, el clasificador o las fórmulas.
