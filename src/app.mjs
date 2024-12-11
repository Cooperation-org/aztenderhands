import "dotenv/config";
import fs from "node:fs/promises";
import { signin } from "./auth.mjs";
import { getReferrals } from "./referrals.mjs";
import { quitDriver } from "./driver.mjs";
import { CACHE_DIR } from "./consts.mjs";
import { getTimestamp } from "./utils/time.mjs";

async function init() {
  try {
    const tokens = await signin();
    const referrals = await getReferrals(tokens.accessToken);
    if (!referrals) {
      const s = await fs.stat(`${CACHE_DIR}/tokens.cache`);
      await fs.writeFile(
        `${CACHE_DIR}/__${getTimestamp()}_access_failed.cache`,
        `failed on ${new Date()}, the tokens was generated at ${s.mtime},`,
      );
    }
  } finally {
    await quitDriver();
  }
}

init();
