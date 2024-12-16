import { z } from "zod";

const ConfigZ = z.object({
  dbURI: z.string(),
  smtp: z.object({
    auth: z.object({
      email: z.string().email(),
      password: z.string().min(3),
    }),
  }),
  broadcastEmails: z.array(z.string().email()).min(1),
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
});

export { config };
