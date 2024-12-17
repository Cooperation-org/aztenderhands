import { App } from "./app.mjs";
import { EmailBroadcaster } from "./broadcast/email.mjs";
import { RovicareScraper } from "./rovicare-scraper.mjs";
import { WebDriver } from "./web-driver.mjs";

async function init() {
  const driver = new WebDriver();
  const scraper = new RovicareScraper(driver);
  const emailBroadcaster = new EmailBroadcaster();
  const app = new App(scraper, emailBroadcaster);
  await app.init();

  try {
    await app.start();
  } finally {
    await app.exit();
  }
}

init();
