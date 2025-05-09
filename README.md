# 废品回收微信小程序

## 项目简介

本项目是一个废品回收微信小程序，包含三种用户角色（普通用户、回收员和管理员），实现废品回收预约、订单管理、回收员接单和后台管理等功能。

## 项目架构

### 前端（微信小程序）

- 基于微信小程序原生开发
- 使用WXML、WXSS、JavaScript实现界面和逻辑
- 分角色模块化设计：用户端、回收员端和管理员端

### 后端（Node.js）

- 基于Express.js框架
- MySQL数据库存储
- JWT实现身份认证
- 实现RESTful API接口

## 功能模块

### 用户端

1. **用户认证**
   - 用户注册
   - 用户登录
   - 身份验证

2. **废品回收预约**
   - 创建回收订单
   - 选择废品种类
   - 设置重量、地址、预约时间

3. **订单管理**
   - 查看订单列表
   - 查看订单详情
   - 取消订单

### 回收员端

1. **回收员认证**
   - 回收员登录
   - 身份验证

2. **订单处理**
   - 查看待接单列表
   - 接受订单
   - 开始上门服务
   - 完成订单

3. **数据统计**
   - 查看历史订单
   - 查看收益统计

### 管理员端

1. **管理员认证**
   - 管理员登录
   - 身份验证

2. **数据概览**
   - 总订单数
   - 总用户数
   - 总回收员数
   - 总收益

3. **数据管理**
   - 查看最近订单
   - 查看最近用户
   - 查看今日数据

## 数据库结构

### 用户表（users）

| 字段名      | 类型             | 说明         |
|------------|-----------------|-------------|
| id         | INT (PK)        | 用户ID       |
| phone      | VARCHAR(20)     | 手机号       |
| name       | VARCHAR(50)     | 用户名       |
| password   | VARCHAR(100)    | 密码         |
| create_time| TIMESTAMP       | 创建时间     |

### 回收员表（collectors）

| 字段名       | 类型            | 说明          |
|-------------|----------------|--------------|
| id          | INT (PK)       | 回收员ID      |
| phone       | VARCHAR(20)    | 手机号        |
| name        | VARCHAR(50)    | 回收员姓名    |
| password    | VARCHAR(100)   | 密码          |
| id_card     | VARCHAR(18)    | 身份证号      |
| status      | VARCHAR(20)    | 在线状态      |
| total_income| DECIMAL(10,2)  | 总收益        |
| rating      | DECIMAL(2,1)   | 评分          |
| order_count | INT            | 订单数量      |
| create_time | TIMESTAMP      | 创建时间      |

### 管理员表（admins）

| 字段名      | 类型             | 说明         |
|------------|-----------------|-------------|
| id         | INT (PK)        | 管理员ID     |
| username   | VARCHAR(50)     | 用户名       |
| name       | VARCHAR(50)     | 姓名         |
| password   | VARCHAR(100)    | 密码         |
| create_time| TIMESTAMP       | 创建时间     |

### 订单表（orders）

| 字段名          | 类型            | 说明           |
|----------------|----------------|---------------|
| id             | INT (PK)       | 订单ID         |
| user_id        | INT (FK)       | 用户ID         |
| user_name      | VARCHAR(50)    | 用户名         |
| category_id    | INT            | 废品类别ID     |
| category_name  | VARCHAR(50)    | 废品类别名     |
| weight         | DECIMAL(10,2)  | 预估重量       |
| address        | TEXT           | 地址           |
| appointment_date | DATE        | 预约日期       |
| appointment_time | TIME        | 预约时间       |
| remark         | TEXT           | 备注           |
| status         | VARCHAR(20)    | 订单状态       |
| collector_id   | INT (FK)       | 回收员ID       |
| collector_name | VARCHAR(50)    | 回收员姓名     |
| collector_phone| VARCHAR(20)    | 回收员手机号   |
| actual_weight  | DECIMAL(10,2)  | 实际重量       |
| amount         | DECIMAL(10,2)  | 实际金额       |
| estimated_amount| DECIMAL(10,2) | 预估金额       |
| create_time    | TIMESTAMP      | 创建时间       |
| accept_time    | TIMESTAMP      | 接单时间       |
| start_time     | TIMESTAMP      | 开始服务时间   |
| complete_time  | TIMESTAMP      | 完成时间       |
| cancel_time    | TIMESTAMP      | 取消时间       |

## API接口

### 用户相关

- `POST /user/register` - 用户注册
- `POST /user/login` - 用户登录
- `GET /user/check-token` - 验证用户token

### 管理员相关

- `POST /admin/login` - 管理员登录
- `GET /admin/check-token` - 验证管理员token
- `GET /admin/overview` - 获取数据概览
- `GET /admin/today` - 获取今日数据
- `GET /admin/recent-orders` - 获取最近订单
- `GET /admin/recent-users` - 获取最近用户

### 订单相关

- `POST /orders` - 创建订单
- `GET /orders` - 获取用户订单列表
- `GET /orders/:id` - 获取订单详情
- `POST /orders/:id/cancel` - 取消订单

### 回收员相关

- `POST /collector/login` - 回收员登录
- `GET /collector/check-token` - 验证回收员token
- `GET /collector/orders/pending` - 获取待接单列表
- `POST /collector/orders/:id/accept` - 接单
- `GET /collector/orders` - 获取回收员订单列表
- `GET /collector/orders/:id` - 获取回收员订单详情
- `POST /collector/orders/:id/start` - 开始上门服务
- `POST /collector/orders/:id/complete` - 完成订单

## 开发环境

- 微信开发者工具
- Node.js v12.0+ 
- MySQL 5.7+

## 部署说明

1. 克隆项目
2. 安装依赖：
   ```
   cd server
   npm install
   ```
3. 导入数据库：
   ```
   mysql -u username -p < server/config/init.sql
   ```
4. 启动服务器：
   ```
   cd server
   node server.js
   ```
5. 使用微信开发者工具打开小程序目录

## 更新日志

### 2025-04-01
- 创建独立的管理员表(admins)，将管理员与普通用户分离
- 修改管理员登录和认证逻辑，使用新的admins表
- 提供数据迁移脚本，支持现有管理员数据迁移

### 2025-03-31
- 修复管理员登录问题，正确保存adminToken
- 修复管理员数据统计接口
- 添加详细日志记录

### 2025-03-30
- 实现回收员接单流程
- 修复订单创建和取消功能
- 添加订单详情页面

### 2025-03-29
- 添加用户注册功能
- 优化登录页面
- 初始化项目结构 