# GitHub推送说明

要解决推送代码到GitHub的问题，您有以下几种方法：

## 方法一：使用个人访问令牌（推荐）

1. 登录到您的GitHub账户
2. 点击右上角头像 -> Settings -> Developer settings -> Personal access tokens -> Tokens (classic)
3. 点击"Generate new token"，选择"Generate new token (classic)"
4. 给令牌一个名称（如"废品回收项目"）
5. 选择权限范围（至少需要"repo"权限）
6. 点击"Generate token"按钮创建令牌
7. 复制生成的令牌（重要：这是唯一一次可以查看完整令牌的机会）

然后，在命令行中使用以下命令推送：

```bash
git remote set-url origin https://[您的GitHub用户名]:[您的个人访问令牌]@github.com/K1rUnbroken/waste-recycling-system.git
git push -u origin master
```

例如：
```bash
git remote set-url origin https://K1rUnbroken:ghp_xxxxxxxxxxxxxxxxxxxx@github.com/K1rUnbroken/waste-recycling-system.git
git push -u origin master
```

## 方法二：配置Git凭据管理器

在Windows上，您可以使用Git凭据管理器来存储您的凭据：

```bash
git config --global credential.helper manager
```

然后尝试推送，系统会弹出登录窗口，输入您的GitHub用户名和个人访问令牌（不是密码）。

## 方法三：修复SSH连接问题

1. 检查您的SSH公钥是否已添加到GitHub账户：
   - 查看您的公钥内容：`cat ~/.ssh/id_rsa.pub`
   - 登录GitHub -> Settings -> SSH and GPG keys -> New SSH key
   - 添加您的公钥

2. 修复hosts文件中的GitHub解析问题（因为我们看到GitHub被解析为127.0.0.1）：
   - 以管理员身份打开记事本
   - 打开文件：C:\Windows\System32\drivers\etc\hosts
   - 检查是否有github.com被错误映射到127.0.0.1
   - 如果有，删除或注释该行
   - 添加：`140.82.114.3 github.com`（GitHub的一个IP地址，可能会变化）
   - 保存文件

3. 然后重新设置远程URL为SSH格式并尝试推送：
   ```bash
   git remote set-url origin git@github.com:K1rUnbroken/waste-recycling-system.git
   git push -u origin master
   ```

## 注意事项

- 避免将node_modules目录提交到GitHub，它通常非常大且不必要
- 已经添加了.gitignore文件来排除这些目录

祝您成功推送代码！ 