param(
    [string]$BackendRoot = 'C:\Users\Eduardo\Documents\Proyectos\Backend\nutri_predic',
    [string]$AiRoot = 'C:\Users\Eduardo\Documents\Proyectos\nutripredict-ai'
)
$ErrorActionPreference = 'Stop'
$frontendRoot = Split-Path $PSScriptRoot -Parent
$runtime = Join-Path $frontendRoot '.e2e-runtime'
New-Item -ItemType Directory -Force -Path $runtime | Out-Null

# Load local credentials only into this process and its children. Never log them.
foreach ($line in Get-Content -LiteralPath (Join-Path $BackendRoot '.env')) {
    if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$') {
        $value = $Matches[2].Trim()
        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or
            ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        [Environment]::SetEnvironmentVariable($Matches[1], $value, 'Process')
    }
}
if ([string]::IsNullOrWhiteSpace($env:API_KEY_GEMINI)) { throw 'Falta API_KEY_GEMINI en backend/.env.' }
$env:GEMINI_MOCK_ENABLED = 'false'
$env:SPRING_PROFILES_ACTIVE = 'default'
$env:NUTRIPREDICT_ML_BASE_URL = 'http://localhost:8000'
$env:AI_SERVICE_URL = 'http://localhost:8000/predict'
$env:VITE_API_URL = 'http://localhost:8080'

$metadata = Get-Content -LiteralPath (Join-Path $AiRoot 'models/nutripredict_v6.metadata.json') -Raw | ConvertFrom-Json
if ($metadata.modelVersion -ne 'random-forest-v6-final-002' -or
    $metadata.modelType -ne 'RANDOM_FOREST' -or
    $metadata.trainingDataType -ne 'REAL' -or !$metadata.isThesisFinalModel) {
    throw 'El artefacto no cumple el contrato esperado del modelo final 002.'
}
$jar = Join-Path $BackendRoot 'target/nutri_predic-0.0.1-SNAPSHOT.jar'
if (!(Test-Path -LiteralPath $jar)) { throw 'Falta el JAR del backend. Compilar package -DskipTests antes de arrancar.' }

function Start-LocalService($name, $port, $exe, $arguments, $directory) {
    $listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($listener) { Write-Host "$name ya escucha en $port; se verificara sin interrumpirlo."; return }
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $process = Start-Process -FilePath $exe -ArgumentList $arguments -WorkingDirectory $directory `
        -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput (Join-Path $runtime "$name-$stamp.out.log") `
        -RedirectStandardError (Join-Path $runtime "$name-$stamp.err.log")
    Write-Host "$name iniciado: PID $($process.Id), puerto $port."
}

function Wait-Endpoint($url) {
    $deadline = (Get-Date).AddSeconds(45)
    do {
        try { return Invoke-RestMethod -Uri $url -TimeoutSec 3 } catch { Start-Sleep -Milliseconds 500 }
    } while ((Get-Date) -lt $deadline)
    throw "No responde $url. Revisar logs en $runtime."
}

Start-LocalService 'ai' 8000 (Get-Command python.exe).Source '-m uvicorn app.main:app --host 127.0.0.1 --port 8000' $AiRoot
$health = Wait-Endpoint 'http://localhost:8000/health'
if ($health.v6ModelVersion -ne 'random-forest-v6-final-002' -or !$health.v6ThesisFinalModel) {
    throw 'La IA en ejecucion no carga el final 002. No iniciar la prueba.'
}
Start-LocalService 'backend' 8080 (Get-Command java.exe).Source ('-jar "' + $jar + '"') $BackendRoot
$backendHealth = Wait-Endpoint 'http://localhost:8080/actuator/health'
if ($backendHealth.status -ne 'UP') { throw 'Backend no esta UP.' }
Start-LocalService 'frontend' 5173 (Get-Command node.exe).Source 'node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 --strictPort' $frontendRoot
Wait-Endpoint 'http://localhost:5173' | Out-Null
Write-Host 'LISTO: http://localhost:5173 | Random Forest final 002 | Gemini real | PostgreSQL actual.'
Write-Host 'No se borraron usuarios, registros ni tablas. Cerrar sesion y registrar un usuario E2E nuevo.'
