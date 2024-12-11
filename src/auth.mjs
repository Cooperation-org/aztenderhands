import fs from "node:fs/promises";
import path from "node:path";
import webdriver, { By, Key, until } from "selenium-webdriver";
import { getDriver } from "./driver.mjs";
import { APP_ENDPOINT, REFERRAL_INCOMING_ENDPOINT, SIGNIN_ENDPOINT } from "./consts.mjs";

const TIMEOUT = 10000;
const TOKENS_CACHE_FILE = path.join("cache", "tokens.cache");

const emailFieldId = "signInName";
const passwordFieldId = "password";
const submitButtonId = "next";

/**
 * @typedef {{refreshToken: string, accessToken: string}} Tokens
 */

/**
 * @returns {Promise<Tokens>}
 */
export async function signin() {
  let tokens = await getTokensFromCache();
  if (tokens) return tokens;

  const driver = await getDriver();

  await driver.get(APP_ENDPOINT);
  await driver.wait(until.urlMatches(new RegExp(SIGNIN_ENDPOINT)), TIMEOUT);

  await driver.wait(until.elementLocated(By.id(emailFieldId)), TIMEOUT);

  await driver.findElement(By.id(emailFieldId)).sendKeys(process.env.SIGNIN_EMAIL);
  await driver.findElement(By.id(passwordFieldId)).sendKeys(process.env.SIGNIN_PASSWORD);

  await driver.findElement(By.id(submitButtonId)).sendKeys(Key.RETURN);

  await driver.wait(until.urlMatches(new RegExp(REFERRAL_INCOMING_ENDPOINT)));

  tokens = await getTokens(driver);
  await cacheTokens(tokens);
  return tokens;
}

/**
 * @param {webdriver.ThenableWebDriver} driver
 * @returns {Promise<Tokens>}
 */
function getTokens(driver) {
  return driver.executeScript(() => {
    const refreshToken = window.sessionStorage.getItem("refreshToken");
    const accessToken = window.sessionStorage.getItem("accessToken");
    return { refreshToken, accessToken };
  });
}

/**
 * @param {Promise<Tokens>} tokens
 */
async function cacheTokens(tokens) {
  await fs.writeFile(TOKENS_CACHE_FILE, JSON.stringify(tokens), { encoding: "utf-8" });
}

/**
 * @param {Promise<Tokens>} tokens
 * @returns {?Promise<Tokens>}
 */
async function getTokensFromCache() {
  try {
    const content = await fs.readFile(TOKENS_CACHE_FILE, { encoding: "utf-8" });
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
}
