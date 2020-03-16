import { inject, injectable } from "inversify";
import { Controller, Get, interfaces } from "inversify-restify-utils";
import { Request } from "restify";
import * as HttpStatus from "http-status-codes";
import { DatabaseProvider } from "../../db/DatabaseProvider";
import { LoggingProvider } from "../../logging/LoggingProvider";
import { Actor } from "../models/Actor";
import { ValidationUtilities } from "../../utilities/validationUtilities";

// Controller implementation for our actors endpoint
@Controller("/api/actors")
@injectable()
export class ActorController implements interfaces.Controller {

    // Instantiate the actor controller
    constructor(@inject("DatabaseProvider") private cosmosDb: DatabaseProvider, @inject("LoggingProvider") private logger: LoggingProvider) {
        
    }

    /**
     * @swagger
     *
     * /api/actors:
     *   get:
     *     description: Retrieve and return all actors.
     *     tags:
     *       - Actors
     *     parameters:
     *       - name: q
     *         description: The actor name to filter by.
     *         in: query
     *         schema:
     *           type: string
     *       - name: pageNumber
     *         description: 1 based page index
     *         in: query
     *         schema:
     *           type: integer
     *           default: 1
     *       - name: pageSize
     *         description: page size (1000 max)
     *         in: query
     *         schema:
     *           type: integer
     *           default: 100
     *     responses:
     *       '200':
     *         description: List of actor objects
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Actor'
     *       default:
     *         description: Unexpected error
     */
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

    /**
     * @swagger
     *
     * /api/actors/{id}:
     *   get:
     *     description: Retrieve and return a single actor by actor ID.
     *     tags:
     *       - Actors
     *     parameters:
     *       - name: id
     *         description: The ID of the actor to look for.
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       '200':
     *         description: The actor object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Actor'
     *       '404':
     *         description: An actor with the specified ID was not found.
     *       default:
     *         description: Unexpected error
     */
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
