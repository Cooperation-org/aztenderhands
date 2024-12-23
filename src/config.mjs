import { z } from "zod";

const ConfigZ = z.object({
  dbURI: z.string(),
  smtp: z.object({
    auth: z.object({
      email: z.string().email(),
      password: z.string().min(3),
    }),
  }),
  broadcastEmails: z.array(z.string().email()),
  broadcastPhoneNumbers: z.array(z.string()),
  twilio: z.object({
    accountSid: z.string().min(3),
    authToken: z.string().min(3),
    fromNumber: z.string().min(3),
  }),
});

const config = ConfigZ.parse({
  dbURI: process.env.DATABASE_URL,
  broadcastEmails: (process.env.EMAILS_TO_NOTIFY || "").split(","),
  smtp: {
    auth: {
      email: process.env.SMTP_AUTH_EMAIL,
      password: process.env.SMTP_AUTH_PASSWORD,
    },
  },
  broadcastPhoneNumbers: (process.env.PHONE_NUMBERS_TO_NOTIFY || "").split(","),
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_FROM_NUMBER,
  },
});

export { config };
