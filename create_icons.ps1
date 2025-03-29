# 创建必要的目录
New-Item -ItemType Directory -Force -Path "images"
New-Item -ItemType Directory -Force -Path "images/admin"

# 基础图标 SVG 内容
$homeIcon = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
</svg>
"@

$orderIcon = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M7,7H17V5H19V19H5V5H7V7M12,17V15H7V17H12M17,13H7V11H17V13M17,9H7V7H17V9Z" />
</svg>
"@

$profileIcon = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
</svg>
"@

# 将 SVG 转换为 PNG 并保存
$files = @{
    "images/home.png" = $homeIcon
    "images/home-active.png" = $homeIcon
    "images/order.png" = $orderIcon
    "images/order-active.png" = $orderIcon
    "images/profile.png" = $profileIcon
    "images/profile-active.png" = $profileIcon
}

foreach ($file in $files.GetEnumerator()) {
    $svg = $file.Value
    $outFile = $file.Key
    
    # 创建一个临时的 SVG 文件
    $svg | Out-File "temp.svg" -Encoding UTF8
    
    # 使用 ImageMagick 转换（如果安装了的话）
    if (Get-Command "magick" -ErrorAction SilentlyContinue) {
        magick convert "temp.svg" -resize 48x48 $outFile
    } else {
        # 如果没有 ImageMagick，至少保存 SVG 文件
        Copy-Item "temp.svg" $outFile
    }
}

# 清理临时文件
Remove-Item "temp.svg" -ErrorAction SilentlyContinue

Write-Host "图标创建完成！" 