import cron from 'node-cron';
import { Subscription } from '../models/Subscription';
import { Receipt } from '../models/Receipt';
import { User } from '../models/User';
import { sendEmail, renewalAlertTemplate } from '../services/emailService';

/**
 * FTD Cron Jobs
 *
 * Schedule:
 *   - '0 8 * * *'  → every day at 08:00 (production)
 *   - '* * * * *'  → every minute (development/testing)
 *
 * Change the schedule string below to switch modes.
 */
const CRON_SCHEDULE = process.env.NODE_ENV === 'production' ? '0 8 * * *' : '0 8 * * *';

export const startCronJobs = () => {
  console.log('⏰ Initializing FTD Cron Jobs…');

  cron.schedule(CRON_SCHEDULE, async () => {
    console.log('🔄 Running Expiration Check Job…');
    try {
      const today = new Date();

      // 1. Subscriptions renewing in next 3 days (respects per-sub reminderDaysBefore)
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);

      const expiringSubs = await Subscription.find({
        nextBillingDate: { $lte: threeDaysFromNow, $gt: today },
        isActive: true,
      });

      // 2. Warranties expiring in next 30 days
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const expiringReceipts = await Receipt.find({
        expiryDate: { $lte: thirtyDaysFromNow, $gt: today },
      });

      // 3. Group alerts by userId
      const alertsByUser: Record<string, {
        subs: typeof expiringSubs;
        receipts: typeof expiringReceipts;
      }> = {};

      expiringSubs.forEach(sub => {
        const uid = sub.userId.toString();
        if (!alertsByUser[uid]) alertsByUser[uid] = { subs: [], receipts: [] };
        alertsByUser[uid].subs.push(sub);
      });

      expiringReceipts.forEach(receipt => {
        const uid = receipt.userId.toString();
        if (!alertsByUser[uid]) alertsByUser[uid] = { subs: [], receipts: [] };
        alertsByUser[uid].receipts.push(receipt);
      });

      // 4. Send branded HTML email to each affected user
      for (const userId of Object.keys(alertsByUser)) {
        const user = await User.findById(userId);
        if (!user?.email) continue;

        const entry = alertsByUser[userId];
        if (!entry) continue;
        const { subs, receipts } = entry;

        const html = renewalAlertTemplate(
          user.name ?? 'there',
          subs.map((s: typeof expiringSubs[number]) => ({
            serviceName: s.serviceName,
            cost: s.cost,
            nextBillingDate: s.nextBillingDate,
            billingCycle: s.billingCycle,
          })),
          receipts
            .filter((r: typeof expiringReceipts[number]) => r.expiryDate)
            .map((r: typeof expiringReceipts[number]) => ({
              storeName: r.storeName,
              expiryDate: r.expiryDate as Date,
            }))
        );

        await sendEmail(
          user.email,
          `🔔 Action Required: ${subs.length + receipts.length} item(s) expiring soon`,
          html
        );

        console.log(`📧 Alert sent to ${user.email} (${subs.length} subs, ${receipts.length} warranties)`);
      }

      console.log(`✅ Expiration check complete. ${Object.keys(alertsByUser).length} user(s) notified.`);

    } catch (error) {
      console.error('❌ Cron job error:', error);
    }
  });

  console.log(`⏰ Cron scheduled: "${CRON_SCHEDULE}"`);
};
