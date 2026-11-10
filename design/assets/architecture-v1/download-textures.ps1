$ErrorActionPreference = 'Stop'
$sourceRoot = Join-Path $PSScriptRoot 'textures'
New-Item -ItemType Directory -Force $sourceRoot | Out-Null
$entries = @()
foreach ($assetId in @('concrete_wall_006', 'concrete_floor_worn_02')) {
    $metadata = Invoke-RestMethod -Uri "https://api.polyhaven.com/files/$assetId"
    foreach ($mapName in @('Diffuse', 'nor_gl', 'Rough')) {
        $map = $metadata.$mapName.'1k'.jpg
        if (-not $map.url -or $map.size -gt 10000000) { throw "Unexpected map metadata: $assetId/$mapName" }
        $filename = "$assetId-$mapName.jpg"
        $target = Join-Path $sourceRoot $filename
        Invoke-WebRequest -Uri $map.url -OutFile $target -UseBasicParsing
        $checksum = (Get-FileHash -LiteralPath $target -Algorithm MD5).Hash.ToLowerInvariant()
        if ($checksum -ne $map.md5) { throw "Checksum mismatch: $filename" }
        $entries += [ordered]@{ asset = $assetId; map = $mapName; file = "textures/$filename"; url = $map.url; md5 = $checksum; bytes = (Get-Item -LiteralPath $target).Length }
        Write-Output "Verified $filename"
    }
}
[ordered]@{ license = 'CC0'; licenseUrl = 'https://polyhaven.com/license'; resolution = '1k'; assets = $entries } | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'texture-provenance.json') -Encoding UTF8
