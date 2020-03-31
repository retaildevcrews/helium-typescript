import { inject, injectable } from "inversify";
import { Controller, Get, interfaces } from "inversify-restify-utils";
import * as HttpStatus from "http-status-codes";
import { DataService } from "../services/DataService";
import { LogService } from "../services/LogService";
import { Movie } from "../models/Movie";
import { getHttpStatusCode } from "../utilities/httpStatusUtilities";

/**
 * controller implementation for our featured movie endpoint
 */
@Controller("/api/featured")
@injectable()
export class FeaturedController implements interfaces.Controller {

    private featuredMovies: string[];

    constructor(@inject("DataService") private cosmosDb: DataService, @inject("LogService") private logger: LogService) {
    
    }

    @Get("/movie")
    public async getFeaturedMovie(req, res) {
        let resCode: number = HttpStatus.OK;
        let result: Movie;

        try {
            if ( this.featuredMovies == null || this.featuredMovies.length === 0 ) {
                this.featuredMovies = await this.getFeaturedMovieList();
            }

            if (this.featuredMovies != null && this.featuredMovies.length > 0 ) {
                const movieId = this.featuredMovies[ Math.floor(Math.random() * ( this.featuredMovies.length - 1 )) ];
                result = new Movie(await this.cosmosDb.getDocument(movieId));
            }
        } catch (err) {
            res.setHeader("Content-Type", "text/plain");
            resCode = getHttpStatusCode(err);
            this.logger.error(Error(err), "FeaturedControllerException: " + err.toString());
            return res.send(resCode, "FeaturedControllerException");
        }

        return res.send(resCode, result);
    }

    private async getFeaturedMovieList(): Promise<string[]> {
        const movieList: string[] = [];
        const sql = "select m.movieId, m.weight from m where m.type = 'Featured'";

        const movies = await this.cosmosDb.queryDocuments(sql);

        movies.forEach(m => {
            for (let i = 0; i < m.weight; i++) {
                movieList.push(m.movieId);
            }
        });

        // default to The Matrix
        if (movieList.length === 0) {
            movieList.push("tt0133093");
        }

        return movieList;
    }
}
