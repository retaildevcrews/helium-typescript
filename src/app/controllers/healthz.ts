import { inject, injectable } from "inversify";
import { Controller, Get, interfaces } from "inversify-restify-utils";
import * as HttpStatus from "http-status-codes";
import { IDatabaseProvider } from "../../db/idatabaseprovider";
import { ILoggingProvider } from "../../logging/iLoggingProvider";
import { sqlGenres, webInstanceRole, version } from "../../config/constants";
import { DateUtilities } from "../../utilities/dateUtilities";

enum IetfStatus {
    pass = "pass",
    warn = "warn",
    fail = "fail",
}

/**
 * controller implementation for our healthz endpoint
 */
@Controller("/healthz")
@injectable()
export class HealthzController implements interfaces.Controller {

    constructor(@inject("IDatabaseProvider") private cosmosDb: IDatabaseProvider,
                @inject("ILoggingProvider") private logger: ILoggingProvider) {
        this.cosmosDb = cosmosDb;
        this.logger = logger;
    }

    /**
     * @swagger
     *
     * /healthz:
     *   get:
     *     description: Returns a plain text health status (Healthy, Degraded or Unhealthy)
     *     tags:
     *       - Healthz
     *     responses:
     *       '200':
     *         description: Returns a plain text health status as text/plain
     */
    @Get("/")
    public async healthCheck(req, res) {

        const healthCheckResult = await this.runHealthChecksAsync();
        const resCode = healthCheckResult.status === IetfStatus.fail ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.OK;

        res.setHeader("Content-Type", "text/plain");
        return res.send(resCode, healthCheckResult.status);
    }

    /**
     * @swagger
     *
     * /healthz/ietf:
     *   get:
     *     description: Returns an IETF (draft) health+json representation of the full Health Check
     *     tags:
     *       - Healthz
     *     responses:
     *       '200':
     *         description: Returns an IETF (draft) health+json representation of the full Health Check
     */
    @Get("/ietf")
    public async healthCheckIetf(req, res) {
        const healthCheckResult = await this.runHealthChecksAsync();
        const resCode = healthCheckResult.status === IetfStatus.fail ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.OK;

        res.setHeader("Content-Type", "application/health+json");
        res.writeHead(resCode, {
            "Content-Length": Buffer.byteLength(JSON.stringify(healthCheckResult)),
            "Content-Type": "application/health+json",
        });
        res.write(JSON.stringify(healthCheckResult));
    }

    /**
     * Executes all health checks and builds the final ietf result
     */
    private async runHealthChecksAsync() {
        const ietfResult: {[k: string]: any} = {};
        ietfResult.status = IetfStatus.pass;
        ietfResult.serviceId =  "helium-typescript";
        ietfResult.description = "Helium Typescript Health Check";
        ietfResult.instance = process.env[webInstanceRole] ?? "unknown";
        ietfResult.version = version;

        // Declare health checks
        const healthChecks: {[k: string]: any} = {};
        const getGenres: {[k: string]: any} = {};
        const getActorById: {[k: string]: any} = {};
        const getMovieById: {[k: string]: any} = {};
        const searchMovies: {[k: string]: any} = {};
        const searchActors: {[k: string]: any} = {};

        try {
            healthChecks.getGenres = getGenres;
            await this.runHealthCheckAsync("/api/genres", 400, healthChecks.getGenres);

            healthChecks.getActorById = getActorById;
            await this.runHealthCheckAsync("/api/actors/nm0000173", 250, healthChecks.getActorById);

            healthChecks.getMovieById = getMovieById;
            await this.runHealthCheckAsync("/api/movies/tt0133093", 250, healthChecks.getMovieById);

            healthChecks.searchMovies = searchMovies;
            await this.runHealthCheckAsync("/api/movies?q=ring", 400, healthChecks.searchMovies);

            healthChecks.searchActors = searchActors;
            await this.runHealthCheckAsync("/api/actors?q=nicole", 400, healthChecks.searchActors);

            // if any health check has a warn or down status
            // set overall status to the worst status
            for (const check in healthChecks) {
                if (healthChecks.hasOwnProperty(check)) {
                    if (!(healthChecks[check].status === IetfStatus.pass)) {
                        ietfResult.status = healthChecks[check].status;
                    }

                    if (ietfResult.status === IetfStatus.fail) {
                        break;
                    }
                }
            }

            ietfResult.checks = healthChecks;
            return ietfResult;
        } catch (err) {
            this.logger.Error(Error(), "CosmosException: Healthz: " + err);
            ietfResult.status = IetfStatus.fail;
            ietfResult.cosmosException = err;
            ietfResult.checks = healthChecks;
            return ietfResult;
        }
    }

    /**
     * Executes a health check and builds the result
     * @param endpoint The affected endpoint for the health check to run.
     * @param target The target duration for the health check endpoint call.
     * @param healthCheckResult The health check entry to update.
     */
    private async runHealthCheckAsync(endpoint: string, target: number, healthCheckResult: any) {
        // start tracking time
        const startDate = new Date();
        const start = process.hrtime();

        // build health check result following ietf standard
        healthCheckResult.status = IetfStatus.pass;
        healthCheckResult.componentType = "CosmosDB";
        healthCheckResult.observedUnit = "ms";
        healthCheckResult.observedValue = 0;
        healthCheckResult.targetValue = target;
        healthCheckResult.time = startDate.toISOString();

        try {
            // execute health check query based on endpoint
            if (endpoint === "/api/genres") {
                await this.cosmosDb.queryDocuments(sqlGenres);
            } else if (endpoint === "/api/actors/nm0000173") {
                await this.cosmosDb.getDocument("nm0000173");
            } else if (endpoint === "/api/movies/tt0133093") {
                await this.cosmosDb.getDocument("tt0133093");
            } else if (endpoint === "/api/movies?q=ring") {
                await this.cosmosDb.queryMovies({q: "ring"});
            } else {
                await this.cosmosDb.queryActors({q: "nicole"});
            }

            // calculate duration in ms
            healthCheckResult.observedValue = DateUtilities.getDurationMS(process.hrtime(start));
        } catch (e) {
            // calculate duration
            // log exception and fail status, and re-throw exception
            healthCheckResult.observedValue = DateUtilities.getDurationMS(process.hrtime(start));
            healthCheckResult.status = IetfStatus.fail;
            healthCheckResult.affectedEndpoints = [ endpoint ];
            healthCheckResult.message = e;

            throw e;
        }

        // set to warn if target duration is not met
        // only log affected endpoints if warn or fail status
        if (healthCheckResult.observedValue > healthCheckResult.targetValue) {
            healthCheckResult.status = IetfStatus.warn;
            healthCheckResult.affectedEndpoints = [ endpoint ];
            healthCheckResult.message = "Request exceeded expected duration";
        }
    }
}
