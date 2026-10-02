import nodemailer from "nodemailer";

export interface SendOtpEmailParams {
  toEmail: string;
  otpCode: string;
  recipientName?: string;
  expiryMinutes?: number;
}

export interface SendOtpSmsParams {
  toPhone: string;
  otpCode: string;
  expiryMinutes?: number;
}

export interface DispatchResult {
  success: boolean;
  provider: "resend" | "smtp" | "africastalking" | "twilio" | "simulated";
  messageId?: string;
  details?: string;
  error?: string;
}

/**
 * Normalizes phone numbers to international E.164 standard (+254 for Kenya)
 */
export function formatKenyanPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, "").trim();
  if (cleaned.startsWith("+")) {
    return cleaned;
  }
  if (cleaned.startsWith("254")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("0")) {
    return `+254${cleaned.slice(1)}`;
  }
  if (cleaned.length === 9 && (cleaned.startsWith("7") || cleaned.startsWith("1"))) {
    return `+254${cleaned}`;
  }
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}

/**
 * Dispatches an OTP verification code via Email using Resend, SMTP, or simulated fallback
 */
export async function sendOtpEmail(params: SendOtpEmailParams): Promise<DispatchResult> {
  const { toEmail, otpCode, recipientName = "Code Point Kenya Member", expiryMinutes = 10 } = params;
  const appName = process.env.APP_NAME || "Code Point Kenya";

  const emailSubject = `${appName}: Your Password Reset Verification Code [${otpCode}]`;
  const textContent = `Hello ${recipientName},\n\nYour 6-digit verification code is: ${otpCode}\n\nThis code will expire in ${expiryMinutes} minutes. If you did not request this code, please ignore this email or contact support.\n\nBest regards,\n${appName} Team`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${emailSubject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #020617; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; margin: 24px auto; background-color: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); text-align: center;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">${appName}</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.9); font-weight: 500;">Secure Portal Authentication</p>
            </td>
          </tr>
          
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #ffffff; font-weight: 700;">Password Reset Request</h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                Hello <strong>${recipientName}</strong>, we received a request to reset your password. Use the single-use verification code below to complete the procedure:
              </p>
              
              <!-- 6-Digit Code Box -->
              <div style="background-color: #020617; border: 2px dashed #10b981; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <div style="font-size: 11px; text-transform: uppercase; tracking: 1.5px; color: #10b981; font-weight: 700; margin-bottom: 6px;">One-Time Verification Code</div>
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #34d399; margin: 4px 0;">${otpCode}</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 6px;">Expires in ${expiryMinutes} minutes</div>
              </div>
              
              <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.5; color: #cbd5e1;">
                <strong>Security Alert:</strong> Never share this code with anyone. Code Point Kenya staff will never ask for your verification code.
              </p>
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                If you did not initiate this request, you can safely disregard this email. Your current password will remain unchanged.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #090d16; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #64748b;">
              &copy; ${new Date().getFullYear()} ${appName} (Nairobi, Kenya) &bull; Online-First & Physical Campus
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  // 1. Check Resend API
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  if (resendApiKey) {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || `${appName} <onboarding@resend.dev>`;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          subject: emailSubject,
          text: textContent,
          html: htmlContent
        })
      });

      const data = await res.json() as any;
      if (!res.ok) {
        throw new Error(data.message || data.error || `Resend HTTP ${res.status}`);
      }

      console.log(`[Resend Email Success]: Sent OTP to ${toEmail} (ID: ${data.id})`);
      return {
        success: true,
        provider: "resend",
        messageId: data.id,
        details: "Delivered via Resend Transactional Email API"
      };
    } catch (err: any) {
      console.error("[Resend Email Error]:", err.message);
      // Fall through to try SMTP or simulated
    }
  }

  // 2. Check SMTP (Nodemailer)
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
      const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;
      const smtpFrom = process.env.SMTP_FROM?.trim() || `"${appName}" <${smtpUser}>`;

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const info = await transporter.sendMail({
        from: smtpFrom,
        to: toEmail,
        subject: emailSubject,
        text: textContent,
        html: htmlContent
      });

      console.log(`[SMTP Email Success]: Sent OTP to ${toEmail} (MessageId: ${info.messageId})`);
      return {
        success: true,
        provider: "smtp",
        messageId: info.messageId,
        details: `Delivered via SMTP (${smtpHost})`
      };
    } catch (err: any) {
      console.error("[SMTP Email Error]:", err.message);
      // Fall through to simulated mode
    }
  }

  // 3. Simulated Fallback (Logs to console for developers / local evaluation)
  console.log(`[OTP Email Service (Simulated)]: Dispatched OTP code ${otpCode} to ${toEmail}. (Configure RESEND_API_KEY or SMTP_HOST in .env for live inbox delivery)`);
  return {
    success: true,
    provider: "simulated",
    details: "Simulated local delivery (Set RESEND_API_KEY or SMTP_HOST in .env for live email)"
  };
}

