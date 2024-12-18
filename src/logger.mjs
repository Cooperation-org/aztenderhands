import winston from "winston";

export class Logger {
  #LOGFILE = "logs/main.log";
  #logger;

  constructor() {
    const { combine, timestamp, printf } = winston.format;

    this.#logger = winston.createLogger({
      level: "debug",
      format: combine(
        timestamp(),
        printf(({ level, message, timestamp }) => {
          return `${timestamp} [${level}]: ${message}`;
        }),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: this.#LOGFILE, format: winston.format.json() }),
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
