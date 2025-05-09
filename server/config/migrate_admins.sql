-- 从users表中查找可能的管理员用户（这里假设管理员用户名可能是'admin'）
-- 并将它们迁移到admins表
INSERT INTO admins (username, name, password, create_time)
SELECT phone, name, password, create_time
FROM users
WHERE phone = 'admin'
ON DUPLICATE KEY UPDATE id=id;

-- 如果需要，可以从users表中删除这些管理员用户
-- DELETE FROM users WHERE phone = 'admin'; 