# 管理员表迁移指南

本文件提供了将管理员用户从users表迁移到新的admins表的步骤。

## 迁移步骤

1. 确保MySQL服务已启动。

2. 首先创建管理员表：
   ```bash
   mysql -u root -p recycling_db < create_admins_table.sql
   ```

3. 然后迁移现有的管理员用户：
   ```bash
   mysql -u root -p recycling_db < migrate_admins.sql
   ```

4. 迁移完成后，你可以验证管理员表是否包含正确的数据：
   ```sql
   USE recycling_db;
   SELECT * FROM admins;
   ```

## 回滚步骤（如果需要）

如果遇到问题，可以按以下步骤回滚：

1. 删除管理员表（警告：这将删除所有管理员数据）：
   ```sql
   USE recycling_db;
   DROP TABLE IF EXISTS admins;
   ```

2. 确保users表中的管理员用户数据仍然存在。如果不存在，请从备份中恢复。

## 注意事项

- 迁移脚本假设管理员用户在users表中的phone字段值为'admin'。如果你的管理员用户使用了不同的名称，请相应地修改migrate_admins.sql脚本。
- 迁移脚本默认不会从users表中删除管理员用户。如果你希望删除，请取消注释migrate_admins.sql中的DELETE语句。
- 执行脚本前请确保已备份数据库，以防发生意外。 