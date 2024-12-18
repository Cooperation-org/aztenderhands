import { App } from "./app.mjs";
import { EmailBroadcaster } from "./broadcast/email.mjs";
import { Logger } from "./logger.mjs";
import { RovicareScraper } from "./rovicare-scraper.mjs";
import { Dao } from "./storage/dao.mjs";

async function init() {
  const logger = new Logger();
  const dao = new Dao();
  const scraper = new RovicareScraper(dao, logger);
  const emailBroadcaster = new EmailBroadcaster();

  const app = new App(scraper, emailBroadcaster, logger);
  await app.init();

  try {
    await app.start();
  } finally {
    await app.exit();
  }
}

init();
