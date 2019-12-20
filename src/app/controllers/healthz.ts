import { inject, injectable } from "inversify";
import { Controller, Get, interfaces } from "inversify-restify-utils";
import * as HttpStatus from "http-status-codes";
import { IDatabaseProvider } from "../../db/idatabaseprovider";
import { ILoggingProvider } from "../../logging/iLoggingProvider";
import { ITelemProvider } from "../../telem/itelemprovider";
import { HealthzSuccessDetails, HealthzSuccess, HealthzError } from "../models/healthz";

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
     *     description: Returns a HealthzSuccess or HealthzError as application/json
     *     tags:
     *       - Healthz
     *     responses:
     *       '200':
     *         description: Returns a HealthzSuccess as application/json
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HealthzSuccess'
     *       '503':
     *         description: Returns a HealthzError as application/json due to unexpected results
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HealthzError'
     */
    @Get("/")
    public async healthcheck(req, res) {
        // healthcheck counts the document types
        let resCode: number = HttpStatus.OK;
        try {
            const healthzSuccess = new HealthzSuccess();
            const healthzDetails = new HealthzSuccessDetails();
            healthzDetails.movies = await this.getcount("Movie");
            healthzDetails.actors = await this.getcount("Actor");
            healthzDetails.genres = await this.getcount("Genre");

            healthzSuccess.details.cosmosDb.details = healthzDetails;

            res.setHeader("Content-Type", "application/json");
            return res.send(resCode, healthzSuccess);
        } catch (err) {
            // TODO: Clean up error/exception handling
            this.logger.Error(Error(), "CosmosException: Healthz: " + err.code + "\n" + err);

            const e: HealthzError = new HealthzError();
            e.details.cosmosDb.details.error = err.Message;
            resCode = e.details.cosmosDb.details.status;

            return res.send(resCode, e);
        }
    }

    private async getcount(type) {
        const sql: string = "select value count(1) from m where m.type = '" + type + "'";

        const results = await this.cosmosDb.queryDocuments(sql);

        const resultNum = parseInt(results[0], 10);
        return resultNum;
    }
}
