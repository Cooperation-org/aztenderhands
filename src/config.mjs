import { z } from "zod";

function parseArray(key) {
  return process.env[key] ? process.env[key].split(",") : [];
}

const ConfigZ = z.object({
  dbURI: z.string().default("sqlite:./data.db"),

  intervalDuration: z.coerce.number(),

  broadcastEmails: z.array(z.string().email()).optional(),
  smtp: z
    .object({
      auth: z.object({
        email: z.string().email(),
        password: z.string().min(3),
      }),
    })
    .optional(),

  broadcastPhoneNumbers: z.array(z.string()).optional(),
  twilio: z
    .object({
      accountSid: z.string().min(3),
      authToken: z.string().min(3),
      fromNumber: z.string().min(3),
    })
    .optional(),

  firefoxBinaryPath: z.string().optional(),
});

const emails = parseArray("EMAILS_TO_NOTIFY");
const phoneNumbers = parseArray("PHONE_NUMBERS_TO_NOTIFY");

const config = ConfigZ.parse({
  dbURI: process.env.DATABASE_URL,

  intervalDuration: process.env.INTERVAL_DURATION,

  broadcastEmails: emails,
  smtp: emails.length
    ? {
        auth: {
          email: process.env.SMTP_AUTH_EMAIL,
          password: process.env.SMTP_AUTH_PASSWORD,
        },
      }
    : undefined,

  broadcastPhoneNumbers: phoneNumbers,
  twilio: phoneNumbers
    ? {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        fromNumber: process.env.TWILIO_FROM_NUMBER,
      }
    : undefined,

  firefoxBinaryPath: process.env.FIREFOX_BINARY_PATH,
});

export { config };
