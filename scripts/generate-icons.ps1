$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$baseDir = "C:\Users\Rangelmaker\.gemini\antigravity\scratch\hit-fit"
$publicDir = "$baseDir\public"

$targets = @(
    @{ name = "icon-512.png"; size = 512; svg = "$publicDir\icon.svg" },
    @{ name = "icon-192.png"; size = 192; svg = "$publicDir\icon.svg" },
    @{ name = "apple-touch-icon.png"; size = 180; svg = "$publicDir\icon.svg" },
    @{ name = "favicon.png"; size = 32; svg = "$publicDir\favicon.svg" },
    @{ name = "icon-maskable-512.png"; size = 512; svg = "$publicDir\icon-maskable.svg" }
)

foreach ($t in $targets) {
    $outPath = "$publicDir\" + $t.name
    $svgUri = "file:///" + ($t.svg -replace '\\', '/')
    $w = $t.size
    $h = $t.size

    # Cria arquivo HTML temporário sem margens
    $tempHtml = "$baseDir\temp-render-$w.html"
    $htmlContent = @"
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body, html { width: ${w}px; height: ${h}px; overflow: hidden; background: transparent; }
  img { width: 100%; height: 100%; display: block; }
</style>
</head>
<body>
<img src="$svgUri" />
</body>
</html>
"@
    Set-Content -Path $tempHtml -Value $htmlContent -Encoding UTF8

    $htmlUri = "file:///" + ($tempHtml -replace '\\', '/')
    $args = @(
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        "--window-size=$w,$h",
        "--screenshot=$outPath",
        "$htmlUri"
    )

    Start-Process -FilePath $edgePath -ArgumentList $args -Wait
    Remove-Item -Path $tempHtml -Force -ErrorAction SilentlyContinue

    if (Test-Path $outPath) {
        $len = (Get-Item $outPath).Length
        Write-Output "Gerado com sucesso: $($t.name) ($len bytes)"
    } else {
        Write-Output "Falha ao gerar $($t.name)"
    }
}
