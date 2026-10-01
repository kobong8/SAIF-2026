$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$pythonPath = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $pythonPath)) {
    throw 'Virtual environment not found. Run .\install.ps1 first.'
}
& $pythonPath -c 'import fastapi, uvicorn'
if ($LASTEXITCODE -ne 0) { throw 'Dependencies are missing. Run .\install.ps1 first.' }
$portProbe = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 8930)
$portProbe.Server.ExclusiveAddressUse = $true
try {
    $portProbe.Start()
} catch [System.Net.Sockets.SocketException] {
    if ($_.Exception.SocketErrorCode -eq [System.Net.Sockets.SocketError]::AddressAlreadyInUse) {
        Write-Host 'Port 8930 is already in use. If this app is running, open http://127.0.0.1:8930.'
        Write-Host 'To restart it, press Ctrl+C in the existing server terminal, then run .\start.ps1 again.'
        exit 1
    }
    throw
} finally {
    $portProbe.Stop()
}
Write-Host 'Open http://127.0.0.1:8930 in your browser. Press Ctrl+C to stop.'
& $pythonPath -m uvicorn main:app --host 127.0.0.1 --port 8930
exit $LASTEXITCODE
