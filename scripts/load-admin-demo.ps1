param([string]$ApiUrl='http://localhost:8080', [string]$Tag='dashboard-20260916')
$ErrorActionPreference='Stop'
if ($ApiUrl -notmatch '^http://(localhost|127\.0\.0\.1)(:\d+)?$') { throw 'Solo se permite el backend local de pruebas.' }
$dataset=Get-Content -Raw (Join-Path $PSScriptRoot 'admin-demo-dataset.json') | ConvertFrom-Json
$hoy=[TimeZoneInfo]::ConvertTimeBySystemTimeZoneId([DateTime]::UtcNow,'SA Pacific Standard Time').ToString('yyyy-MM-dd')
$ayer=([DateTime]::Parse($hoy)).AddDays(-1).ToString('yyyy-MM-dd')
$records=@()
function Call-Api($method,$path,$body,$token) {
    $taskOptions=@{Uri="$ApiUrl$path";Method=$method;TimeoutSec=120;ContentType='application/json'}
    if ($body -ne $null) {$taskOptions.Body=($body|ConvertTo-Json -Depth 12 -Compress)}
    if ($token) {$taskOptions.Headers=@{Authorization="Bearer $token"}}
    Invoke-RestMethod @taskOptions
}
foreach ($case in $dataset.cases) {
    $email="demo-$Tag-$($case.id)@e2e.nutripredic.local"
    $password='DemoLocal!20260916'
    try {
        try {$account=Call-Api POST '/api/auth/register' @{email=$email;password=$password;nombre="DATOS DE PRUEBA E2E ML ADMIN $($case.id)"} $null}
        catch {$account=Call-Api POST '/api/auth/login' @{email=$email;password=$password} $null}
        $client=$account.clienteId; $token=$account.token
        $null=Call-Api PUT "/api/clientes/$client" @{edad=30;sexo='MASCULINO';pesoKg=80;alturaCm=180;objetivoFisico='Mantener peso NO_USAR_ENTRENAMIENTO';tipoObjetivoFisico='MANTENER_PESO';realizaActividadFisica=$true;diasEntrenamientoSemana=4;tipoActividadFisica='Fuerza y caminata';tipoEntrenamiento='FUERZA';duracionPromedioSesionMinutos=60} $token
        # Fecha anterior intencionalmente artificial para probar el ciclo. No representa una observacion real.
        $null=Call-Api POST "/api/clientes/$client/plan-diario/inicial?fecha=$ayer" @{} $token
        $habits=Call-Api GET "/api/habitos/cliente/$client" $null $token
        $habit=@($habits|Where-Object fecha -eq $ayer)[0]
        if (!$habit) {
            $habit=Call-Api POST '/api/habitos' @{clienteId=$client;fecha=$ayer;consumoAgua=$case.waterL;consumeSuplementos=$true;alimentos='GENERATED_E2E_INPUTS / NO_USAR_ENTRENAMIENTO'} $token
            $null=Call-Api POST "/api/habitos/$($habit.id)/alimentos" @{nombreAlimento="DEMO comida $($case.id)";cantidad=1;unidadCodigo='PORCION';momentoComida='ALMUERZO';proteinaG=$case.proteinG;carbohidratosG=$case.carbsG;grasasG=$case.fatG} $token
            $supplement=Call-Api POST "/api/clientes/$client/suplementos" @{nombreSuplemento="DEMO NO CONSUMIR $($case.id)";cantidad=5;unidad='G';activo=$true;fechaInicio=$ayer;cantidadPorToma=5;unidadCodigo='G';proteinaGPorToma=0;carbohidratosGPorToma=0;grasasGPorToma=0;creatinaGPorToma=0;cafeinaMgPorToma=$case.caffeineMg;sodioMgPorToma=0} $token
            $null=Call-Api POST "/api/habitos/$($habit.id)/consumos-suplementos" @{suplementoClienteId=$supplement.id;cantidadConsumida=5;unidadCodigo='G';numeroTomas=1;observacion='GENERATED_E2E_INPUTS NO CONSUMIR'} $token
        }
        # Estas salidas y tiempos los producen los servicios reales; nunca se insertan porcentajes o TPP ficticios.
        $cycle=Call-Api POST "/api/clientes/$client/ciclo-diario/asegurar" @{} $token
        $session=$null; $score=$null
        if ($cycle.estado -eq 'COMPLETADO') {
            $session=Call-Api GET "/api/clientes/$client/conocimiento/post-modelo?fecha=$hoy" $null $token
            if ($session.estadoAdaptativo -eq 'GENERADA') {
                $answers=@(); $i=0
                foreach ($question in $session.preguntasAdaptativas) {$answers+=@{preguntaId=$question.id;opcionSeleccionada=$case.answers[$i]};$i++}
                $score=Call-Api POST "/api/clientes/$client/conocimiento/post-modelo/$($session.sesionId)/respuestas" @{respuestas=$answers} $token
            } else {$score=$session.resultadoAdaptativo}
        }
        $records+=@{email=$email;clienteId=$client;fechaEvaluada=$ayer;fechaAplicada=$hoy;ciclo=$cycle;sesionId=$session.sesionId;resultado=$score;source='GENERATED_E2E_INPUTS'}
        Write-Host "$email : $($cycle.estado)"
    } catch {
        $records+=@{email=$email;estado='FALLIDO';source='GENERATED_E2E_INPUTS';motivo='Consultar logs del backend; no se certifica el caso.'}
        Write-Warning "Caso $($case.id) incompleto; se conserva para diagnostico."
    }
}
$runtime=Join-Path (Split-Path $PSScriptRoot -Parent) '.e2e-runtime'
New-Item -ItemType Directory -Force $runtime | Out-Null
$records|ConvertTo-Json -Depth 20|Out-File (Join-Path $runtime "admin-demo-$Tag.json") -Encoding utf8
Write-Host 'Resultados guardados sin tokens ni credenciales. Revisar admin con esta base local; no usar como muestra de tesis.'
