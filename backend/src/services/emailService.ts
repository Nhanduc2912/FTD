import nodemailer from 'nodemailer';

// Advanced Email Setup using Ethereal Email for testing
// Ethereal is a fake SMTP service designed for developers.
export const sendAlertEmail = async (to: string, subject: string, htmlContent: string) => {
  try {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real SMTP account.
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"FTD Alerts 🛡️" <alerts@ftd.local>',
      to,
      subject,
      html: htmlContent,
    });

    console.log(`✉️ Email sent to ${to}: ${info.messageId}`);
    // Preview only available when sending through an Ethereal account
    console.log(`👀 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    
  } catch (error) {
    console.error('Failed to send email:', error);
  }
};
