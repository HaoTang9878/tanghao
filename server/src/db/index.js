/**
 * 数据库连接与初始化模块
 * 使用基于 JSON 文件的自定义同步存储,纯 JS 实现无需编译
 * 适合当前 2核1.6G 的服务器环境,避免原生模块编译导致 OOM
 *
 * 设计说明:
 * - 同步 IO,简化 Express 路由代码(无需 async/await)
 * - 每次写入即 flush 到磁盘,保证数据持久
 * - 内存模式供单元测试使用,保证测试隔离
 */
const path = require("path");
const fs = require("fs");

// 数据库文件路径(放在 server/data 目录,便于备份与忽略)
const DB_PATH = path.join(__dirname, "..", "..", "data", "db.json");

// 默认数据结构:各业务集合及自增 ID 指针
const DEFAULT_DATA = {
    users: [],
    articles: [],
    books: [],
    projects: [],
    forum_topics: [],
    forum_replies: [],
    nextUserId: 1,
    nextArticleId: 1,
    nextBookId: 1,
    nextProjectId: 1,
    nextTopicId: 1,
    nextReplyId: 1,
};

let state = null;
// 测试模式标志:测试时使用内存,避免磁盘 IO 影响测试隔离
let useMemory = false;

/**
 * 初始化数据库
 * 首次调用时创建文件并写入默认结构
 * @returns {Object} 数据对象引用(直接修改后调用 writeDb 持久化)
 */
function initDb() {
    if (state) {
        return state;
    }

    if (useMemory) {
        // 内存模式:用于单元测试,每次都是干净的数据
        state = JSON.parse(JSON.stringify(DEFAULT_DATA));
        return state;
    }

    // 文件模式:生产环境
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    if (fs.existsSync(DB_PATH)) {
        // 读取已有数据
        const raw = fs.readFileSync(DB_PATH, "utf-8");
        try {
            const parsed = JSON.parse(raw);
            // 合并默认字段,保证旧库升级时新增集合/指针存在
            state = Object.assign(
                JSON.parse(JSON.stringify(DEFAULT_DATA)),
                parsed
            );
        } catch (err) {
            // 文件损坏:备份后重建
            console.error("[db] 数据库文件解析失败,重建中:", err.message);
            fs.renameSync(DB_PATH, DB_PATH + ".corrupt." + Date.now());
            state = JSON.parse(JSON.stringify(DEFAULT_DATA));
            writeDb();
        }
    } else {
        // 首次创建
        state = JSON.parse(JSON.stringify(DEFAULT_DATA));
        writeDb();
    }
    return state;
}

/**
 * 获取数据库实例(懒初始化)
 * @returns {Object}
 */
function getDb() {
    return initDb();
}

/**
 * 持久化数据到磁盘
 * 内存模式下为空操作
 */
function writeDb() {
    if (!state) {
        return;
    }
    if (useMemory) {
        return;
    }
    // 同步写入,使用临时文件+重命名保证原子性
    const tmp = DB_PATH + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2), "utf-8");
    fs.renameSync(tmp, DB_PATH);
}

/**
 * 关闭数据库(清空引用)
 */
function closeDb() {
    state = null;
    useMemory = false;
}

/**
 * 切换为内存模式(仅供测试使用)
 * 必须在 initDb 之前调用
 */
function setMemoryMode() {
    useMemory = true;
    state = null;
}

module.exports = { initDb, getDb, writeDb, closeDb, setMemoryMode, DB_PATH };
