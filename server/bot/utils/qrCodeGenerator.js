const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

/**
 * 生成美化的二维码
 * @param {string} data - 二维码数据
 * @param {object} options - 配置选项
 * @returns {Promise<Buffer>} - 二维码图片 Buffer
 */
async function generateStyledQRCode(data, options = {}) {
  const {
    size = 160,           // 二维码尺寸（缩小到160）
    padding = 16,         // 内边距（缩小到16）
    borderRadius = 12,    // 圆角半径（缩小到12）
    borderWidth = 2.5,    // 边框宽度（缩小到2.5）
    borderColor = '#00A3FF', // 边框颜色
    gradientStart = '#E0F2FE', // 渐变起始色
    gradientEnd = '#FFFFFF',   // 渐变结束色
    qrColor = '#000000',  // 二维码颜色
    logoText = null,      // 底部文字（可选）
    logoTextColor = '#64748B', // 文字颜色
    logoUrl = null        // Logo 图片 URL（可选）
  } = options;

  try {
    // 1. 生成原始二维码
    const qrDataUrl = await QRCode.toDataURL(data, {
      width: size,
      margin: 1,
      color: {
        dark: qrColor,
        light: '#00000000' // 透明背景
      }
    });

    // 2. 计算画布尺寸
    const totalPadding = padding * 2;
    const borderPadding = borderWidth * 2;
    const canvasSize = size + totalPadding + borderPadding;
    const textHeight = logoText ? 24 : 0; // 文字区域也缩小
    
    // 如果有 logo，添加 logo 区域
    const logoHeight = logoUrl ? 80 : 0; // logo 区域高度
    const canvasHeight = logoHeight + canvasSize + textHeight;

    // 3. 创建画布
    const canvas = createCanvas(canvasSize, canvasHeight);
    const ctx = canvas.getContext('2d');

    // 4. 绘制背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasSize, canvasHeight);

    let currentY = 0;

    // 5. 绘制 Logo（如果有）
    if (logoUrl) {
      try {
        const logoImage = await loadImage(logoUrl);
        const logoSize = 60; // logo 尺寸
        const logoX = (canvasSize - logoSize) / 2;
        const logoY = 10;
        
        ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
        currentY = logoHeight;
      } catch (error) {
        console.error('加载 logo 失败:', error);
        currentY = 0; // logo 加载失败，从顶部开始
      }
    }

    // 6. 绘制圆角矩形背景（带渐变）
    const gradient = ctx.createLinearGradient(0, currentY, 0, currentY + canvasSize);
    gradient.addColorStop(0, gradientStart);
    gradient.addColorStop(1, gradientEnd);
    
    ctx.fillStyle = gradient;
    roundRect(ctx, 0, currentY, canvasSize, canvasSize, borderRadius);
    ctx.fill();

    // 7. 绘制边框
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    roundRect(ctx, borderWidth / 2, currentY + borderWidth / 2, canvasSize - borderWidth, canvasSize - borderWidth, borderRadius);
    ctx.stroke();

    // 8. 绘制二维码
    const qrImage = await loadImage(qrDataUrl);
    const qrX = padding + borderWidth;
    const qrY = currentY + padding + borderWidth;
    ctx.drawImage(qrImage, qrX, qrY, size, size);

    // 9. 绘制底部文字（可选）
    if (logoText) {
      currentY += canvasSize;
      ctx.fillStyle = logoTextColor;
      ctx.font = 'bold 12px Arial'; // 字体缩小到12px
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(logoText, canvasSize / 2, currentY + textHeight / 2);
    }

    // 10. 转换为 Buffer
    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error('生成美化二维码失败:', error);
    // 降级：返回普通二维码
    return QRCode.toBuffer(data, {
      width: size,
      margin: 1,
      color: {
        dark: qrColor,
        light: '#FFFFFF'
      }
    });
  }
}

/**
 * 绘制圆角矩形路径
 */
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * 能量租赁二维码样式
 */
async function generateEnergyQRCode(address) {
  return generateStyledQRCode(address, {
    borderColor: '#10B981', // 绿色边框
    gradientStart: '#D1FAE5', // 浅绿色
    gradientEnd: '#FFFFFF'
    // 不显示底部文字
  });
}

/**
 * 闪兑服务二维码样式
 */
async function generateSwapQRCode(address) {
  return generateStyledQRCode(address, {
    borderColor: '#3B82F6', // 蓝色边框
    gradientStart: '#DBEAFE', // 浅蓝色
    gradientEnd: '#FFFFFF'
    // 不显示底部文字
  });
}

/**
 * 支付二维码样式
 * @param {string} paymentUrl - 支付链接
 * @param {string} logoUrl - Logo 图片 URL（可选）
 */
async function generatePaymentQRCode(paymentUrl, logoUrl = null) {
  return generateStyledQRCode(paymentUrl, {
    borderColor: '#F59E0B', // 橙色边框
    gradientStart: '#FEF3C7', // 浅橙色
    gradientEnd: '#FFFFFF',
    logoUrl: logoUrl // 传入 logo URL
  });
}

module.exports = {
  generateStyledQRCode,
  generateEnergyQRCode,
  generateSwapQRCode,
  generatePaymentQRCode
};
