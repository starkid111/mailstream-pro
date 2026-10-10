const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const nodemailer = require('nodemailer');

let cachedTransporter = null;

const getNodemailerTransporter = async () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT, 10) || 465;
  const user = process.env.SMTP_USER;
  const rawPass = process.env.SMTP_PASS || '';
  const pass = rawPass.replace(/\s+/g, '');
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (user && pass && user !== 'mock_user') {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      connectionTimeout: 25000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
      tls: { rejectUnauthorized: false },
    });
    return cachedTransporter;
  } else {
    console.log('[Email Service Notice] Generating automatic Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return cachedTransporter;
  }
};

/**
 * Send campaign emails via Nodemailer (SMTP)
 * @param {Object} campaign 
 * @param {Array} recipients 
 * @returns {Array} sendResults
 */
const sendCampaignEmails = async (campaign, recipients) => {
  const sendResults = [];
  const fromName = process.env.FROM_NAME || 'MailStream Pro';
  const fromAddress = process.env.FROM_EMAIL || process.env.SMTP_USER || 'campaigns@mailstream.io';

  const transporter = await getNodemailerTransporter();

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    const defaultMsgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      console.log(`[SMTP Dispatch] Sending campaign email to ${recipient.email}...`);

      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: `"${recipient.firstName || ''} ${recipient.lastName || ''}" <${recipient.email}>`,
        subject: campaign.subject,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; color: #0f172a;">
            <div style="background-color: #00925d; padding: 20px 24px;">
              <span style="font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">MailStream Pro</span>
            </div>
            <div style="padding: 28px 24px;">
              <h1 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px; font-weight: 700; line-height: 1.3;">${campaign.subject}</h1>
              <div style="line-height: 1.7; font-size: 15px; color: #334155; white-space: pre-wrap;">${campaign.content}</div>
            </div>
            <div style="background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; display: flex; justify-content: space-between; align-items: center;">
              <span>Sent to: <strong>${recipient.firstName || ''} ${recipient.lastName || ''}</strong> (${recipient.email})</span>
              <span style="font-weight: 600; color: #00925d;">Powered by MailStream Pro</span>
            </div>
          </div>
        `,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info) || null;
      console.log(`[SMTP Success] Delivered to ${recipient.email} | MsgId: ${info.messageId}`);

      sendResults.push({
        recipientId: recipient._id,
        email: recipient.email,
        status: 'SENT',
        providerMessageId: info.messageId || defaultMsgId,
        previewUrl,
        sentAt: new Date(),
      });
    } catch (error) {
      const errorDetail = error.message || 'SMTP delivery failed';
      console.error(`[Email Send Error] Recipient: ${recipient.email} - ${errorDetail}`);
      sendResults.push({
        recipientId: recipient._id,
        email: recipient.email,
        status: 'FAILED',
        failureReason: errorDetail,
        providerMessageId: defaultMsgId,
        sentAt: null,
        failedAt: new Date(),
      });
    }
  }

  return sendResults;
};

/**
 * Send welcome email to newly registered user
 * @param {Object} user - { name, email }
 */
const sendWelcomeEmail = async (user) => {
  const fromName = process.env.FROM_NAME || 'MailStream Pro';
  const fromAddress = process.env.FROM_EMAIL || process.env.SMTP_USER || 'campaigns@mailstream.io';
  const firstName = user.name ? user.name.split(' ')[0] : 'there';
  const subject = `Hi ${firstName}, welcome to MailStream Pro! 🎉`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; color: #0f172a;">
      <div style="background-color: #00925d; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">MailStream Pro</h1>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Hi ${user.name}, welcome to MailStream Pro! 👋</h2>
        <p style="line-height: 1.7; font-size: 15px; color: #334155; margin-bottom: 20px;">
          We are thrilled to have you on board! With MailStream Pro, you can create email campaigns, target recipients, and track real-time delivery outcomes.
        </p>
        <div style="background-color: #f8fafc; border-left: 4px solid #00925d; padding: 16px; margin: 24px 0; border-radius: 0 6px 6px 0;">
          <strong style="color: #0f172a; font-size: 14px;">Quick Tip to Get Started:</strong>
          <p style="margin: 6px 0 0 0; font-size: 14px; color: #475569;">
            Add your contacts under <strong>Recipients</strong> and create your first campaign in 3 easy steps!
          </p>
        </div>
        <p style="line-height: 1.7; font-size: 15px; color: #334155;">
          If you have any questions, feel free to reply to this email.
        </p>
        <p style="margin-top: 24px; font-size: 15px; color: #0f172a; font-weight: 600;">
          Best regards,<br/>The MailStream Pro Team
        </p>
      </div>
      <div style="background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
        Sent to <strong>${user.email}</strong> • Powered by MailStream Pro
      </div>
    </div>
  `;

  try {
    const transporter = await getNodemailerTransporter();
    console.log(`[Welcome Email SMTP] Dispatching welcome email to ${user.email}...`);
    await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: `"${user.name}" <${user.email}>`,
      subject,
      html,
    });
    console.log(`[Welcome Email Success] Welcome email successfully sent to ${user.email}`);
  } catch (err) {
    console.error(`[Welcome Email Error] Failed to send welcome email to ${user.email}:`, err.message);
  }
};

/**
 * Send password reset email with 6-digit code
 * @param {Object} data - { name, email, code }
 */
const sendPasswordResetEmail = async ({ name, email, code }) => {
  const fromName = process.env.FROM_NAME || 'MailStream Pro';
  const fromAddress = process.env.FROM_EMAIL || process.env.SMTP_USER || 'campaigns@mailstream.io';
  const subject = `Your Password Reset Code: ${code}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; color: #0f172a;">
      <div style="background-color: #00925d; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">MailStream Pro</h1>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Password Reset Request</h2>
        <p style="line-height: 1.7; font-size: 15px; color: #334155; margin-bottom: 20px;">
          Hi ${name || 'there'}, we received a request to reset your password. Use the 6-digit verification code below to set a new password:
        </p>
        <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #00925d; font-family: monospace;">${code}</span>
          <p style="margin: 8px 0 0 0; font-size: 13px; color: #64748b;">This code expires in 15 minutes.</p>
        </div>
        <p style="line-height: 1.7; font-size: 14px; color: #64748b;">
          If you did not request a password reset, please ignore this email or contact support if you have concerns.
        </p>
      </div>
      <div style="background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
        Sent to <strong>${email}</strong> • Powered by MailStream Pro
      </div>
    </div>
  `;

  try {
    const transporter = await getNodemailerTransporter();
    console.log(`[Reset Email SMTP] Dispatching password reset email to ${email}...`);
    await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: `"${name || 'User'}" <${email}>`,
      subject,
      html,
    });
    console.log(`[Reset Email Success] Password reset code sent to ${email}`);
  } catch (err) {
    console.error(`[Reset Email Error] Failed to send reset code to ${email}:`, err.message);
    throw err;
  }
};

module.exports = {
  sendCampaignEmails,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};

