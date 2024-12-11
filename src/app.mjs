import "dotenv/config";
import { signin } from "./auth.mjs";
import { getReferrals } from "./referrals.mjs";
import { quitDriver } from "./driver.mjs";

async function init() {
  try {
    const tokens = await signin();
    await getReferrals(tokens.accessToken);
  } finally {
    await quitDriver();
  }
}

init();
