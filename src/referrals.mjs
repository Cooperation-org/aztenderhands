import fs from "node:fs/promises";
import path from "node:path";
import { CACHE_DIR, REFERRALS_ENDPOINT, REFERRALS_REQUEST_BODY } from "./consts.mjs";
import { getTimestamp } from "./utils/time.mjs";
import { getTokens, invalidateCache } from "./auth.mjs";

const REFERRALS_CACHE = () => path.join(CACHE_DIR, getTimestamp() + "_referrals.cache");

/**
 * @typedef {{
 *   Data: Object[],
 *   DataLength: number,
 *   Status: number,
 *   Message: string | null,
 *   Warning: string | null,
 *   Error: string | null,
 *   TotalRecords: number,
 *   FhirResponse: unknown | null,
 * }} ResponseBody
 */

/**
 * @param {string} accessToken
 * @returns {Promise<?ResponseBody>}
 */
export async function getReferrals() {
  const { accessToken } = await getTokens();
  const res = await fetch(REFERRALS_ENDPOINT, {
    method: "POST",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(REFERRALS_REQUEST_BODY),
  });

  if (res.status === 401) {
    await invalidateCache();
    return getReferrals();
  }

  /**
   * @type {ResponseBody}
   */
  const jsonRes = await res.json();

  if (jsonRes?.Data) {
    jsonRes.DataLength = jsonRes.Data.length;
  }

  await cacheReferrals(jsonRes);

  return jsonRes;
}

/**
 * @param {ResponseBody} body
 */
async function cacheReferrals(body) {
  await fs.writeFile(REFERRALS_CACHE(), JSON.stringify(body, null, 2), { encoding: "utf-8" });
}
