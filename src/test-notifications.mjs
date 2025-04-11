import "dotenv/config";
import { EmailBroadcaster } from "./broadcast/email.mjs";
import { SMSBroadcaster } from "./broadcast/sms.mjs";
import { Logger } from "./logger.mjs";
import { config } from "./config.mjs";

async function testNotifications() {
  const logger = new Logger();

  // Test Email
  if (config.broadcastEmails?.length) {
    logger.info("Testing email notifications...");
    const emailBroadcaster = new EmailBroadcaster(logger);
    try {
      const emailIds = await emailBroadcaster.broadcast();
      logger.info(`Email test successful! Message IDs: ${emailIds.join(", ")}`);
    } catch (error) {
      logger.error("Email test failed:", error);
    }
  } else {
    logger.warn("No email addresses configured for testing");
  }

  // Test SMS
  if (config.broadcastPhoneNumbers?.length) {
    logger.info("Testing SMS notifications...");
    const smsBroadcaster = new SMSBroadcaster(logger);
    try {
      await smsBroadcaster.broadcast();
      logger.info("SMS test successful!");
    } catch (error) {
      logger.error("SMS test failed:", error);
    }
  } else {
    logger.warn("No phone numbers configured for testing");
  }
}

// Run the tests
testNotifications().catch(console.error);
