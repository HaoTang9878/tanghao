# 数据库实践笔记

> 数据是系统的核心，数据库是数据的守护者。

本文整理了日常开发中数据库相关的学习笔记和实践经验，涵盖关系型数据库（MySQL / PostgreSQL）、缓存数据库（Redis）以及数据库设计原则。

---

## § 01 · MySQL / PostgreSQL 基础

### 索引优化

索引是提升查询性能的第一手段，但不当的索引反而会拖慢写入速度。MySQL 默认使用 B+ 树索引，PostgreSQL 则支持 B-tree、Hash、GIN、GiST 等多种类型。创建索引的核心原则是：**为高频查询的过滤条件（WHERE）、排序字段（ORDER BY）和连接键（JOIN ON）建索引**，同时避免在低区分度列（如性别、状态）上单独建索引。

最左前缀原则是联合索引的灵魂：如果建了 `(a, b, c)` 联合索引，查询条件只有 `b` 或 `c` 时无法命中，必须从 `a` 开始。此外，`EXPLAIN` 是分析索引命中情况的利器，重点关注 `type`（访问类型）和 `rows`（预估扫描行数）。

```sql
-- 创建联合索引：先过滤性强的列，再排序列
CREATE INDEX idx_user_status_created ON orders(user_id, status, created_at);

-- 查看查询计划：确认是否走索引
EXPLAIN SELECT * FROM orders
WHERE user_id = 1001 AND status = 'paid'
ORDER BY created_at DESC LIMIT 20;

-- PostgreSQL 查看详细执行计划（含实际耗时）
EXPLAIN ANALYZE SELECT * FROM orders
WHERE user_id = 1001 AND status = 'paid';

-- 强制使用指定索引（仅 MySQL，谨慎使用，用于调试）
SELECT * FROM orders USE INDEX(idx_user_status_created)
WHERE user_id = 1001;
```

### 查询计划分析

`EXPLAIN` 输出的核心字段：`type` 从好到差依次为 `system > const > eq_ref > ref > range > index > ALL`，出现 `ALL` 说明全表扫描，需要优化。`Extra` 列中出现 `Using filesort`（文件排序）或 `Using temporary`（临时表）是性能隐患信号。PostgreSQL 的 `EXPLAIN ANALYZE` 会实际执行查询并返回真实耗时，比 MySQL 更适合精确定位瓶颈。

```sql
-- MySQL: 分析多表 JOIN 的查询计划
EXPLAIN
SELECT o.id, o.total, u.name
FROM orders o
INNER JOIN users u ON o.user_id = u.id
WHERE o.status = 'paid' AND o.created_at > '2025-01-01';

-- PostgreSQL: 带实际执行的详细分析
EXPLAIN (ANALYZE, BUFFERS)
SELECT o.id, o.total, u.name
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.status = 'paid' AND o.created_at > '2025-01-01';

-- 查看索引使用情况（PostgreSQL）
SELECT indexrelname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

### 事务隔离级别

SQL 标准定义了四种隔离级别，从低到高依次为：读未提交（Read Uncommitted）、读已提交（Read Committed）、可重复读（Repeatable Read）、串行化（Serializable）。MySQL InnoDB 默认使用可重复读，通过 MVCC + Next-Key Lock 解决幻读问题。PostgreSQL 默认使用读已提交，在需要一致性快照时手动切换到可重复读。

```sql
-- MySQL: 查看和设置当前会话隔离级别
SELECT @@transaction_isolation;
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- PostgreSQL: 查看和设置隔离级别
SHOW transaction_isolation;
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- 演示幻读问题（读已提交级别下）
-- 事务 A
BEGIN;
SELECT COUNT(*) FROM orders WHERE status = 'paid';  -- 返回 100
-- 事务 B 插入一条 paid 订单并提交
SELECT COUNT(*) FROM orders WHERE status = 'paid';  -- 返回 101（幻读）
COMMIT;

