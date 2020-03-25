import { inject, injectable } from "inversify";
import { Controller, Get, interfaces } from "inversify-restify-utils";
import * as HttpStatus from "http-status-codes";
import { DataService } from "../services/DataService";
import { LogService } from "../services/LogService";
import { Movie } from "../models/Movie";
import { ValidationUtilities } from "../utilities/validationUtilities";

/**
 * controller implementation for our movies endpoint
 */
@Controller("/api/movies")
@injectable()
export class MovieController implements interfaces.Controller {

    constructor(@inject("DataService") private cosmosDb: DataService, @inject("LogService") private logger: LogService) {
        
    }

    @Get("/")
    public async getAllMovies(req, res) {
        // Validate query parameters
        const { validated: validated, message: message } = ValidationUtilities.validateMovies(req.query);
        
        if (!validated) {
            res.setHeader("Content-Type", "text/plain");
            this.logger.trace("InvalidParameter|" + "getAllMovies" + "|" + message);
            return res.send(HttpStatus.BAD_REQUEST, message);
        }

        let resCode: number = HttpStatus.OK;
        let results: Movie[];

        // Execute query
        try {
            results = await this.cosmosDb.queryMovies(req.query);
        } catch (err) {
            resCode = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        return res.send(resCode, results);
    }

    @Get("/:id")
    public async getMovieById(req, res) {
        // Validate Movie Id parameter
        const movieId: string = req.params.id;
        const { validated: validated, message: message } = ValidationUtilities.validateMovieId(movieId);

        if (!validated) {
            res.setHeader("Content-Type", "text/plain");
            this.logger.trace("getMovieById|" + movieId + "|" + message);
            return res.send(HttpStatus.BAD_REQUEST, message);
        }

        let resCode: number = HttpStatus.OK;
        let result: Movie;
        try {
            result = new Movie(await this.cosmosDb.getDocument(movieId));
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
