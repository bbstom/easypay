const AuditLog = require('../models/AuditLog');

/**
 * 审计中间件
 * 记录敏感操作
 */
function auditMiddleware(action, resource) {
  return async (req, res, next) => {
    // 保存原始的 json 方法
    const originalJson = res.json.bind(res);
    
    // 重写 json 方法以捕获响应
    res.json = function(data) {
      // 记录审计日志
      const logData = {
        userId: req.user?.userId,
        username: req.user?.username || 'anonymous',
        action,
        resource,
        resourceId: req.params.id || req.body?.id,
        details: {
          method: req.method,
          path: req.path,
          query: req.query,
          // 不记录敏感字段
          body: sanitizeBody(req.body)
        },
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: res.statusCode < 400,
        errorMessage: res.statusCode >= 400 ? data.error : undefined
      };
      
      // 异步记录，不阻塞响应
      AuditLog.log(logData).catch(err => {
        console.error('审计日志记录失败:', err);
      });
      
      // 调用原始的 json 方法
      return originalJson(data);
    };
    
    next();
  };
}

/**
 * 清理请求体中的敏感信息
 */
function sanitizeBody(body) {
  if (!body) return {};
  
  const sanitized = { ...body };
  
  // 移除敏感字段
  const sensitiveFields = [
    'password',
    'privateKey',
    'privateKeyEncrypted',
    'token',
    'secret',
    'apiKey'
  ];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

/**
 * IP 白名单检查中间件
 */
function ipWhitelistCheck(req, res, next) {
  const whitelist = process.env.ADMIN_IP_WHITELIST?.split(',').map(ip => ip.trim()) || [];
  
  // 如果没有配置白名单，跳过检查
  if (whitelist.length === 0) {
    return next();
  }
  
  const clientIp = req.ip || req.connection.remoteAddress;
  
  if (!whitelist.includes(clientIp)) {
    // 记录未授权访问尝试
    AuditLog.log({
      userId: req.user?.userId || null,
      username: req.user?.username || 'anonymous',
      action: 'UNAUTHORIZED_ACCESS',
      resource: req.path,
      ip: clientIp,
      userAgent: req.headers['user-agent'],
      success: false,
      errorMessage: 'IP not in whitelist'
    }).catch(err => {
      console.error('审计日志记录失败:', err);
    });
    
    return res.status(403).json({ error: '访问被拒绝：IP 地址未授权' });
  }
  
  next();
}

/**
 * 速率限制中间件
 */
const rateLimitMap = new Map();

function rateLimit(maxRequests = 100, windowMs = 60000) {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitMap.has(key)) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const record = rateLimitMap.get(key);
    
    if (now > record.resetTime) {
      // 重置计数
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }
    
    if (record.count >= maxRequests) {
      // 记录速率限制事件
      AuditLog.log({
        userId: req.user?.userId || null,
        username: req.user?.username || 'anonymous',
        action: 'RATE_LIMIT_EXCEEDED',
        resource: req.path,
        ip: key,
        userAgent: req.headers['user-agent'],
        success: false,
        errorMessage: `Exceeded ${maxRequests} requests in ${windowMs}ms`
      }).catch(err => {
        console.error('审计日志记录失败:', err);
      });
      
      return res.status(429).json({ 
        error: '请求过于频繁，请稍后再试',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }
    
    record.count++;
    next();
  };
}

// 定期清理速率限制记录
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // 每分钟清理一次

module.exports = {
  auditMiddleware,
  ipWhitelistCheck,
  rateLimit
};
