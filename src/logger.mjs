import winston from "winston";

export class Logger {
  #LOGFILE = "logs/main.log";
  #logger;

  constructor() {
    const { combine, timestamp, printf } = winston.format;

    this.#logger = winston.createLogger({
      transports: [
        new winston.transports.Console({
          format: combine(
            timestamp(),
            printf(({ level, message, timestamp }) => {
              return `${timestamp} [${level}]: ${message}`;
            }),
          ),

          level: "debug",
        }),
        new winston.transports.File({
          level: "info",
          filename: this.#LOGFILE,
          format: combine(timestamp(), winston.format.json()),
        }),
      ],
    });
  }

  debug(message) {
    return this.#logger.debug(message);
  }

  info(message) {
    return this.#logger.info(message);
  }

  warn(message) {
    return this.#logger.warn(message);
  }

  error(message) {
    return this.#logger.error(message);
  }
}
