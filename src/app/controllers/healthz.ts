import { inject, injectable } from "inversify";
import { Controller, Get, interfaces } from "inversify-restify-utils";
import * as HttpStatus from "http-status-codes";
import { IDatabaseProvider } from "../../db/idatabaseprovider";
import { ILoggingProvider } from "../../logging/iLoggingProvider";
import { ITelemProvider } from "../../telem/itelemprovider";
import { sqlGenres, webInstanceRole, version } from "../../config/constants";

enum IetfStatus {
    up = "up",
    warn = "warn",
    down = "down",
}

/**
 * controller implementation for our healthz endpoint
 */
@Controller("/healthz")
@injectable()
export class HealthzController implements interfaces.Controller {

    constructor(@inject("IDatabaseProvider") private cosmosDb: IDatabaseProvider,
                @inject("ITelemProvider") private telem: ITelemProvider,
                @inject("ILoggingProvider") private logger: ILoggingProvider) {
        this.cosmosDb = cosmosDb;
        this.telem = telem;
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
        const resCode = healthCheckResult.status === IetfStatus.down ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.OK;

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
        const resCode = healthCheckResult.status === IetfStatus.down ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.OK;

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
        ietfResult.status = IetfStatus.up;
        ietfResult.serviceId =  "helium-typescript";
        ietfResult.description = "Helium Typescript Health Check";
        ietfResult.instance = process.env[webInstanceRole] ?? "unknown";
        ietfResult.version = version;

        const healthChecks: {[k: string]: any} = {};
        try {
            healthChecks.getGenresAsync = (await this.runHealthCheckAsync("/api/genres", 400));
            healthChecks.getActorByIdAsync = (await this.runHealthCheckAsync("/api/actors/nm0000173", 250));
            healthChecks.getMovieByIdAsync = (await this.runHealthCheckAsync("/api/movies/tt0133093", 250));
            healthChecks.searchMoviesAsync = (await this.runHealthCheckAsync("/api/movies?q=ring", 400));
            healthChecks.searchActorsAsync = (await this.runHealthCheckAsync("/api/actors?q=nicole", 400));
            healthChecks.getTopRatedMoviesAsync = (await this.runHealthCheckAsync("/api/movies?toprated=true", 400));

            // if any health check has a warn or down status
            // set overall status to the worst status
            for (const check in healthChecks) {
                if (healthChecks.hasOwnProperty(check)) {
                    if (!(healthChecks[check].status === IetfStatus.up)) {
                        ietfResult.status = healthChecks[check].status;
                    }

                    if (ietfResult.status === IetfStatus.down) {
                        break;
                    }
                }
            }

            ietfResult.checks = healthChecks;
            return ietfResult;
        } catch (err) {
            this.logger.Error(Error(), "CosmosException: Healthz: " + err);
            ietfResult.status = IetfStatus.down;
            ietfResult.cosmosException = err;
            ietfResult.checks = healthChecks;
            return ietfResult;
        }
    }

    /**
     * Executes a health check and builds the result
     * @param endpoint The affected endpoint for the health check to run.
     * @param target The target duration for the health check endpoint call.
     */
    private async runHealthCheckAsync(endpoint: string, target: number) {
        // start tracking time
        const startDate = new Date();
        const start = process.hrtime();

        // execute health check query based on endpoint
        if (endpoint === "/api/genres") {
            await this.cosmosDb.queryDocuments(sqlGenres);
        } else if (endpoint === "/api/actors/nm0000173") {
            await this.cosmosDb.getDocument("nm0000173");
        } else if (endpoint === "/api/movies/tt0133093") {
            await this.cosmosDb.getDocument("tt0133093");
        } else if (endpoint === "/api/movies?q=ring") {
            await this.cosmosDb.queryMovies({q: "ring"});
        } else if (endpoint === "/api/actors?q=nicole") {
            await this.cosmosDb.queryActors({q: "nicole"});
        } else {
            await this.cosmosDb.queryMovies({toprated: "true"});
        }

        const hrtime = process.hrtime(start);

        // convert to milliseconds
        const duration = ((hrtime[0] * 1e9) + hrtime[1]) / 1e6;

        // build health check result following ietf standard
        const healthCheckResult: {[k: string]: any} = {};
        healthCheckResult.status = IetfStatus.up;
        healthCheckResult.componentType = "CosmosDB";
        healthCheckResult.observedUnit = "ms";
        healthCheckResult.observedValue = duration.toFixed(0);
        healthCheckResult.targetValue = target;
        healthCheckResult.time = startDate.toISOString();
        healthCheckResult.affectedEndpoints = endpoint;

        // set to warn if target duration is not met
        if (healthCheckResult.observedValue > healthCheckResult.targetValue) {
            healthCheckResult.status = IetfStatus.warn;
            healthCheckResult.message = "Request exceeded expected duration";
        }

        return healthCheckResult;
    }
}
