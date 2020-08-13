import { inject, injectable } from "inversify";
import { Controller, Get, interfaces } from "inversify-restify-utils";
import { Request } from "restify";
import * as HttpStatus from "http-status-codes";
import { DataService, LogService } from "../services";
import { Actor } from "../models/Actor";
import { controllerExceptions } from "../config/constants";
import { getHttpStatusCode, ValidationUtilities } from "../utilities";

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
        const { validated: validated, message: message } = ValidationUtilities.validateCommon(req.query);
        
        if (!validated) {
            this.logger.warn(`InvalidParameter|getAllActors|${message}`);
            return res.send(HttpStatus.BAD_REQUEST, { status: HttpStatus.BAD_REQUEST, message: message});
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
        const { validated: validated, message: message } = ValidationUtilities.validateActorId(actorId);
        
        if (!validated) {
            this.logger.warn(`getActorById|${actorId}|${message}`);
            return res.send(HttpStatus.BAD_REQUEST, { status: HttpStatus.BAD_REQUEST, message: message});
        }

        let resCode: number = HttpStatus.OK;
        let result: Actor;
        try {
            result = new Actor(await this.dataService.getDocument(actorId));
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
