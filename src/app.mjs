import "dotenv/config";
import { getReferrals } from "./referrals.mjs";
import { quitDriver } from "./driver.mjs";

async function init() {
  try {
    await getReferrals();
  } finally {
    await quitDriver();
  }
}

init();
