import chalk from "chalk";
import { Logger } from "typeorm";
import { LoggerOptions } from "typeorm/logger/LoggerOptions";
import { PlatformTools } from "typeorm/platform/PlatformTools";
import { createLogger as winston, format, transports } from "winston";

const { printf, combine, label, timestamp, colorize, simple } = format;

const fmt = printf(({ level, message, label, timestamp }) => {
    return `${chalk.gray(
        timestamp
    )} ${label.toLowerCase()}:${level} ${chalk.gray("→")} ${message}`;
});

/**
 * Create a logger with the specified prefix.
 * @param name
 */
export const createLogger = (name: string) =>
    winston({
        transports: [new transports.Console()],
        format: combine(
            label({ label: name }),
            timestamp(),
            colorize(),
            simple(),
            fmt
        ),
    });

export class QueryLogger implements Logger {
    private logger = createLogger("pg");

    constructor(private options?: LoggerOptions) {
        if (
            process.env.TYPEORM_LOGGING != "false" &&
            process.env.TYPEORM_LOGGING
        ) {
            this.logger.level = "debug";
        }
    }

    /**
     * Logs query and parameters used in it.
     */
    logQuery(query: string, parameters?: unknown[]) {
        if (
            this.options === "all" ||
            this.options === true ||
            (Array.isArray(this.options) &&
                this.options.indexOf("query") !== -1)
        ) {
            const sql =
                query +
                (parameters && parameters.length
                    ? " -- PARAMETERS: " + this.stringifyParams(parameters)
                    : "");

            this.logger.debug(`query: ${PlatformTools.highlightSql(sql)}`);
        }
    }

    /**
     * Logs query that is failed.
     */
    logQueryError(error: string, query: string, parameters?: unknown[]) {
        if (
            this.options === "all" ||
            this.options === true ||
            (Array.isArray(this.options) &&
                this.options.indexOf("error") !== -1)
        ) {
            const sql =
                query +
                (parameters && parameters.length
                    ? " -- PARAMETERS: " + this.stringifyParams(parameters)
                    : "");
            this.logger.error(
                `query failed: ${PlatformTools.highlightSql(sql)}`
            );
            this.logger.error(`error:`, error);
        }
    }

    /**
     * Logs query that is slow.
     */
    logQuerySlow(time: number, query: string, parameters?: unknown[]) {
        const sql =
            query +
            (parameters && parameters.length
                ? " -- PARAMETERS: " + this.stringifyParams(parameters)
                : "");
        this.logger.warn(`query is slow: ${PlatformTools.highlightSql(sql)}`);
        this.logger.warn(`execution time: ${time}`);
    }

    /**
     * Logs events from the schema build process.
     */
    logSchemaBuild(message: string) {
        if (
            this.options === "all" ||
            (Array.isArray(this.options) &&
                this.options.indexOf("schema") !== -1)
        ) {
            this.logger.debug(message);
        }
    }

    /**
     * Logs events from the migration run process.
     */
    logMigration(message: string) {
        this.logger.debug(message);
    }

    /**
     * Perform logging using given logger, or by default to the console.
     * Log has its own level and message.
     */
    log(level: "log" | "info" | "warn", message: string) {
        switch (level) {
            case "log":
                if (
                    this.options === "all" ||
                    (Array.isArray(this.options) &&
                        this.options.indexOf("log") !== -1)
                )
                    this.logger.debug(message);
                break;
            case "info":
                if (
                    this.options === "all" ||
                    (Array.isArray(this.options) &&
                        this.options.indexOf("info") !== -1)
                )
                    this.logger.debug(message);
                break;
            case "warn":
                if (
                    this.options === "all" ||
                    (Array.isArray(this.options) &&
                        this.options.indexOf("warn") !== -1)
                )
                    this.logger.warn(message);
                break;
        }
    }

    protected stringifyParams(parameters: unknown[]) {
        try {
            return JSON.stringify(parameters);
        } catch (error) {
            // most probably circular objects in parameters
            return parameters;
        }
    }
}
