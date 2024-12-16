import "dotenv/config";
import { getReferrals } from "./referrals.mjs";
import { quitDriver } from "./driver.mjs";
import { EmailBroadcaster } from "./broadcast/email.mjs";
import { ServiceRequestDao } from "./storage/dao.mjs";

async function init() {
  const serviceRequestDao = new ServiceRequestDao();
  const emailBroadcaster = new EmailBroadcaster();

  await serviceRequestDao.init();

  try {
    const referrals = await getReferrals();
    await serviceRequestDao.createServiceRequests(referrals);
    // await emailBroadcaster.broadcast();
  } finally {
    await quitDriver();
    await serviceRequestDao.disconnect();
    emailBroadcaster.quit();
  }
}

init();
