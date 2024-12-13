import "dotenv/config";
import { getReferrals } from "./referrals.mjs";
import { quitDriver } from "./driver.mjs";
import { broadcast, quitTransporter } from "./broadcast/email.mjs";

async function init() {
  try {
    await getReferrals();
    await broadcast();
  } finally {
    await quitDriver();
    quitTransporter();
  }
}

init();
