import webdriver, { By, Key, until } from "selenium-webdriver";
import { getDriver } from "./driver.mjs";
import { APP_ENDPOINT, REFERRAL_INCOMING_ENDPOINT, SIGNIN_ENDPOINT } from "./consts.mjs";

const TIMEOUT = 10000;

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
  const driver = await getDriver();

  await driver.get(APP_ENDPOINT);
  await driver.wait(until.urlMatches(new RegExp(SIGNIN_ENDPOINT)), TIMEOUT);

  await driver.wait(until.elementLocated(By.id(emailFieldId)), TIMEOUT);

  await driver.findElement(By.id(emailFieldId)).sendKeys(process.env.SIGNIN_EMAIL);
  await driver.findElement(By.id(passwordFieldId)).sendKeys(process.env.SIGNIN_PASSWORD);

  await driver.findElement(By.id(submitButtonId)).sendKeys(Key.RETURN);

  await driver.wait(until.urlMatches(new RegExp(REFERRAL_INCOMING_ENDPOINT)));

  return getTokens(driver);
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
