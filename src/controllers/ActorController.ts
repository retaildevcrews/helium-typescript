import { inject, injectable } from "inversify";
import { Controller, Get, interfaces } from "inversify-restify-utils";
import { Request } from "restify";
import * as HttpStatus from "http-status-codes";
import { DataService, LogService } from "../services";
import { Actor } from "../models/Actor";
import { controllerExceptions } from "../config/constants";
import { getHttpStatusCode, APIValidationUtilities } from "../utilities";

// controller implementation for our actors endpoint
@Controller("/api/actors")
@injectable()
export class ActorController implements interfaces.Controller {

    constructor(
        @inject("DataService") private dataService: DataService,
        @inject("LogService") private logger: LogService) {
    }

    @Get("/")
    public async getAllActors(req: Request, res) {
        // validate query parameters
        const { validated: validated, errorResponse: errorResponse } = APIValidationUtilities.validateActors(req.query, req.path(), req.getQuery());
        
        if (!validated) {
            this.logger.warn(`InvalidParameter|getAllActors|${errorResponse.detail}`); 
            res.setHeader("Content-Type", "application/problem+json");
            return res.sendRaw(HttpStatus.BAD_REQUEST, JSON.stringify(errorResponse, null, 4));  
        }

        let resCode: number = HttpStatus.OK;
        let results: Actor[];

        // execute query
        try {
            results = await this.dataService.queryActors(req.query);
        } catch (err) {
            resCode = getHttpStatusCode(err);
            this.logger.error(Error(err), `${controllerExceptions.actorsControllerException}: ${err.toString()}`);
            return res.send(resCode, { status: resCode, message: controllerExceptions.actorsControllerException });
        }

        return res.send(resCode, results);
    }

    @Get("/:id")
    public async getActorById(req, res) {
        // validate Actor Id parameter
        const actorId: string = req.params.id;
        const { validated: validated, errorResponse: errorResponse } = APIValidationUtilities.validateActorId(actorId, req.path(), req.getQuery());
        
        if (!validated) {
            this.logger.warn(`getActorById|${actorId}|${errorResponse.detail}`); 
            res.setHeader("Content-Type", "application/problem+json");
            return res.sendRaw(HttpStatus.BAD_REQUEST, JSON.stringify(errorResponse, null, 4)); 
        }

        let resCode: number = HttpStatus.OK;
        let result: Actor;
        try {
            result = new Actor(await this.dataService.getActorById(actorId));
        } catch (err) {
            resCode = getHttpStatusCode(err);

            if (resCode === HttpStatus.NOT_FOUND) {
                this.logger.warn(`Actor Not Found: ${actorId}`);
                return res.send(resCode, {status: resCode, message: "Actor Not Found"});
            }

            this.logger.error(Error(err), `${controllerExceptions.actorsControllerException}: ${err.toString()}`);
            return res.send(resCode, {status: resCode, message: controllerExceptions.actorsControllerException});
        }

        return res.send(resCode, result);
    }
}
