import { inject, injectable } from "inversify";
import { Controller, Get, interfaces } from "inversify-restify-utils";
import { Request } from "restify";
import * as HttpStatus from "http-status-codes";
import { DataService } from "../services/DataService";
import { LogService } from "../services/LogService";
import { Actor } from "../models/Actor";
import { ValidationUtilities } from "../utilities/validationUtilities";

// Controller implementation for our actors endpoint
@Controller("/api/actors")
@injectable()
export class ActorController implements interfaces.Controller {

    // Instantiate the actor controller
    constructor(@inject("DataService") private cosmosDb: DataService, @inject("LogService") private logger: LogService) {
        
    }

    @Get("/")
    public async getAllActors(req: Request, res) {
        // Validate query parameters
        const { validated: validated, message: message } = ValidationUtilities.validateCommon(req.query);
        
        if (!validated) {
            res.setHeader("Content-Type", "text/plain");
            this.logger.trace("InvalidParameter|" + "getAllActors" + "|" + message);
            return res.send(HttpStatus.BAD_REQUEST, message);
        }

        let resCode: number = HttpStatus.OK;
        let results: Actor[];

        // Execute query
        try {
            results = await this.cosmosDb.queryActors(req.query);
        } catch (err) {
            this.logger.error(Error(), "CosmosException: Healthz: " + err.code + "\n" + err);
            resCode = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        return res.send(resCode, results);
    }

    @Get("/:id")
    public async getActorById(req, res) {
        // Validate Actor Id parameter
        const actorId: string = req.params.id;
        const { validated: validated, message: message } = ValidationUtilities.validateActorId(actorId);
        
        if (!validated) {
            res.setHeader("Content-Type", "text/plain");
            this.logger.trace("getActorById|" + actorId + "|" + message);
            return res.send(HttpStatus.BAD_REQUEST, message);
        }

        let resCode: number = HttpStatus.OK;
        let result: Actor;
        try {
            result = new Actor(await this.cosmosDb.getDocument(actorId));
        } catch (err) {
            result = err.toString();

            if (err.toString().includes("404")) {
                resCode = HttpStatus.NOT_FOUND;
            } else {
                resCode = HttpStatus.INTERNAL_SERVER_ERROR;
            }
        }

        return res.send(resCode, result);
    }
}