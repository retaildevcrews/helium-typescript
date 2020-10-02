import { inject, injectable } from "inversify";
import { Controller, Get, interfaces } from "inversify-restify-utils";
import * as HttpStatus from "http-status-codes";
import { DataService, LogService } from "../services";
import { Movie } from "../models/Movie";
import { controllerExceptions } from "../config/constants";
import { getHttpStatusCode, APIValidationUtilities } from "../utilities";

// controller implementation for our movies endpoint
@Controller("/api/movies")
@injectable()
export class MovieController implements interfaces.Controller {

    constructor(@inject("DataService") private cosmosDb: DataService,
                @inject("LogService") private logger: LogService) {
    }

    @Get("/")
    public async getAllMovies(req, res) {
        // validate query parameters
        const { validated: validated, errorResponse: errorResponse } = APIValidationUtilities.validateMovies(req.query, req.path(), req.getQuery());

        if (!validated) {
            this.logger.warn(`InvalidParameter|getAllMovies|${errorResponse.detail}`);
            res.writeHead(HttpStatus.BAD_REQUEST, {
                "Content-Type": "application/problem+json",
            });
            res.write(JSON.stringify(errorResponse,null,4));
    
            return res.end();
        }

        let resCode: number = HttpStatus.OK;
        let results: Movie[];

        // execute query
        try {
            results = await this.cosmosDb.queryMovies(req.query);
        } catch (err) {
            resCode = getHttpStatusCode(err);
            this.logger.error(Error(err), `${controllerExceptions.moviesControllerException}: ${err.toString()}`);
            return res.send(resCode, { status: resCode, message: controllerExceptions.moviesControllerException });
        }

        return res.send(resCode, results);
    }

    @Get("/:id")
    public async getMovieById(req, res) {
        // validate Movie Id parameter
        const movieId: string = req.params.id;
        const { validated: validated, errorResponse: errorResponse } = APIValidationUtilities.validateMovieId(movieId, req.path(), req.getQuery());

        if (!validated) {
            this.logger.warn(`getMovieById|${movieId}|${errorResponse.detail}`);
            res.writeHead(HttpStatus.BAD_REQUEST, {
                "Content-Type": "application/problem+json",
            });
            res.write(JSON.stringify(errorResponse,null,4));
    
            return res.end();
        }

        let resCode: number = HttpStatus.OK;
        let result: Movie;
        try {
            result = new Movie(await this.cosmosDb.getMovieById(movieId));
        } catch (err) {
            resCode = getHttpStatusCode(err);

            if (resCode === HttpStatus.NOT_FOUND) {
                this.logger.warn(`Movie Not Found: ${movieId}`);
                return res.send(resCode, { status: resCode, message: "Movie Not Found" });
            }

            this.logger.error(Error(err), `${controllerExceptions.moviesControllerException}: ${err.toString()}`);
            return res.send(resCode, { status: resCode, message: controllerExceptions.moviesControllerException });
        }

        return res.send(resCode, result);
    }
}
