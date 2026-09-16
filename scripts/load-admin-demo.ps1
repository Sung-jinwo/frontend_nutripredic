param(
    [string]$ApiUrl='http://localhost:8080',
    [string]$Tag='dashboard-20260916',
    [switch]$AllowRemoteDemo,
    [SecureString]$DemoPassword
)
$ErrorActionPreference='Stop'
$ApiUrl=$ApiUrl.TrimEnd('/')
$targetUri=[Uri]$ApiUrl
if (!$targetUri.IsAbsoluteUri -or $targetUri.UserInfo -or $targetUri.Query -or $targetUri.Fragment -or $targetUri.AbsolutePath -ne '/') { throw 'ApiUrl debe ser el origen del backend, sin ruta, credenciales ni query.' }
$isLocal=$targetUri.Host -in @('localhost','127.0.0.1','::1')
if ($targetUri.Scheme -notin @('http','https')) { throw 'Se requiere HTTP o HTTPS.' }
if (!$isLocal -and (!$AllowRemoteDemo -or $targetUri.Scheme -ne 'https')) { throw 'La carga remota requiere HTTPS y -AllowRemoteDemo; solo usar en una base de demostracion.' }
if ($Tag -notmatch '^[a-zA-Z0-9-]{1,60}$') { throw 'Tag invalido: usa letras, numeros y guiones (maximo 60).' }
if (!$isLocal -and !$DemoPassword) { throw 'Para el servidor proporciona -DemoPassword (Read-Host -AsSecureString). No se permite la clave local publica.' }
$password=if ($DemoPassword) { [System.Net.NetworkCredential]::new('', $DemoPassword).Password } else { 'DemoLocal!20260916' }
if ($password.Length -lt 12) { throw 'La clave de demostracion debe tener al menos 12 caracteres.' }
if (!$isLocal) { Write-Warning 'Se crearan clientes artificiales y se ejecutaran modelo/Gemini reales en el servidor; no usar como muestra de tesis.' }
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
    $stage='autenticacion'
    try {
        try {$account=Call-Api POST '/api/auth/register' @{email=$email;password=$password;nombre="DATOS DE PRUEBA E2E ML ADMIN $($case.id)"} $null}
        catch {$account=Call-Api POST '/api/auth/login' @{email=$email;password=$password} $null}
        $client=$account.clienteId; $token=$account.token
        $stage='perfil'
        $profile=Call-Api GET "/api/clientes/$client" $null $token
        if (!$profile.pesoKg -or !$profile.alturaCm -or !$profile.tipoEntrenamiento) {
            $profileBody=@{edad=30;sexo='MASCULINO';alturaCm=180;objetivoFisico='Mantener peso NO_USAR_ENTRENAMIENTO';tipoObjetivoFisico='MANTENER_PESO';realizaActividadFisica=$true;diasEntrenamientoSemana=4;tipoActividadFisica='Fuerza y caminata';tipoEntrenamiento='FUERZA';duracionPromedioSesionMinutos=60}
            if (!$profile.pesoKg) { $profileBody.pesoKg=80 }
            $null=Call-Api PUT "/api/clientes/$client" $profileBody $token
        }
        # Fecha anterior intencionalmente artificial para probar el ciclo. No representa una observacion real.
        $stage='plan-anterior'
        $null=Call-Api POST "/api/clientes/$client/plan-diario/inicial?fecha=$ayer" @{} $token
        $stage='registro-diario'
        $habits=Call-Api GET "/api/habitos/cliente/$client" $null $token
        $habit=@($habits|Where-Object fecha -eq $ayer)[0]
        if (!$habit) {
            $habit=Call-Api POST '/api/habitos' @{clienteId=$client;fecha=$ayer;consumoAgua=$case.waterL;consumeSuplementos=$true;alimentos='GENERATED_E2E_INPUTS / NO_USAR_ENTRENAMIENTO'} $token
        }
        $stage='alimentos'
        $foods=Call-Api GET "/api/habitos/$($habit.id)/alimentos" $null $token
        if (@($foods).Count -eq 0) {
            $null=Call-Api POST "/api/habitos/$($habit.id)/alimentos" @{nombreAlimento="DEMO comida $($case.id)";cantidad=1;unidadCodigo='PORCION';momentoComida='ALMUERZO';proteinaG=$case.proteinG;carbohidratosG=$case.carbsG;grasasG=$case.fatG} $token
        }
        $stage='suplementos'
        $supplements=Call-Api GET "/api/clientes/$client/suplementos" $null $token
        $supplement=@($supplements|Where-Object nombre -eq "DEMO NO CONSUMIR $($case.id)")[0]
        if (!$supplement) {
            $supplement=Call-Api POST "/api/clientes/$client/suplementos" @{nombreSuplemento="DEMO NO CONSUMIR $($case.id)";cantidad=5;unidad='G';activo=$true;fechaInicio=$ayer;cantidadPorToma=5;unidadCodigo='G';proteinaGPorToma=0;carbohidratosGPorToma=0;grasasGPorToma=0;creatinaGPorToma=0;cafeinaMgPorToma=$case.caffeineMg;sodioMgPorToma=0} $token
        }
        $consumptions=Call-Api GET "/api/habitos/$($habit.id)/consumos-suplementos" $null $token
        if (@($consumptions|Where-Object suplementoClienteId -eq $supplement.id).Count -eq 0) {
            $null=Call-Api POST "/api/habitos/$($habit.id)/consumos-suplementos" @{suplementoClienteId=$supplement.id;cantidadConsumida=5;unidadCodigo='G';numeroTomas=1;observacion='GENERATED_E2E_INPUTS NO CONSUMIR'} $token
        }
        # Estas salidas y tiempos los producen los servicios reales; nunca se insertan porcentajes o TPP ficticios.
        $stage='ciclo-diario'
        $cycle=Call-Api POST "/api/clientes/$client/ciclo-diario/asegurar" @{} $token
        $session=$null; $score=$null
        if ($cycle.estado -eq 'COMPLETADO') {
            $stage='conocimiento'
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
        $status=if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
        $records+=@{email=$email;estado='FALLIDO';source='GENERATED_E2E_INPUTS';etapa=$stage;httpStatus=$status;motivo='Consultar logs del backend; no se certifica el caso.'}
        Write-Warning "Caso $($case.id) incompleto en $stage (HTTP $status); se conserva para diagnostico."
    }
}
$runtime=Join-Path (Split-Path $PSScriptRoot -Parent) '.e2e-runtime'
New-Item -ItemType Directory -Force $runtime | Out-Null
$records|ConvertTo-Json -Depth 20|Out-File (Join-Path $runtime "admin-demo-$Tag.json") -Encoding utf8
Write-Host 'Resultados guardados sin tokens ni credenciales. Revisar admin en el backend indicado; no usar como muestra de tesis.'
if (@($records | Where-Object { $_.estado -eq 'FALLIDO' -or $_.ciclo.estado -ne 'COMPLETADO' }).Count -gt 0) { throw 'Carga parcial: revisar evidencia y reintentar con el mismo Tag. No se certifica la muestra completa.' }
