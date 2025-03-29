# 创建必要的目录
New-Item -ItemType Directory -Force -Path "images"
New-Item -ItemType Directory -Force -Path "images/admin"

# 定义图标下载链接
$icons = @{
    # 底部导航栏图标
    "images/home.png" = "https://cdn.jsdelivr.net/npm/@mdi/svg@7.2.96/svg/home-outline.svg"
    "images/home-active.png" = "https://cdn.jsdelivr.net/npm/@mdi/svg@7.2.96/svg/home.svg"
    "images/order.png" = "https://cdn.jsdelivr.net/npm/@mdi/svg@7.2.96/svg/clipboard-list-outline.svg"
    "images/order-active.png" = "https://cdn.jsdelivr.net/npm/@mdi/svg@7.2.96/svg/clipboard-list.svg"
    "images/profile.png" = "https://cdn.jsdelivr.net/npm/@mdi/svg@7.2.96/svg/account-outline.svg"
    "images/profile-active.png" = "https://cdn.jsdelivr.net/npm/@mdi/svg@7.2.96/svg/account.svg"
    
    # 废品类型图标
    "images/paper.png" = "https://cdn.jsdelivr.net/npm/@mdi/svg@7.2.96/svg/newspaper-variant-outline.svg"
    "images/metal.png" = "https://cdn.jsdelivr.net/npm/@mdi/svg@7.2.96/svg/metal-outline.svg"
    "images/plastic.png" = "https://cdn.jsdelivr.net/npm/@mdi/svg@7.2.96/svg/bottle-soda-outline.svg"
    "images/glass.png" = "https://cdn.jsdelivr.net/npm/@mdi/svg@7.2.96/svg/bottle-wine-outline.svg"
    "images/electronics.png" = "https://cdn.jsdelivr.net/npm/@mdi/svg@7.2.96/svg/television-classic.svg"
    
    # 管理员界面图标
    "images/admin/order.png" = "https://cdn.jsdelivr.net/npm/@mdi/svg@7.2.96/svg/clipboard-text-outline.svg"
    "images/admin/user.png" = "https://cdn.jsdelivr.net/npm/@mdi/svg@7.2.96/svg/account-group-outline.svg"
    "images/admin/collector.png" = "https://cdn.jsdelivr.net/npm/@mdi/svg@7.2.96/svg/truck-outline.svg"
    
    # 其他图标
    "images/default-avatar.png" = "https://cdn.jsdelivr.net/npm/@mdi/svg@7.2.96/svg/account-circle-outline.svg"
    "images/logo.png" = "https://cdn.jsdelivr.net/npm/@mdi/svg@7.2.96/svg/recycle.svg"
}

# 下载图标
foreach ($icon in $icons.GetEnumerator()) {
    $outFile = $icon.Key
    $url = $icon.Value
    
    Write-Host "Downloading $($icon.Key)..."
    Invoke-WebRequest -Uri $url -OutFile $outFile
}

Write-Host "所有图标下载完成！" 