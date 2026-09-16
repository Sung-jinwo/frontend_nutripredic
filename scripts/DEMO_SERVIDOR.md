# Datos para los gráficos del servidor

El dataset `admin-demo-dataset.json` contiene cuatro perfiles de consumo artificiales. No es el dataset de entrenamiento del Random Forest ni una muestra real para medir efectividad. Se carga explícitamente mediante `load-admin-demo.ps1`, usando las APIs del backend desplegado.

La carga crea clientes identificados como pruebas, perfil, plan del día anterior, alimento, agua y suplemento; ejecuta el ciclo real del modelo/Gemini y responde los tests. PCC, PCS y TPP se calculan en el backend, nunca se insertan valores prefijados. Se mantiene la exclusión del entrenamiento mediante dominio E2E y marca NO_USAR_ENTRENAMIENTO.

## Cargar desde Windows hacia el servidor

Primero despliega el backend actualizado, el servicio IA con el artefacto final y Gemini configurado. Deben estar disponibles las APIs de registro y las fórmulas/rúbrica PCS oficiales. El script no necesita acceso directo a PostgreSQL ni credenciales de administrador.

En PowerShell, desde el repositorio del frontend:

```powershell
$claveDemo = Read-Host 'Clave privada para los clientes de demostración (mínimo 12 caracteres)' -AsSecureString
./scripts/load-admin-demo.ps1 -ApiUrl 'https://api.tu-dominio.com' -AllowRemoteDemo -DemoPassword $claveDemo -Tag 'demo-servidor-01'
```

Usa el origen del backend sin `/api` ni ruta adicional; con el proxy integrado puede ser el mismo origen del frontend. La carga remota exige HTTPS, autorización explícita con AllowRemoteDemo y una clave distinta de la clave local pública. No deshabilites la validación TLS. El comando se ejecuta en tu equipo, pero guarda los registros en la base del servidor indicado.

Repetir el mismo Tag y la misma clave reutiliza los cuatro clientes; en el mismo día reutiliza los registros, predicción, ciclo y respuestas. Si la carga quedó a medias, se completan los alimentos o suplementos faltantes. No ejecutes varias instancias simultáneas. Ejecutarlo otro día registra una nueva jornada de demostración, no elimina la anterior.

Gemini y el modelo deben funcionar: si fallan, la carga reporta estado incompleto, no fabrica preguntas ni resultados. La evidencia local se guarda en `.e2e-runtime/admin-demo-<Tag>.json` sin tokens ni contraseñas. Conserva de forma privada la clave para reintentar.

Finalmente inicia sesión como administrador y actualiza Dashboard, Conocimiento, Consumo y Tiempo. Las métricas incluyen esta muestra artificial; identifica el entorno como demostración y no uses sus agregados como resultados experimentales de tesis. No actives esta carga automáticamente para cada arranque de producción.

GitHub distribuye el script y el dataset, no tu base PostgreSQL. Es necesario ejecutar la carga sobre el servidor; ningún cambio local ha cargado datos remotamente.
