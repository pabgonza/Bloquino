# Puente entre un puerto serie y un puerto TCP local, para probar la carga a
# una placa real desde los tests (el navegador no interviene):
#   powershell -File scripts\puente-serie.ps1 COM7
# y en otra terminal, desde frontend\:
#   $env:BLOQUINO_PUENTE = 4700; npx vitest run src/__tests__/bloquino-carga.test.ts
# Atiende a un cliente: al conectarse reinicia la placa (pulso en DTR) y pasa
# los bytes en los dos sentidos hasta que el cliente se va.
param([string]$Puerto = 'COM7', [int]$Tcp = 4700)
$escucha = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Tcp)
$escucha.Start()
Write-Host "Puente $Puerto <-> 127.0.0.1:$Tcp, esperando al test..."
$cliente = $escucha.AcceptTcpClient()
$red = $cliente.GetStream()
$serie = New-Object System.IO.Ports.SerialPort $Puerto, 115200, 'None', 8, 'One'
$serie.DtrEnable = $false; $serie.RtsEnable = $false
$serie.Open()
Start-Sleep -Milliseconds 100
$serie.DtrEnable = $true; $serie.RtsEnable = $true
$bytes = New-Object byte[] 4096
# Lo que el cliente mandó antes del reinicio se descarta: llegaría todo junto.
while ($red.DataAvailable) { [void]$red.Read($bytes, 0, $bytes.Length) }
$pasados = 0
try {
  while ($true) {
    $hubo = $false
    if ($red.DataAvailable) {
      $n = $red.Read($bytes, 0, $bytes.Length)
      $serie.Write($bytes, 0, $n); $pasados += $n; $hubo = $true
    } elseif ($cliente.Client.Poll(0, 'SelectRead') -and $cliente.Client.Available -eq 0) {
      break  # legible y sin datos: el cliente cerró
    }
    if ($serie.BytesToRead -gt 0) {
      $n = $serie.Read($bytes, 0, [Math]::Min($bytes.Length, $serie.BytesToRead))
      $red.Write($bytes, 0, $n); $pasados += $n; $hubo = $true
    }
    if (-not $hubo) { Start-Sleep -Milliseconds 1 }
  }
} finally {
  $serie.Close(); $cliente.Close(); $escucha.Stop()
  Write-Host "Puente cerrado: $pasados bytes."
}
