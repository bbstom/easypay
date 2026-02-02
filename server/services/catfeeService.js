const axios = require('axios');
const crypto = require('crypto');

/**
 * CatFee 能量购买服务
 * 文档: https://docs.catfee.io/en/getting-started/buy-energy-via-api-on-catfee/nodejs
 * 认证方式: HMAC-SHA256 签名
 */

class CatFeeService {
  constructor() {
    this.apiUrl = 'https://api.catfee.io';
    this.apiKey = null;
    this.apiSecret = null;
  }

  /**
   * 设置 API URL
   */
  setApiUrl(apiUrl) {
    this.apiUrl = apiUrl || 'https://api.catfee.io';
  }

  /**
   * 设置 API Key 和 Secret
   * 格式: "api_key:api_secret"
   */
  setApiKey(apiKeyWithSecret) {
    if (!apiKeyWithSecret || !apiKeyWithSecret.includes(':')) {
      throw new Error('API Key 格式错误，应为 "api_key:api_secret"');
    }
    const [key, secret] = apiKeyWithSecret.split(':');
    this.apiKey = key;
    this.apiSecret = secret;
  }

  /**
   * 生成 ISO 8601 格式时间戳
   */
  generateTimestamp() {
    return new Date().toISOString();
  }

  /**
   * 构建请求路径（包含查询参数）
   */
  buildRequestPath(path, queryParams) {
    if (!queryParams || Object.keys(queryParams).length === 0) {
      return path;
    }
    const queryString = new URLSearchParams(queryParams).toString();
    return `${path}?${queryString}`;
  }

  /**
   * 生成 HMAC-SHA256 签名
   */
  generateSignature(timestamp, method, requestPath) {
    const signString = timestamp + method + requestPath;
    return crypto.createHmac('sha256', this.apiSecret)
                 .update(signString)
                 .digest('base64');
  }

  /**
   * 发送 HTTP 请求
   */
  async createRequest(url, method, timestamp, signature) {
    const headers = {
      'Content-Type': 'application/json',
      'CF-ACCESS-KEY': this.apiKey,
      'CF-ACCESS-SIGN': signature,
      'CF-ACCESS-TIMESTAMP': timestamp
    };

    try {
      const response = await axios({
        url,
        method,
        headers,
        timeout: 30000
      });
      return response.data;
    } catch (error) {
      console.error('❌ CatFee API 请求失败:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  /**
   * 购买能量
   * @param {string} receiverAddress - 接收能量的地址
   * @param {number} energyAmount - 能量数量
   * @param {string} duration - 租赁时长: "1h" 或 "3h"
   * @returns {Promise<Object>} 订单信息
   */
  async buyEnergy(receiverAddress, energyAmount, duration = '1h') {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('CatFee API Key 未配置');
    }

    try {
      console.log(`🔋 CatFee: 购买能量 ${energyAmount} 给地址 ${receiverAddress}（${duration}）`);

      const method = 'POST';
      const path = '/v1/order';
      const queryParams = {
        quantity: energyAmount.toString(),
        receiver: receiverAddress,
        duration: duration
      };

      const timestamp = this.generateTimestamp();
      const requestPath = this.buildRequestPath(path, queryParams);
      const signature = this.generateSignature(timestamp, method, requestPath);
      const url = this.apiUrl + requestPath;

      const data = await this.createRequest(url, method, timestamp, signature);

      console.log(`✅ CatFee: 能量购买成功`);
      console.log(`   订单号: ${data.order_id || data.orderId || 'N/A'}`);
      console.log(`   能量: ${energyAmount}`);
      
      return {
        success: true,
        orderNo: data.order_id || data.orderId,
        energyAmount: energyAmount,
        receiverAddress: receiverAddress,
        duration: duration,
        rawData: data
      };
    } catch (error) {
      console.error('❌ CatFee: 购买能量失败:', error.message);
      throw new Error(`CatFee 购买能量失败: ${error.message}`);
    }
  }

  /**
   * 查询订单状态
   * @param {string} orderNo - 订单号
   * @returns {Promise<Object>} 订单状态
   */
  async queryOrder(orderNo) {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('CatFee API Key 未配置');
    }

    try {
      const method = 'GET';
      const path = `/v1/order/${orderNo}`;

      const timestamp = this.generateTimestamp();
      const requestPath = this.buildRequestPath(path, {});
      const signature = this.generateSignature(timestamp, method, requestPath);
      const url = this.apiUrl + requestPath;

      const data = await this.createRequest(url, method, timestamp, signature);

      return {
        success: true,
        status: data.status,
        energyAmount: data.quantity || data.energyAmount,
        rawData: data
      };
    } catch (error) {
      console.error('❌ CatFee: 查询订单失败:', error.message);
      throw new Error(`CatFee 查询订单失败: ${error.message}`);
    }
  }

  /**
   * 获取能量价格
   * @param {number} energyAmount - 能量数量
   * @param {string} duration - 租赁时长
   * @returns {Promise<Object>} 价格信息
   */
  async getPrice(energyAmount, duration = '1h') {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('CatFee API Key 未配置');
    }

    try {
      const method = 'GET';
      const path = '/v1/price';
      const queryParams = {
        quantity: energyAmount.toString(),
        duration: duration
      };

      const timestamp = this.generateTimestamp();
      const requestPath = this.buildRequestPath(path, queryParams);
      const signature = this.generateSignature(timestamp, method, requestPath);
      const url = this.apiUrl + requestPath;

      const data = await this.createRequest(url, method, timestamp, signature);

      return {
        success: true,
        price: data.price,
        energyAmount: energyAmount,
        duration: duration,
        rawData: data
      };
    } catch (error) {
      console.error('❌ CatFee: 获取价格失败:', error.message);
      throw new Error(`CatFee 获取价格失败: ${error.message}`);
    }
  }

  /**
   * 获取账户余额
   * @returns {Promise<Object>} 余额信息
   */
  async getBalance() {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('CatFee API Key 未配置');
    }

    try {
      const method = 'GET';
      const path = '/v1/account/balance';

      const timestamp = this.generateTimestamp();
      const requestPath = this.buildRequestPath(path, {});
      const signature = this.generateSignature(timestamp, method, requestPath);
      const url = this.apiUrl + requestPath;

      const data = await this.createRequest(url, method, timestamp, signature);

      return {
        success: true,
        balance: data.balance,
        currency: data.currency || 'TRX',
        rawData: data
      };
    } catch (error) {
      console.error('❌ CatFee: 获取余额失败:', error.message);
      throw new Error(`CatFee 获取余额失败: ${error.message}`);
    }
  }
}

// 导出单例
module.exports = new CatFeeService();
