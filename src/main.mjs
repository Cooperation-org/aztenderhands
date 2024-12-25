import { App } from "./app.mjs";
import { EmailBroadcaster } from "./broadcast/email.mjs";
import { SMSBroadcaster } from "./broadcast/sms.mjs";
import { config } from "./config.mjs";
import { Logger } from "./logger.mjs";
import { RovicareScraper } from "./rovicare-scraper.mjs";
import { Dao } from "./storage/dao.mjs";

async function init() {
  const logger = new Logger();
  const dao = new Dao();
  const scraper = new RovicareScraper(dao, logger);
  const emailBroadcaster = new EmailBroadcaster(logger);
  const smsBroadcaster = new SMSBroadcaster(logger);

  const broadcasters = [];

  if (config.broadcastEmails.length) {
    broadcasters.push(emailBroadcaster);
  }
  if (config.broadcastPhoneNumbers.length) {
    broadcasters.push(smsBroadcaster);
  }

  const app = new App(scraper, broadcasters, dao, logger);
  await app.init();

  try {
    await app.start();
  } finally {
    await app.exit();
  }
}

init();
