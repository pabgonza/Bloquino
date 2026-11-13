# Levanta Bloquino para la clase con la IP de hoy en el certificado de HTTPS y
# muestra las direcciones para los alumnos. Desde repo/:
#   .\scripts\sala.ps1            (antes de cada clase)
#   .\scripts\sala.ps1 --build    (después de traer cambios del repositorio)
# Guía: docs/bloquino-dia-de-clase.md
$ip = (Get-NetIPConfiguration |
    Where-Object { $_.IPv4DefaultGateway -and $_.NetAdapter.Status -eq 'Up' } |
    Select-Object -First 1).IPv4Address.IPAddress
if (-not $ip) {
  Write-Host 'No encuentro una red conectada: conecta el notebook a la red de la sala.'
  exit 1
}
$env:BLOQUINO_NOMBRES = "$ip,$env:COMPUTERNAME"
docker compose -f "$PSScriptRoot\..\docker-compose.bloquino.yml" up -d @args
if ($LASTEXITCODE) { exit 1 }
Write-Host ''
Write-Host "Alumnos:                    https://$ip"
Write-Host "La primera vez, cada equipo: http://$ip/ca.crt  (instalar el certificado)"
Write-Host "Solo simular, sin cargar:    http://$ip"
