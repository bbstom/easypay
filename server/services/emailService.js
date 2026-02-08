const nodemailer = require('nodemailer');

class EmailService {
  // 发送支付成功通知（第一封邮件）
  async sendPaymentSuccessEmail(payment, settings) {
    try {
      if (!payment.email) {
        return { success: false, message: '未提供邮箱地址' };
      }

      if (!settings || !settings.smtpHost || !settings.smtpUser) {
        console.log('邮件配置未完成，跳过邮件发送');
        return { success: false, message: '邮件服务未配置' };
      }

      const transporter = nodemailer.createTransport({
        host: settings.smtpHost,
        port: settings.smtpPort || 465,
        secure: settings.smtpSecure !== false,
        auth: {
          user: settings.smtpUser,
          pass: settings.smtpPass
        }
      });

      const mailOptions = {
        from: `"${settings.smtpFromName || settings.siteName || 'FastPay'}" <${settings.smtpFromEmail || settings.smtpUser}>`,
        to: payment.email,
        subject: `【${settings.siteName || 'FastPay'}】支付成功，正在处理 ${payment.payType} 代付 - ${payment.platformOrderId}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #00A3FF 0%, #0086D1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
              .info-row:last-child { border-bottom: none; }
              .label { color: #6c757d; font-weight: bold; }
              .value { color: #212529; font-weight: bold; }
              .status-badge { display: inline-block; padding: 6px 12px; background: #28a745; color: white; border-radius: 20px; font-size: 14px; font-weight: bold; }
              .processing-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
              .button { display: inline-block; background: #00A3FF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; }
              .footer { text-align: center; color: #6c757d; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">✅ 支付成功</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.95; font-size: 16px;">您的订单支付已确认</p>
              </div>
              <div class="content">
                <p style="font-size: 16px; margin-bottom: 10px;">尊敬的用户：</p>
                <p style="font-size: 15px; color: #495057;">您的订单支付已成功！我们正在处理您的 <strong>${payment.payType} 代付</strong>请求。</p>
                
                <div class="info-box">
                  <h3 style="margin-top: 0; color: #00A3FF; font-size: 18px;">📋 订单信息</h3>
                  <div class="info-row">
                    <span class="label">订单号</span>
                    <span class="value">${payment.platformOrderId}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">支付金额</span>
                    <span class="value" style="color: #00A3FF;">¥ ${payment.totalCNY.toFixed(2)}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">代付类型</span>
                    <span class="value">${payment.payType}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">代付数量</span>
                    <span class="value" style="color: #26A17B;">${payment.amount} ${payment.payType}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">收款地址</span>
                    <span class="value" style="word-break: break-all; font-family: monospace; font-size: 13px;">${payment.address}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">支付时间</span>
                    <span class="value">${new Date(payment.paymentTime).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</span>
                  </div>
                </div>

                <div class="processing-box">
                  <p style="margin: 0; color: #856404; font-size: 15px;">
                    <strong>⏳ 正在处理 ${payment.payType} 代付</strong><br>
                    <span style="font-size: 14px;">
                      我们正在将 <strong>${payment.amount} ${payment.payType}</strong> 转账到您的地址。<br>
                      预计 <strong>2-10 分钟</strong>内完成，${payment.payType} 代付完成后将再次通知您。
                    </span>
                  </p>
                </div>

                <p style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.APP_URL || 'http://localhost:3000'}/records" class="button">
                    查看订单状态
                  </a>
                </p>

                <div class="footer">
                  <p style="margin: 5px 0;">此邮件由系统自动发送，请勿回复</p>
                  <p style="margin: 5px 0; color: #00A3FF; font-weight: bold;">${settings.siteName || 'FastPay'} - 安全快捷的数字货币代付平台</p>
                  <p style="margin: 5px 0;">© ${new Date().getFullYear()} ${settings.siteName || 'FastPay'}. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await transporter.sendMail(mailOptions);
      return { success: true, message: '支付成功邮件发送成功' };
    } catch (error) {
      console.error('发送支付成功邮件失败:', error);
      return { success: false, message: error.message };
    }
  }

  // 发送代付完成通知（第二封邮件）
  async sendTransferCompletedEmail(payment, settings) {
    try {
      if (!payment.email) {
        return { success: false, message: '未提供邮箱地址' };
      }

      if (!settings || !settings.smtpHost || !settings.smtpUser) {
        console.log('邮件配置未完成，跳过邮件发送');
        return { success: false, message: '邮件服务未配置' };
      }

      const transporter = nodemailer.createTransport({
        host: settings.smtpHost,
        port: settings.smtpPort || 465,
        secure: settings.smtpSecure !== false,
        auth: {
          user: settings.smtpUser,
          pass: settings.smtpPass
        }
      });

      const tronscanUrl = `https://tronscan.org/#/transaction/${payment.txHash}`;

      const mailOptions = {
        from: `"${settings.smtpFromName || settings.siteName || 'FastPay'}" <${settings.smtpFromEmail || settings.smtpUser}>`,
        to: payment.email,
        subject: `【${settings.siteName || 'FastPay'}】${payment.payType} 代付完成 - ${payment.platformOrderId}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
              .info-row:last-child { border-bottom: none; }
              .label { color: #6c757d; font-weight: bold; }
              .value { color: #212529; font-weight: bold; }
              .tx-hash { word-break: break-all; font-family: monospace; font-size: 12px; background: #f8f9fa; padding: 12px; border-radius: 6px; border: 1px solid #dee2e6; }
              .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; border-radius: 4px; margin: 20px 0; }
              .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; }
              .footer { text-align: center; color: #6c757d; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">🎉 ${payment.payType} 代付完成</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.95; font-size: 16px;">您的 ${payment.payType} 已成功转账</p>
              </div>
              <div class="content">
                <p style="font-size: 16px; margin-bottom: 10px;">尊敬的用户：</p>
                <p style="font-size: 15px; color: #495057;">您的 <strong>${payment.payType} 代付</strong>已完成！<strong>${payment.amount} ${payment.payType}</strong> 已成功转账到您的地址。</p>
                
                <div class="info-box">
                  <h3 style="margin-top: 0; color: #28a745; font-size: 18px;">📋 订单信息</h3>
                  <div class="info-row">
                    <span class="label">订单号</span>
                    <span class="value">${payment.platformOrderId}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">代付类型</span>
                    <span class="value">${payment.payType}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">代付数量</span>
                    <span class="value" style="color: #28a745; font-size: 18px;">${payment.amount} ${payment.payType}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">收款地址</span>
                    <span class="value" style="word-break: break-all; font-family: monospace; font-size: 13px;">${payment.address}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">完成时间</span>
                    <span class="value">${new Date(payment.transferTime).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</span>
                  </div>
                </div>

                <div class="info-box">
                  <h3 style="margin-top: 0; color: #28a745; font-size: 18px;">🔗 交易哈希 (TxHash)</h3>
                  <div class="tx-hash">${payment.txHash}</div>
                  <p style="text-align: center; margin: 15px 0 0 0;">
                    <a href="${tronscanUrl}" class="button" target="_blank">
                      在区块链浏览器中查看 →
                    </a>
                  </p>
                </div>

                <div class="success-box">
                  <p style="margin: 0; color: #155724; font-size: 15px;">
                    <strong>✅ 交易已上链确认</strong><br>
                    <span style="font-size: 14px;">
                      您的 ${payment.payType} 已成功转账到指定地址，交易已在区块链上确认。<br>
                      您可以点击上方按钮在 TronScan 区块链浏览器中查看交易详情。
                    </span>
                  </p>
                </div>

                <p style="text-align: center; margin-top: 30px; font-size: 16px; color: #28a745; font-weight: bold;">
                  感谢使用 ${settings.siteName || 'FastPay'}！
                </p>

                <div class="footer">
                  <p style="margin: 5px 0;">此邮件由系统自动发送，请勿回复</p>
                  <p style="margin: 5px 0; color: #28a745; font-weight: bold;">${settings.siteName || 'FastPay'} - 安全快捷的数字货币代付平台</p>
                  <p style="margin: 5px 0;">© ${new Date().getFullYear()} ${settings.siteName || 'FastPay'}. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await transporter.sendMail(mailOptions);
      return { success: true, message: '代付完成邮件发送成功' };
    } catch (error) {
      console.error('发送代付完成邮件失败:', error);
      return { success: false, message: error.message };
    }
  }

  // 保留原有的方法（向后兼容）
  async sendOrderCompletedEmail(payment, settings) {
    try {
      if (!payment.email) {
        return { success: false, message: '未提供邮箱地址' };
      }

      if (!settings || !settings.smtpHost || !settings.smtpUser) {
        console.log('邮件配置未完成，跳过邮件发送');
        return { success: false, message: '邮件服务未配置' };
      }

      const transporter = nodemailer.createTransport({
        host: settings.smtpHost,
        port: settings.smtpPort || 465,
        secure: settings.smtpSecure !== false,
        auth: {
          user: settings.smtpUser,
          pass: settings.smtpPass
        }
      });
      const mailOptions = {
        from: `"${settings.smtpFromName || settings.siteName || 'FastPay'}" <${settings.smtpFromEmail || settings.smtpUser}>`,
        to: payment.email,
        subject: `订单完成通知 - ${payment.platformOrderId}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #00A3FF 0%, #0086D1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
              .info-row:last-child { border-bottom: none; }
              .label { color: #6c757d; font-weight: bold; }
              .value { color: #212529; }
              .success { color: #26A17B; font-weight: bold; }
              .button { display: inline-block; background: #00A3FF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
              .footer { text-align: center; color: #6c757d; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">✅ 订单已完成</h1>
                <p style="margin: 10px 0 0 0;">您的代付订单已成功完成</p>
              </div>
              <div class="content">
                <div class="info-box">
                  <h2 style="margin-top: 0; color: #00A3FF;">订单信息</h2>
                  <div class="info-row">
                    <span class="label">订单号：</span>
                    <span class="value">${payment.platformOrderId}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">代付类型：</span>
                    <span class="value">${payment.payType}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">代付数量：</span>
                    <span class="value">${payment.amount} ${payment.payType}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">收款地址：</span>
                    <span class="value" style="word-break: break-all;">${payment.address}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">交易哈希：</span>
                    <span class="value" style="word-break: break-all;">${payment.txHash}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">状态：</span>
                    <span class="success">✓ 已完成</span>
                  </div>
                  <div class="info-row">
                    <span class="label">完成时间：</span>
                    <span class="value">${new Date(payment.transferTime).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</span>
                  </div>
                </div>
                
                <p style="text-align: center;">
                  <a href="https://tronscan.org/#/transaction/${payment.txHash}" class="button" target="_blank">
                    查看区块链交易
                  </a>
                </p>
                
                <div class="footer">
                  <p>此邮件由系统自动发送，请勿回复</p>
                  <p>© ${new Date().getFullYear()} ${settings.siteName || 'FastPay'}. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await transporter.sendMail(mailOptions);
      return { success: true, message: '邮件发送成功' };
    } catch (error) {
      console.error('发送邮件失败:', error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new EmailService();
