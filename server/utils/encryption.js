const crypto = require('crypto');

// 加密算法配置
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const ITERATIONS = 100000; // PBKDF2 迭代次数

/**
 * 生成加密密钥
 * 使用 PBKDF2 从主密钥派生加密密钥
 */
function deriveKey(masterKey, salt) {
  return crypto.pbkdf2Sync(
    masterKey,
    salt,
    ITERATIONS,
    KEY_LENGTH,
    'sha512'
  );
}

/**
 * 加密私钥
 * @param {string} privateKey - 要加密的私钥
 * @param {string} masterKey - 主密钥（从环境变量获取）
 * @returns {string} 加密后的字符串（包含 salt、iv、tag 和密文）
 */
function encryptPrivateKey(privateKey, masterKey) {
  if (!privateKey || !masterKey) {
    throw new Error('私钥和主密钥不能为空');
  }

  // 生成随机 salt 和 iv
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);

  // 从主密钥派生加密密钥
  const key = deriveKey(masterKey, salt);

  // 创建加密器
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // 加密私钥
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // 获取认证标签
  const tag = cipher.getAuthTag();

  // 组合所有部分：salt:iv:tag:encrypted
  const result = [
    salt.toString('hex'),
    iv.toString('hex'),
    tag.toString('hex'),
    encrypted
  ].join(':');

  return result;
}

/**
 * 解密私钥
 * @param {string} encryptedData - 加密的数据字符串
 * @param {string} masterKey - 主密钥（从环境变量获取）
 * @returns {string} 解密后的私钥
 */
function decryptPrivateKey(encryptedData, masterKey) {
  if (!encryptedData || !masterKey) {
    throw new Error('加密数据和主密钥不能为空');
  }

  try {
    // 分离各个部分
    const parts = encryptedData.split(':');
    if (parts.length !== 4) {
      throw new Error('加密数据格式错误');
    }

    const salt = Buffer.from(parts[0], 'hex');
    const iv = Buffer.from(parts[1], 'hex');
    const tag = Buffer.from(parts[2], 'hex');
    const encrypted = parts[3];

    // 从主密钥派生解密密钥
    const key = deriveKey(masterKey, salt);

    // 创建解密器
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    // 解密
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('解密失败:', error.message);
    throw new Error('解密失败，请检查主密钥是否正确');
  }
}

/**
 * 验证私钥格式
 * @param {string} privateKey - 私钥
 * @returns {boolean} 是否有效
 */
function isValidPrivateKey(privateKey) {
  if (!privateKey) return false;
  
  // TRON 私钥是 64 位十六进制字符串
  const hexPattern = /^[0-9a-fA-F]{64}$/;
  return hexPattern.test(privateKey);
}

/**
 * 生成主密钥（仅用于初始化）
 * @returns {string} 随机生成的主密钥
 */
function generateMasterKey() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * 获取主密钥
 * 优先从环境变量获取，如果不存在则使用 JWT_SECRET
 */
function getMasterKey() {
  const masterKey = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET;
  
  if (!masterKey) {
    throw new Error('未配置加密主密钥（ENCRYPTION_KEY 或 JWT_SECRET）');
  }

  return masterKey;
}

module.exports = {
  encryptPrivateKey,
  decryptPrivateKey,
  isValidPrivateKey,
  generateMasterKey,
  getMasterKey
};
