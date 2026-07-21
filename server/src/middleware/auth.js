/**
 * JWT 认证中间件模块
 * 负责解析 Authorization 头部,验证 JWT,并将用户信息挂到 req.user
 */
const jwt = require("jsonwebtoken");

// JWT 密钥(生产环境应通过环境变量注入,这里提供默认值便于开发)
const JWT_SECRET = process.env.JWT_SECRET || "brucetanghao-dev-secret-change-in-prod";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * 生成 JWT
 * @param {Object} payload - 载荷,通常是用户信息
 * @returns {string} 签名后的 token
 */
function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 验证 JWT 中间件
 * 从 Authorization: Bearer <token> 头部提取 token 并验证
 * 验证失败返回 401
 */
function authRequired(req, res, next) {
    const authHeader = req.headers.authorization || "";
    // 只接受 Bearer 模式
    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ error: "未提供有效的认证令牌" });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: "认证令牌无效或已过期" });
    }
}

/**
 * 可选认证中间件
 * 若提供 token 则解析,不提供也不报错(用于公开接口的个性化)
 */
function authOptional(req, res, next) {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");
    if (scheme === "Bearer" && token) {
        try {
            req.user = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            // 可选认证:静默忽略错误
        }
    }
    next();
}

module.exports = { authRequired, authOptional, signToken, JWT_SECRET };
