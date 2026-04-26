/**
 * Email Service — SendGrid-ready with HTML templates
 *
 * To switch from Ethereal (dev) to SendGrid (prod):
 * 1. npm install @sendgrid/mail
 * 2. Set SENDGRID_API_KEY in .env
 * 3. Set EMAIL_FROM in .env (e.g. alerts@ftd.app)
 * 4. Uncomment the SendGrid block and remove the nodemailer block
 */

import nodemailer from 'nodemailer';

// ── Template Helpers ────────────────────────────────────────────────────────

const emailWrapper = (title: string, body: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #0f0f13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .wrapper { max-width: 600px; margin: 40px auto; padding: 0 16px; }
    .card { background: #1a1a24; border: 1px solid #2d2d3d; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #22d3ee 100%); padding: 32px; text-align: center; }
    .header-logo { width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; color: white; margin-bottom: 16px; }
    .header h1 { margin: 0; color: white; font-size: 22px; font-weight: 700; }
    .body { padding: 32px; }
    .greeting { color: #e2e8f0; font-size: 16px; margin-bottom: 24px; }
    .section-title { color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
    .item-card { background: #22222f; border: 1px solid #2d2d3d; border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
    .item-name { color: #e2e8f0; font-weight: 600; font-size: 15px; }
    .item-meta { color: #94a3b8; font-size: 13px; margin-top: 2px; }
    .badge { padding: 4px 10px; border-radius: 100px; font-size: 12px; font-weight: 600; }
    .badge-red { background: rgba(244,63,94,0.15); color: #f43f5e; border: 1px solid rgba(244,63,94,0.3); }
    .badge-orange { background: rgba(251,146,60,0.15); color: #fb923c; border: 1px solid rgba(251,146,60,0.3); }
    .cta { text-align: center; margin: 32px 0 8px; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #22d3ee); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; }
    .footer { padding: 24px 32px; border-top: 1px solid #2d2d3d; text-align: center; }
    .footer p { color: #64748b; font-size: 12px; margin: 4px 0; }
    .footer a { color: #6366f1; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="header-logo">F</div>
        <h1>${title}</h1>
      </div>
      <div class="body">${body}</div>
      <div class="footer">
        <p>You're receiving this because you have alerts enabled in FTD.</p>
        <p><a href="#">Manage notifications</a> · <a href="#">Unsubscribe</a></p>
        <p>© ${new Date().getFullYear()} FTD — Finance Trusted Documents</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const renewalAlertTemplate = (
  userName: string,
  subs: Array<{ serviceName: string; cost: number; nextBillingDate: Date; billingCycle: string }>,
  warranties: Array<{ storeName: string; expiryDate: Date }>
): string => {
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const dateFmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

  const subsHtml = subs.length > 0 ? `
    <p class="section-title">🔄 Subscriptions Renewing Soon</p>
    ${subs.map(s => {
      const daysLeft = Math.ceil((new Date(s.nextBillingDate).getTime() - Date.now()) / 86400000);
      return `
        <div class="item-card">
          <div>
            <div class="item-name">${s.serviceName}</div>
            <div class="item-meta">${s.billingCycle} · ${dateFmt.format(new Date(s.nextBillingDate))}</div>
          </div>
          <div style="text-align:right">
            <div class="item-name">${fmt.format(s.cost)}</div>
            <span class="badge ${daysLeft <= 1 ? 'badge-red' : 'badge-orange'}">${daysLeft}d left</span>
          </div>
        </div>
      `;
    }).join('')}
  ` : '';

  const warrantiesHtml = warranties.length > 0 ? `
    <p class="section-title" style="margin-top:24px">🧾 Warranties Expiring Soon</p>
    ${warranties.map(r => {
      const daysLeft = Math.ceil((new Date(r.expiryDate).getTime() - Date.now()) / 86400000);
      return `
        <div class="item-card">
          <div>
            <div class="item-name">${r.storeName}</div>
            <div class="item-meta">Expires ${dateFmt.format(new Date(r.expiryDate))}</div>
          </div>
          <span class="badge ${daysLeft <= 7 ? 'badge-red' : 'badge-orange'}">${daysLeft}d left</span>
        </div>
      `;
    }).join('')}
  ` : '';

  const body = `
    <p class="greeting">Hi <strong>${userName}</strong>, you have items that need your attention.</p>
    ${subsHtml}
    ${warrantiesHtml}
    <div class="cta">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/app" class="cta-btn">
        View in FTD Dashboard →
      </a>
    </div>
  `;

  return emailWrapper('Action Required: FTD Expiration Alerts', body);
};

export const welcomeEmailTemplate = (userName: string): string => {
  const body = `
    <p class="greeting">Hi <strong>${userName}</strong>, welcome to FTD! 🎉</p>
    <p style="color:#94a3b8;margin-bottom:24px">Here's how to get started:</p>
    <div class="item-card">
      <div>
        <div class="item-name">📄 Upload your first receipt</div>
        <div class="item-meta">Digitise a warranty or purchase</div>
      </div>
    </div>
    <div class="item-card">
      <div>
        <div class="item-name">✂️ Track a subscription</div>
        <div class="item-meta">Never miss a renewal again</div>
      </div>
    </div>
    <div class="item-card">
      <div>
        <div class="item-name">💸 Log your expenses</div>
        <div class="item-meta">See where your money goes</div>
      </div>
    </div>
    <div class="cta">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/app" class="cta-btn">
        Get Started →
      </a>
    </div>
  `;
  return emailWrapper('Welcome to FTD!', body);
};

// ── Transport ───────────────────────────────────────────────────────────────

/**
 * Send an email.
 * In development: uses Ethereal (logs preview URL to console).
 * In production: set SENDGRID_API_KEY env var and switch to @sendgrid/mail.
 */
export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  // ── PRODUCTION: SendGrid ─────────────────────────────────────────────────
  // Uncomment when SENDGRID_API_KEY is set:
  //
  // import sgMail from '@sendgrid/mail';
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  // await sgMail.send({ to, from: process.env.EMAIL_FROM || 'alerts@ftd.app', subject, html });
  // return;

  // ── DEVELOPMENT: Ethereal (fake SMTP, no real emails sent) ───────────────
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    const info = await transporter.sendMail({
      from: '"FTD Alerts 🛡️" <alerts@ftd.local>',
      to, subject, html,
    });
    console.log(`✉️  Email to ${to}: ${info.messageId}`);
    console.log(`👀 Preview: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (err) {
    console.error('Email send failed:', err);
  }
};

/** Legacy alias — keeps existing cron.ts call working */
export const sendAlertEmail = sendEmail;
