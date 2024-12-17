import { App } from "./app.mjs";
import { EmailBroadcaster } from "./broadcast/email.mjs";
import { RovicareScraper } from "./rovicare-scraper.mjs";

async function init() {
  const scraper = new RovicareScraper();
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
