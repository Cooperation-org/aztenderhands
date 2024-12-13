import "dotenv/config";
import { getReferrals } from "./referrals.mjs";
import { quitDriver } from "./driver.mjs";
import { quitTransporter } from "./broadcast/email.mjs";

async function init() {
  try {
    await getReferrals();
  } finally {
    await quitDriver();
    quitTransporter();
  }
}

init();
