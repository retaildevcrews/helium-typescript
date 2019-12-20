import { inject, injectable } from "inversify";
import { Controller, Get, interfaces } from "inversify-restify-utils";
import * as HttpStatus from "http-status-codes";
import { IDatabaseProvider } from "../../db/idatabaseprovider";
import { ILoggingProvider } from "../../logging/iLoggingProvider";
import { ITelemProvider } from "../../telem/itelemprovider";
import { QueryUtilities } from "../../utilities/queryUtilities";
import { defaultPageSize, maxPageSize, movieDoesNotExistError } from "../../config/constants";
import { Movie } from "../models/movie";

/**
 * controller implementation for our movies endpoint
 */
@Controller("/api/movies")
@injectable()
export class MovieController implements interfaces.Controller {

    private static readonly movieDoesNotExistError: any = "A Movie with that ID does not exist";
    private readonly _movieSelect: string = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie' ";
    private readonly _movieOrderBy: string = " order by m.title";

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
     * /api/movies:
     *   get:
     *     description: Retrieve and return all movies!
     *     tags:
     *       - Movies
     *     parameters:
     *       - name: q
     *         description: The term used to search by movie title (rings)
     *         in: query
     *         schema:
     *           type: string
     *       - name: genre
     *         description: Movies of a genre (Action)
     *         in: query
     *         schema:
     *           type: string
     *       - name: year
     *         description: Get movies by year (2005)
     *         in: query
     *         schema:
     *           type: string
     *       - name: rating
     *         description: Get movies with a rating >= rating (8.5)
     *         in: query
     *         schema:
     *           type: string
     *       - name: topRated
     *         description: Get top rated movies (true)
     *         in: query
     *         schema:
     *           type: string
     *       - name: actorid
     *         description: Get movies by Actor Id (nm0000704)
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
     *         description: JSON of movie objects
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Movie'
     *       default:
     *         description: Unexpected error
     */
    @Get("/")
    public async getAll(req, res) {
        let sql: string = this._movieSelect;
        let orderby: string = this._movieOrderBy;

        let pageSize: number = 100;
        let pageNumber: number = 1;
        let queryParam: string;
        let actorId: string;
        let genre: string;

        let resCode: number = HttpStatus.OK;
        let results: Movie[];

        // handle paging parameters
        // fall back to default values if none provided in query
        pageSize = (req.query.pageSize) ? req.query.pageSize : pageSize;
        pageNumber = (req.query.pageNumber) ? req.query.pageNumber : pageNumber;

        if (pageSize < 1) {
            pageSize = defaultPageSize;
        } else if (pageSize > maxPageSize) {
            pageSize = maxPageSize;
        }

        pageNumber--;

        if (pageNumber < 0) {
            pageNumber = 0;
        }

        let offsetLimit = " offset " + pageNumber + " limit " + pageSize + " ";

        // handle query parameters and build sql query
        if (req.query.q) {
            queryParam = req.query.q.trim().toLowerCase().replace("'", "''");
            if (queryParam) {
                sql += " and contains(m.textSearch, '" + queryParam + "') ";
            }
        }

        if (req.query.year > 0) {
            sql += " and m.year = " + req.query.year + " ";
        }

        if (req.query.rating > 0) {
            sql += " and m.rating >= " + req.query.rating + " ";
        }

        if (req.query.toprated) {
            sql = "select top 10 " + sql.substring(7);
            orderby = " order by m.rating desc";
            offsetLimit = "";
        }

        if (req.query.actorid) {
            actorId = req.query.actorid.trim().toLowerCase().replace("'", "''");

            if (actorId) {
                sql += " and array_contains(m.roles, { actorId: '";
                sql += actorId;
                sql += "' }, true) ";
            }
        }

        if (req.query.genre) {
            const sqlGenreQuery = "select value m.genre from m where m.type = 'Genre' and m.id = '" + req.query.genre.trim().toLowerCase() + "'";
            const genreResults = await this.cosmosDb.queryDocuments(sqlGenreQuery);
            genre = genreResults[0];

            if (genre == null) {
                // return empty array if no movies found
                return res.send(resCode, new Movie[0]());
            }

            sql += " and array_contains(m.genres, '" + genre + "')";
        }

        sql += orderby + offsetLimit;

        // run query, catch errors
        try {
            results = await this.cosmosDb.queryDocuments(sql);
        } catch (err) {
            resCode = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        return res.send(resCode, results);
    }

    /**
     * @swagger
     *
     * /api/movies/{id}:
     *   get:
     *     description: Retrieve and return a single movie by movie ID.
     *     tags:
     *       - Movies
     *     parameters:
     *       - name: id
     *         description: The ID of the movie to look for.
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       '200':
     *         description: The movie object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Movie'
     *       '404':
     *         description: A movie with the specified ID was not found.
     *       default:
     *         description: Unexpected error
     */
    @Get("/:id")
    public async getMovieById(req, res) {
        const movieId: string = req.params.id;

        let resCode: number = HttpStatus.OK;
        let result: Movie;
        try {
            result = await this.cosmosDb.getDocument(
                QueryUtilities.getPartitionKey(movieId),
                movieId);
        } catch (err) {
            if (err.toString().includes("NotFound")) {
                resCode = HttpStatus.NOT_FOUND;
                result = movieDoesNotExistError;
            } else {
                resCode = HttpStatus.INTERNAL_SERVER_ERROR;
                result = err.toString();
            }
        }

        if (!result) {
            resCode = HttpStatus.NOT_FOUND;
            result = movieDoesNotExistError;
        }

        return res.send(resCode, result);
    }
}
