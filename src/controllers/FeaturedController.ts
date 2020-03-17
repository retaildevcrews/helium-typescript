import { inject, injectable } from "inversify";
import { Controller, Get, interfaces } from "inversify-restify-utils";
import * as HttpStatus from "http-status-codes";
import { DataService } from "../services/DataService";
import { LogService } from "../services/LogService";
import { Movie } from "../models/Movie";

/**
 * controller implementation for our featured movie endpoint
 */
@Controller("/api/featured")
@injectable()
export class FeaturedController implements interfaces.Controller {

    private featuredMovies: string[];

    constructor(@inject("DataService") private cosmosDb: DataService, @inject("LogService") private logger: LogService) {
    
    }

    /**
     * @swagger
     *
     * /api/featured/movie:
     *   get:
     *     description: Returns a random movie from the featured movie list as a JSON Movie
     *     tags:
     *       - Featured
     *     responses:
     *       '200':
     *         description: JSON movie object
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Movie'
     *       default:
     *         description: Unexpected error
     */
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
                result = await this.cosmosDb.getDocument(movieId);
            }
        } catch (err) {
            if (err.toString().includes("NotFound")) {
                resCode = HttpStatus.NOT_FOUND;
            } else {
                resCode = HttpStatus.INTERNAL_SERVER_ERROR;
            }
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
