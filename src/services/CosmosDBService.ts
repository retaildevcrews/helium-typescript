import { CosmosClient, Container, FeedOptions } from "@azure/cosmos";
import { inject, injectable } from "inversify";
import { LogService } from "./LogService";
import { QueryUtilities } from "../utilities/queryUtilities";
import { Actor, Movie } from "../models";
import { defaultPageSize, maxPageSize } from "../config/constants";
import { DataService } from "./DataService";
import { ConfigValues } from "../config/ConfigValues";

// handles executing queries against CosmosDB
@injectable()
export class CosmosDBService implements DataService {

    private cosmosClient: CosmosClient;
    private cosmosContainer: Container;
    private feedOptions: FeedOptions = { maxItemCount: 1000, forceQueryPlan: true };

    // creates a new instance of the CosmosDB class.
    constructor(@inject("ConfigValues") private config: ConfigValues, @inject("LogService") private logger: LogService) {
        this.cosmosClient = new CosmosClient({ endpoint: config.cosmosDbUrl, key: config.cosmosDbKey });
    }

    // connect to the Cosmos DB Container.
    public async connect() {
        this.logger.info("Connecting to CosmosDB Container");
        this.cosmosContainer = await this.cosmosClient.database(this.config.database).container(this.config.collection);
    }

<<<<<<< HEAD
    // runs the given query against CosmosDB
    public async queryDocuments(query: string): Promise<any> {
=======
    // runs the given query against CosmosDB.
    public async queryDocuments(query): Promise<any> {
>>>>>>> master
        const { resources: queryResults } = await this.cosmosContainer.items.query(query, this.feedOptions).fetchAll();
        return queryResults;
    }

    // retrieves a specific document by id
    public async getDocument(documentId: string): Promise<any> {
        const { resource: result, statusCode: status }
            = await this.cosmosContainer.item(documentId, QueryUtilities.getPartitionKey(documentId)).read();
        if (status === 200) {
            return result;
        }

        // 404 not found does not throw an error
        throw Error("Cosmos Error: " + status);
    }

    // runs the given query for actors against the database.
    public async queryActors(queryParams: any): Promise<Actor[]> {
        const ACTOR_SELECT = "select m.id, m.partitionKey, m.actorId, m.type, m.name, m.birthYear, m.deathYear, m.profession, m.textSearch, m.movies from m where m.type = 'Actor' ";
        const ACTOR_ORDER_BY = " order by m.textSearch, m.actorId";

        const parameters = [];

<<<<<<< HEAD
=======
        let sql = ACTOR_SELECT;
        let pageSize = 100;
        let pageNumber = 1;
>>>>>>> master
        let actorName: string = queryParams.q;

        const { size: pageSize, number: pageNumber } = this.conditionPages(queryParams.pageSize, queryParams.pageNumber);

        const offsetLimit = " offset " + (pageNumber * pageSize) + " limit " + pageSize + " ";

        // apply search term if provided in query
        if (actorName) {
            actorName = actorName.trim().toLowerCase().replace("'", "''");
<<<<<<< HEAD
            if (actorName) sql += " and contains(m.textSearch, '" + actorName + "')";
=======

            if (actorName) {
                sql += " and contains(m.textSearch, @actorName)";
                parameters.push({name: "@actorName", value: actorName});
            }
>>>>>>> master
        }

        sql += ACTOR_ORDER_BY + offsetLimit;

        return await this.queryDocuments({ query: sql, parameters: parameters });
    }

    // runs the given query for movies against the database.
    public async queryMovies(queryParams: any): Promise<Movie[]> {
        const SELECT = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie' ";
        const ORDER_BY = " order by m.textSearch, m.movieId";

<<<<<<< HEAD
        let sql: string = SELECT;

=======
        const parameters = [];

        let sql: string = MOVIE_SELECT;
        let pageSize = 100;
        let pageNumber = 1;
>>>>>>> master
        let queryParam: string;
        let actorId: string;
        let genre: string;

        const { size: pageSize, number: pageNumber } = this.conditionPages(queryParams.pageSize, queryParams.pageNumber);
        const offsetLimit = ` offset ${pageNumber * pageSize} limit ${pageSize} `;

        // handle query parameters and build sql query
        if (queryParams.q) {
            queryParam = queryParams.q.trim().toLowerCase().replace("'", "''");
<<<<<<< HEAD
            if (queryParam) sql += ` and contains(m.textSearch, '${queryParam}') `;
        }

        if (queryParams.year > 0) sql += ` and m.year = ${queryParams.year} `;
        if (queryParams.rating > 0) sql += ` and m.rating >= ${queryParams.rating} `;

        if (queryParams.actorId) {
            actorId = queryParams.actorId.trim().toLowerCase().replace("'", "''");
            if (actorId) sql += ` and array_contains(m.roles, { actorId: '${actorId}' }, true) `;
=======
            if (queryParam) {
                sql += " and contains(m.textSearch, @queryParam) ";
                parameters.push({ name: "@queryParam"  as string, value: queryParam as string|number });
            }
        }

        if (queryParams.year > 0) {
            sql += " and m.year = @year ";
            parameters.push({ name: "@year", value: Number(queryParams.year) });
        }

        if (queryParams.rating > 0) {
            sql += " and m.rating >= @rating ";
            parameters.push({ name: "@rating", value: Number(queryParams.rating) });
        }

        if (queryParams.actorId) {
            actorId = queryParams.actorId.trim().toLowerCase().replace("'", "''");

            if (actorId) {
                sql += " and array_contains(m.roles, { actorId: ";
                sql += "@actorId";
                sql += " }, true) ";
                parameters.push({ name: "@actorId", value: actorId });
            }
>>>>>>> master
        }

        if (queryParams.genre) {
            let genreResult: any;

            try {
                genreResult = await this.getDocument(queryParams.genre.trim().toLowerCase());
                genre = genreResult.genre;
            } catch (err) {
                // return empty array if no genre found
                if (err.toString().includes("404")) return [];
            }

<<<<<<< HEAD
            sql += ` and array_contains(m.genres, '${genre}')`;
=======
            sql += " and array_contains(m.genres, @genre)";
            parameters.push({name: "@genre", value: genre});
>>>>>>> master
        }

        sql += ORDER_BY + offsetLimit;

        return await this.queryDocuments({ query: sql, parameters: parameters });
    }

    conditionPages(size, number) {
        // default values
        size = size || defaultPageSize;
        number = number || 1;

        // make sure size is between 1 and the max
        size = Math.max(1, size);
        size = Math.min(maxPageSize, size);

        // make sure number is at least 0
        number = Math.max(number--, 0);

        return { size, number };
    }

}
