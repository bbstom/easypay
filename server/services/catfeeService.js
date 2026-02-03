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
   * @param {string} apiKey - API Key
   * @param {string} apiSecret - API Secret（可选，如果 apiKey 包含冒号则自动分割）
   */
  setApiKey(apiKey, apiSecret = null) {
    // 兼容两种格式：
    // 1. 分别传入 key 和 secret: setApiKey(key, secret)
    // 2. 用冒号连接传入: setApiKey('key:secret')
    if (apiSecret) {
      // 格式1：分别传入
      this.apiKey = apiKey;
      this.apiSecret = apiSecret;
    } else if (apiKey && apiKey.includes(':')) {
      // 格式2：冒号连接
      const [key, secret] = apiKey.split(':');
      this.apiKey = key;
      this.apiSecret = secret;
    } else {
      // 只有 key，没有 secret
      throw new Error('API Secret 未提供。请提供完整的 API Key 和 Secret');
    }
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
   * 发送 HTTP 请求（带重试机制）
   */
  async createRequest(url, method, timestamp, signature, retries = 3) {
    const headers = {
      'Content-Type': 'application/json',
      'CF-ACCESS-KEY': this.apiKey,
      'CF-ACCESS-SIGN': signature,
      'CF-ACCESS-TIMESTAMP': timestamp
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios({
          url,
          method,
          headers,
          timeout: 30000
        });
        return response.data;
      } catch (error) {
        const isLastAttempt = attempt === retries;
        const is502Error = error.response?.status === 502;
        const is503Error = error.response?.status === 503;
        const isNetworkError = error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT';
        
        // 如果是临时性错误且不是最后一次尝试，则重试
        if ((is502Error || is503Error || isNetworkError) && !isLastAttempt) {
          const waitTime = attempt * 2000; // 递增等待时间：2s, 4s, 6s
          console.log(`⚠️  请求失败 (${error.response?.status || error.code})，${waitTime/1000}秒后重试... (${attempt}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // 最后一次尝试失败，或非临时性错误
        if (error.response?.status === 502) {
          console.error('❌ CatFee 服务暂时不可用 (502 Bad Gateway)');
          console.error('💡 提示：这通常是服务器维护或临时故障，请稍后重试');
        } else if (error.response?.status === 503) {
          console.error('❌ CatFee 服务暂时不可用 (503 Service Unavailable)');
          console.error('💡 提示：服务器负载过高或维护中，请稍后重试');
        } else {
          console.error('❌ CatFee API 请求失败:', error.response ? error.response.data : error.message);
        }
        throw error;
      }
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
      console.log(`   订单号: ${data.data?.id || data.order_id || data.orderId || 'N/A'}`);
      console.log(`   能量: ${energyAmount}`);
      console.log(`   消耗: ${(data.data?.pay_amount_sun || 0) / 1000000} TRX`);
      console.log(`   余额: ${(data.data?.balance || 0) / 1000000} TRX`);
      
      return {
        success: true,
        orderNo: data.data?.id || data.order_id || data.orderId,
        energyAmount: energyAmount,
        receiverAddress: receiverAddress,
        duration: duration,
        payAmount: data.data?.pay_amount_sun || 0,  // 支付金额（sun）
        balance: data.data?.balance || 0,  // 剩余余额（sun）
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
   * 注意：CatFee API 可能没有单独的价格查询接口
   * 价格信息通常在购买订单时计算
   * @param {number} energyAmount - 能量数量
   * @param {string} duration - 租赁时长
   * @returns {Promise<Object>} 价格信息
   */
  async getPrice(energyAmount, duration = '1h') {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('CatFee API Key 未配置');
    }

    // 尝试多个可能的路径
    const paths = [
      '/v1/price',
      '/v1/energy/price',
      '/v1/order/price'
    ];

    const queryParams = {
      quantity: energyAmount.toString(),
      duration: duration
    };

    for (const path of paths) {
      try {
        const method = 'GET';
        const timestamp = this.generateTimestamp();
        const requestPath = this.buildRequestPath(path, queryParams);
        const signature = this.generateSignature(timestamp, method, requestPath);
        const url = this.apiUrl + requestPath;

        const data = await this.createRequest(url, method, timestamp, signature);

        // 如果成功，返回结果
        if (data.code === 0 || data.code === '0') {
          return {
            success: true,
            price: data.data?.price || data.price,
            energyAmount: energyAmount,
            duration: duration,
            rawData: data
          };
        }
      } catch (error) {
        // 继续尝试下一个路径
        continue;
      }
    }

    // 所有路径都失败，返回失败状态
    console.warn('⚠️  CatFee: 价格查询接口不可用（可能测试环境不支持）');
    console.warn('💡 提示：价格信息会在购买订单的响应中返回');
    return {
      success: false,
      error: '价格查询接口不可用',
      price: 0,
      energyAmount: energyAmount,
      duration: duration,
      note: '价格信息会在购买订单的响应中返回'
    };
  }

  /**
   * 获取账户余额
   * 注意：CatFee API 可能没有单独的余额查询接口
   * 余额信息通常在购买订单的响应中返回
   * @returns {Promise<Object>} 余额信息
   */
  async getBalance() {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('CatFee API Key 未配置');
    }

    // 尝试多个可能的路径
    const paths = [
      '/v1/account',
      '/v1/account/balance',
      '/v1/user/balance'
    ];

    for (const path of paths) {
      try {
        const method = 'GET';
        const timestamp = this.generateTimestamp();
        const requestPath = this.buildRequestPath(path, {});
        const signature = this.generateSignature(timestamp, method, requestPath);
        const url = this.apiUrl + requestPath;

        const data = await this.createRequest(url, method, timestamp, signature);

        // 如果成功，返回结果
        if (data.code === 0 || data.code === '0') {
          return {
            success: true,
            balance: data.data?.balance || data.balance,
            currency: data.data?.currency || data.currency || 'TRX',
            rawData: data
          };
        }
      } catch (error) {
        // 继续尝试下一个路径
        continue;
      }
    }

    // 所有路径都失败，返回失败状态
    console.warn('⚠️  CatFee: 余额查询接口不可用（可能测试环境不支持）');
    console.warn('💡 提示：余额信息会在购买订单的响应中返回');
    return {
      success: false,
      error: '余额查询接口不可用',
      balance: 0,
      currency: 'TRX',
      note: '余额信息会在购买订单的响应中返回'
    };
  }
}

// 导出单例
module.exports = new CatFeeService();