/**
 * Dispatches an OTP verification code via SMS using Africa's Talking, Twilio, or simulated fallback
 */
export async function sendOtpSms(params: SendOtpSmsParams): Promise<DispatchResult> {
  const { toPhone, otpCode, expiryMinutes = 10 } = params;
  const appName = process.env.APP_NAME || "CODEPOINT KENYA";
  const formattedPhone = formatKenyanPhoneNumber(toPhone);
  const smsBody = `${appName}: Your password reset verification code is ${otpCode}. Valid for ${expiryMinutes} minutes. Do not share this code with anyone.`;

  // 1. Check Africa's Talking (Premier East Africa / Kenya SMS gateway)
  const atUsername = process.env.AFRICASTALKING_USERNAME?.trim();
  const atApiKey = process.env.AFRICASTALKING_API_KEY?.trim();
  const atSenderId = process.env.AFRICASTALKING_SENDER_ID?.trim();

  if (atUsername && atApiKey) {
    try {
      const isSandbox = atUsername.toLowerCase() === "sandbox";
      const endpoint = isSandbox
        ? "https://api.sandbox.africastalking.com/version1/messaging"
        : "https://api.africastalking.com/version1/messaging";

      const formData = new URLSearchParams();
      formData.append("username", atUsername);
      formData.append("to", formattedPhone);
      formData.append("message", smsBody);
      if (atSenderId && !isSandbox) {
        formData.append("from", atSenderId);
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "apiKey": atApiKey,
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json"
        },
        body: formData.toString()
      });

      const data = await res.json() as any;
      if (!res.ok) {
        throw new Error(data.errorMessage || data.message || `Africa's Talking HTTP ${res.status}`);
      }

      const recipientInfo = data?.SMSMessageData?.Recipients?.[0];
      const status = recipientInfo?.status;
      const messageId = recipientInfo?.messageId;

      console.log(`[Africa's Talking SMS Success]: Sent to ${formattedPhone} (Status: ${status}, MessageId: ${messageId})`);
      return {
        success: true,
        provider: "africastalking",
        messageId,
        details: `Delivered via Africa's Talking (Status: ${status || "Sent"})`
      };
    } catch (err: any) {
      console.error("[Africa's Talking SMS Error]:", err.message);
      // Fall through to Twilio or simulated
    }
  }

  // 2. Check Twilio SMS
  const twilioSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER?.trim();

  if (twilioSid && twilioAuthToken && twilioFrom) {
    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const basicAuth = Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString("base64");

      const formData = new URLSearchParams();
      formData.append("To", formattedPhone);
      formData.append("From", twilioFrom);
      formData.append("Body", smsBody);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
      });

      const data = await res.json() as any;
      if (!res.ok) {
        throw new Error(data.message || `Twilio HTTP ${res.status} (code: ${data.code})`);
      }

      console.log(`[Twilio SMS Success]: Sent to ${formattedPhone} (SID: ${data.sid})`);
      return {
        success: true,
        provider: "twilio",
        messageId: data.sid,
        details: `Delivered via Twilio (Status: ${data.status})`
      };
    } catch (err: any) {
      console.error("[Twilio SMS Error]:", err.message);
      // Fall through to simulated mode
    }
  }

  // 3. Simulated Fallback
  console.log(`[OTP SMS Gateway (Simulated)]: Dispatched OTP code ${otpCode} to ${formattedPhone}. (Configure AFRICASTALKING_API_KEY or TWILIO_ACCOUNT_SID in .env for live SMS delivery)`);
  return {
    success: true,
    provider: "simulated",
    details: "Simulated local SMS (Set AFRICASTALKING_API_KEY or TWILIO_ACCOUNT_SID in .env for live telco delivery)"
  };
}

/**
 * Returns diagnostic metadata about which services are configured in current environment
 */
export function getNotificationServiceStatus() {
  const hasResend = Boolean(process.env.RESEND_API_KEY?.trim());
  const hasSmtp = Boolean(process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim());
  const hasAfricasTalking = Boolean(process.env.AFRICASTALKING_USERNAME?.trim() && process.env.AFRICASTALKING_API_KEY?.trim());
  const hasTwilio = Boolean(process.env.TWILIO_ACCOUNT_SID?.trim() && process.env.TWILIO_AUTH_TOKEN?.trim());

  return {
    email: {
      activeProvider: hasResend ? "resend" : hasSmtp ? "smtp" : "simulated",
      resendConfigured: hasResend,
      smtpConfigured: hasSmtp,
      sender: process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM || "Code Point Kenya <noreply@codepointkenya.ac.ke>"
    },
    sms: {
      activeProvider: hasAfricasTalking ? "africastalking" : hasTwilio ? "twilio" : "simulated",
      africasTalkingConfigured: hasAfricasTalking,
      twilioConfigured: hasTwilio,
      senderId: process.env.AFRICASTALKING_SENDER_ID || "CODEPOINT"
    },
    otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || "10", 10)
  };
}
