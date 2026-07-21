/**
 * 用户数据访问层(User Model)
 * 封装对 users 集合的查询与写入操作
 * 基于自定义 JSON 文件存储,无独立数据库进程
 */
const bcrypt = require("bcryptjs");
const { getDb, writeDb } = require("./index");

/**
 * 内部工具:去除敏感字段
 * @param {Object} user - 原始用户对象
 * @returns {Object} 不含 password_hash 的安全对象
 */
function sanitize(user) {
    if (!user) {
        return null;
    }
    const { password_hash, ...safe } = user;
    return safe;
}

/**
 * 根据用户名查询用户(含密码,仅用于登录校验)
 * @param {string} username
 * @returns {Object|undefined}
 */
function findByUsername(username) {
    const db = getDb();
    return db.users.find((u) => u.username === username);
}

/**
 * 根据邮箱查询用户
 * @param {string} email
 * @returns {Object|undefined}
 */
function findByEmail(email) {
    const db = getDb();
    return db.users.find((u) => u.email === email);
}

/**
 * 根据 ID 查询用户(不含密码)
 * @param {number} id
 * @returns {Object|undefined}
 */
function findById(id) {
    const db = getDb();
    const user = db.users.find((u) => u.id === Number(id));
    return sanitize(user);
}

/**
 * 创建新用户
 * @param {Object} param0 - 用户信息
 * @returns {Object} 新建用户(不含密码)
 */
function createUser({ username, email, password, displayName }) {
    const db = getDb();
    // 使用 bcryptjs 哈希密码,cost factor 10 兼顾安全与性能
    const passwordHash = bcrypt.hashSync(password, 10);
    const now = new Date().toISOString();
    const newUser = {
        id: db.nextUserId,
        username,
        email,
        password_hash: passwordHash,
        display_name: displayName || username,
        created_at: now,
        updated_at: now,
    };
    db.users.push(newUser);
    db.nextUserId += 1;
    writeDb();
    return sanitize(newUser);
}

/**
 * 验证密码是否匹配
 * @param {string} plainText - 明文密码
 * @param {string} hash - 哈希值
 * @returns {boolean}
 */
function verifyPassword(plainText, hash) {
    return bcrypt.compareSync(plainText, hash);
}

module.exports = {
    findByUsername,
    findByEmail,
    findById,
    createUser,
    verifyPassword,
    sanitize,
};
