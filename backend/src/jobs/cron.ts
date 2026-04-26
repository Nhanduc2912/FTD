import cron from 'node-cron';
import { Subscription } from '../models/Subscription';
import { Receipt } from '../models/Receipt';
import { User } from '../models/User';
import { sendAlertEmail } from '../services/emailService';

// Run every day at midnight: '0 0 * * *'
// For testing purposes, we can run it every minute: '* * * * *'
export const startCronJobs = () => {
  console.log('⏰ Initializing FTD Cron Jobs...');

  cron.schedule('* * * * *', async () => {
    console.log('🔄 Running Expiration Check Job...');
    try {
      const today = new Date();
      
      // 1. Check Subscriptions expiring in <= 3 days
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);

      const expiringSubs = await Subscription.find({
        nextBillingDate: { $lte: threeDaysFromNow, $gt: today }
      });

      // 2. Check Receipts warranties expiring in <= 30 days
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const expiringReceipts = await Receipt.find({
        expiryDate: { $lte: thirtyDaysFromNow, $gt: today }
      });

      // 3. Aggregate alerts by User
      const alertsByUser: Record<string, { subs: any[], receipts: any[] }> = {};

      expiringSubs.forEach(sub => {
        const userId = sub.userId.toString();
        if (!alertsByUser[userId]) alertsByUser[userId] = { subs: [], receipts: [] };
        alertsByUser[userId].subs.push(sub);
      });

      expiringReceipts.forEach(receipt => {
        const userId = receipt.userId.toString();
        if (!alertsByUser[userId]) alertsByUser[userId] = { subs: [], receipts: [] };
        alertsByUser[userId].receipts.push(receipt);
      });

      // 4. Send emails
      for (const userId in alertsByUser) {
        const user = await User.findById(userId);
        if (!user) continue;

        const alertData = alertsByUser[userId];
        if (!alertData) continue;
        const { subs, receipts } = alertData;
        
        let html = `<h2>Hello ${user.name}, you have items requiring your attention!</h2>`;
        
        if (subs.length > 0) {
          html += `<h3>🔄 Subscriptions Renewing Soon:</h3><ul>`;
          subs.forEach((s: any) => html += `<li>${s.serviceName} - $${s.cost} on ${new Date(s.nextBillingDate).toLocaleDateString()}</li>`);
          html += `</ul>`;
        }

        if (receipts.length > 0) {
          html += `<h3>🧾 Warranties Expiring Soon:</h3><ul>`;
          receipts.forEach((r: any) => html += `<li>${r.storeName} - ${new Date(r.expiryDate).toLocaleDateString()}</li>`);
          html += `</ul>`;
        }

        await sendAlertEmail(user.email, 'Action Required: FTD Expiration Alerts', html);
      }

    } catch (error) {
      console.error('Error in cron job:', error);
    }
  });
};