-- 可重复读级别下，同一事务内多次读取结果一致
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT COUNT(*) FROM orders WHERE status = 'paid';  -- 返回 100
-- 事务 B 插入并提交
SELECT COUNT(*) FROM orders WHERE status = 'paid';  -- 仍返回 100
COMMIT;
```

---

## § 02 · Redis 实战

### 缓存策略

Redis 作为缓存层时，最常用的策略是 Cache-Aside（旁路缓存）：读时先查缓存，未命中则查数据库并回写缓存；写时先更新数据库再删除缓存。为什么是删除而不是更新缓存？因为更新缓存存在并发覆盖风险——两个写请求可能以错误的顺序覆盖缓存。对于热点数据，可以配合 TTL 过期时间做兜底，避免缓存永久驻留导致数据不一致。

缓存击穿（热点 key 过期瞬间大量请求穿透到数据库）可用互斥锁或逻辑过期方案解决；缓存穿透（查询不存在的数据）可用布隆过滤器或缓存空值拦截；缓存雪崩（大量 key 同时过期）可通过给 TTL 加随机抖动来缓解。

```python
# Cache-Aside 模式：先查缓存，未命中查 DB 并回写
import redis
import json

r = redis.Redis(host='localhost', port=6379, db=0)

def get_user(user_id):
    cache_key = f"user:{user_id}"
    # 1. 查缓存
    cached = r.get(cache_key)
    if cached:
        return json.loads(cached)
    # 2. 未命中，查数据库（伪代码）
    user = db.query("SELECT * FROM users WHERE id = %s", user_id)
    if user:
        # 3. 回写缓存，设置随机 TTL 防雪崩
        r.setex(cache_key, 3600 + random.randint(0, 300), json.dumps(user))
    else:
        # 4. 空值缓存，防穿透
        r.setex(cache_key, 60, "")
    return user

def update_user(user_id, data):
    # 1. 更新数据库
    db.update("users", data, where={"id": user_id})
    # 2. 删除缓存（而非更新，避免并发覆盖）
    r.delete(f"user:{user_id}")
```

### 数据结构选择

Redis 提供五种核心数据结构，选择依据是访问模式：**String** 适合简单 KV 缓存和计数器；**Hash** 适合存储对象字段（比 String 存 JSON 更省内存且支持局部更新）；**List** 适合消息队列和时间线；**Set** 适合去重和交集运算（如共同好友）；**ZSet** 适合排行榜和延迟队列。

```bash
# Hash 存储用户对象：O(1) 字段级更新，比 String+JSON 更高效
HSET user:1001 name "BruceTang" age 28 role "developer"
HGET user:1001 name
HGETALL user:1001

# ZSet 实现排行榜：按分数排序，支持范围查询
ZADD ranking:score 9800 "player_A" 9500 "player_B" 9900 "player_C"
ZREVRANGE ranking:score 0 9 WITHSCORES  # Top 10

# Set 实现共同关注
SADD follow:user:A "user_B" "user_C" "user_D"
SADD follow:user:B "user_A" "user_C" "user_E"
SINTER follow:user:A follow:user:B  # 返回 ["user_C"]

# List 实现简易消息队列（左进右出）
LPUSH task:queue "task_1" "task_2"
RPOP task:queue  # 取出 "task_1"
```

### 持久化方案

Redis 提供两种持久化机制：**RDB**（快照）和 **AOF**（追加日志）。RDB 在指定时间间隔内将内存数据集快照写入磁盘，文件紧凑、恢复速度快，但可能丢失最后一次快照后的数据。AOF 记录每条写命令，数据安全性更高，但文件体积大、恢复速度慢。生产环境通常两者混用：RDB 做定期全量备份，AOF 做增量追加，AOF 重写机制自动压缩历史命令。

```bash
# redis.conf 关键持久化配置

# RDB 快照：900秒内至少1次修改触发，300秒内至少10次，60秒内至少10000次
save 900 1
save 300 10
save 60 10000
dbfilename dump.rdb
dir /var/lib/redis

