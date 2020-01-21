import { inject, injectable } from "inversify";
import { Controller, Get, interfaces } from "inversify-restify-utils";
import * as HttpStatus from "http-status-codes";
import { IDatabaseProvider } from "../../db/idatabaseprovider";
import { ILoggingProvider } from "../../logging/iLoggingProvider";
import { ITelemProvider } from "../../telem/itelemprovider";
import { Movie } from "../models/movie";

/**
 * controller implementation for our featured movie endpoint
 */
@Controller("/api/featured")
@injectable()
export class FeaturedController implements interfaces.Controller {

    private _featuredMovies: string[];

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
            if ( this._featuredMovies == null || this._featuredMovies.length === 0 ) {
                this._featuredMovies = await this.getFeaturedMovieListAsync();
            }

            if (this._featuredMovies != null && this._featuredMovies.length > 0 ) {
                const movieId = this._featuredMovies[ Math.floor(Math.random() * ( this._featuredMovies.length - 1 )) ];
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

    private async getFeaturedMovieListAsync(): Promise<string[]> {
        const movieList: string[] = [];
        const sql = "select m.movieId, m.weight from m where m.type = 'Featured' order by m.weight desc";

        const result = await this.cosmosDb.queryDocuments(sql);

        result.forEach( (movie) => {
            for (let i = 0; i < movie.weight; i++) {
                movieList.push(movie.movieId);
            }
        });

        // default to The Matrix
        if ( movieList.length === 0 ) {
            movieList.push("tt0133093");
        }

        return movieList;
    }
}