# AOF 追加：开启 AOF
appendonly yes
appendfilename "appendonly.aof"
# 刷盘策略：每秒同步（兼顾性能与安全）
appendfsync everysec
# AOF 重写：当文件体积比上次重写后增长 100% 时触发
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# 手动触发 RDB 快照（不阻塞主线程）
BGSAVE
# 手动触发 AOF 重写
BGREWRITEAOF
```

---

## § 03 · 数据库设计原则

### 范式与反范式

数据库设计有两大方向：**范式化（Normalization）** 消除数据冗余，保证一致性；**反范式化（Denormalization）** 通过冗余字段减少 JOIN，提升读取性能。第三范式（3NF）要求非主键列只依赖主键，不传递依赖。但在高并发读场景下，严格遵循 3NF 会导致大量 JOIN，反而成为性能瓶颈。

实践中常采用"适度反范式"策略：在核心表上保持范式化，在查询频繁的宽表上做冗余。例如订单表冗余存储商品名称（而非仅存 product_id），避免每次查订单都要 JOIN 商品表。冗余字段的更新需要通过应用层或触发器保证一致性。

```sql
-- 范式化设计：订单与商品分离，通过外键关联（3NF）
CREATE TABLE products (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(200) NOT NULL,
    price       DECIMAL(10, 2) NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id     BIGINT NOT NULL,
    product_id  BIGINT NOT NULL,
    quantity    INT NOT NULL DEFAULT 1,
    status      VARCHAR(20) DEFAULT 'pending',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_product (product_id)
);

-- 反范式化设计：订单表冗余商品名称，避免高频 JOIN
CREATE TABLE orders_denormalized (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id       BIGINT NOT NULL,
    product_id    BIGINT NOT NULL,
    product_name  VARCHAR(200) NOT NULL,  -- 冗余字段
    product_price DECIMAL(10, 2) NOT NULL, -- 冗余字段
    quantity      INT NOT NULL DEFAULT 1,
    status        VARCHAR(20) DEFAULT 'pending',
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_status (user_id, status)
);
```

### 分库分表基础

当单表数据量超过千万行，查询性能开始急剧下降，此时需要考虑分库分表。**垂直分库** 按业务拆分（如用户库、订单库、商品库），**水平分表** 按数据行拆分（如按 user_id 取模分配到不同表）。分库分表引入的核心问题是：跨库 JOIN 不可用、分布式事务复杂、全局唯一 ID 需要重新设计（常用雪花算法 Snowflake）。

分表策略的选择取决于数据访问模式：**取模分表** 适合数据均匀分布的场景，但扩容需要 rehash 全量数据；**范围分表**（如按时间分表）适合时序数据，扩容只需新建表，但可能产生热点；**一致性哈希** 在扩容时只需迁移部分数据，是生产环境常用方案。

```sql
-- 取模分表示例：按 user_id % 4 分到 4 张表
-- 路由逻辑（应用层实现）：
-- user_id = 1001 → 1001 % 4 = 1 → orders_1
-- user_id = 1002 → 1002 % 4 = 2 → orders_2

CREATE TABLE orders_0 (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total DECIMAL(10, 2),
    created_at DATETIME,
    INDEX idx_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE orders_1 (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total DECIMAL(10, 2),
    created_at DATETIME,
    INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- 按时间范围分表：每月一张表，适合时序数据
CREATE TABLE logs_202501 (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    level VARCHAR(10),
    message TEXT,
    created_at DATETIME,
    INDEX idx_time (created_at)
) ENGINE=InnoDB;

-- 全局唯一 ID：Snowflake 雪花算法（应用层生成）
-- 结构：时间戳(41bit) + 机器ID(10bit) + 序列号(12bit) = 64bit
-- 趋势递增，不依赖数据库，适合分布式环境
```

---

## 参考资源

- [MySQL 8.0 官方文档](https://dev.mysql.com/doc/refman/8.0/en/)
- [PostgreSQL 官方教程](https://www.postgresql.org/docs/tutorial/)
- [Redis 官方命令参考](https://redis.io/commands/)
- 《高性能 MySQL》— 索引优化与查询调优的深度指南
- 《Redis 设计与实现》— 数据结构与持久化原理剖析
