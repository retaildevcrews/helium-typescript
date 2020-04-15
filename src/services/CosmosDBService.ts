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

    // runs the given query against CosmosDB.
    public async queryDocuments(query): Promise<any> {
        const { resources: queryResults } = await this.cosmosContainer.items.query(query, this.feedOptions).fetchAll();
        return queryResults;
    }

    // retrieves a specific document by Id.
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
        const ACTOR_SELECT = "select m.id, m.partitionKey, m.actorId, m.type, m.name, m.birthYear, m.deathYear, m.profession, m.textSearch, m.movies from m where m.type = @actor ";
        const ACTOR_ORDER_BY = " order by m.textSearch, m.actorId";

        let sql = ACTOR_SELECT;

        let pageSize = 100;
        let pageNumber = 1;
        let actorName: string = queryParams.q;

        // handle paging parameters
        // fall back to default values if none provided in query
        pageSize = (queryParams.pageSize) ? queryParams.pageSize : pageSize;
        pageNumber = (queryParams.pageNumber) ? queryParams.pageNumber : pageNumber;

        if (pageSize < 1) {
            pageSize = defaultPageSize;
        } else if (pageSize > maxPageSize) {
            pageSize = maxPageSize;
        }

        pageNumber--;

        if (pageNumber < 0) {
            pageNumber = 0;
        }

        const offsetLimit = " offset " + (pageNumber * pageSize) + " limit " + pageSize + " ";

        let testsql = {
            query: sql,
            parameters: []
        }

        // apply search term if provided in query
        if (actorName) {
            actorName = actorName.trim().toLowerCase().replace("'", "''");

            if (actorName) {
                testsql.parameters.push({name: "@actor", value: "Actor"},{name: "@actorName", value: actorName})
                sql += " and contains(m.textSearch, @actorName)";
                console.log(testsql)
            }
        }

        sql += ACTOR_ORDER_BY + offsetLimit;

        testsql.query = sql

        return await this.queryDocuments(testsql);
    }

    // runs the given query for movies against the database.
    public async queryMovies(queryParams: any): Promise<Movie[]> {
        const MOVIE_SELECT = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie' ";
        const MOVIE_ORDER_BY = " order by m.textSearch, m.movieId";

        let sql: string = MOVIE_SELECT;

        let pageSize = 100;
        let pageNumber = 1;
        let queryParam: string;
        let actorId: string;
        let genre: string;

        // handle paging parameters
        // fall back to default values if none provided in query
        pageSize = (queryParams.pageSize) ? queryParams.pageSize : pageSize;
        pageNumber = (queryParams.pageNumber) ? queryParams.pageNumber : pageNumber;

        if (pageSize < 1) {
            pageSize = defaultPageSize;
        } else if (pageSize > maxPageSize) {
            pageSize = maxPageSize;
        }

        pageNumber--;

        if (pageNumber < 0) {
            pageNumber = 0;
        }

        const offsetLimit = " offset " + (pageNumber * pageSize) + " limit " + pageSize + " ";

        // handle query parameters and build sql query
        if (queryParams.q) {
            queryParam = queryParams.q.trim().toLowerCase().replace("'", "''");
            if (queryParam) {
                sql += " and contains(m.textSearch, '" + queryParam + "') ";
            }
        }

        if (queryParams.year > 0) {
            sql += " and m.year = " + queryParams.year + " ";
        }

        if (queryParams.rating > 0) {
            sql += " and m.rating >= " + queryParams.rating + " ";
        }

        if (queryParams.actorId) {
            actorId = queryParams.actorId.trim().toLowerCase().replace("'", "''");

            if (actorId) {
                sql += " and array_contains(m.roles, { actorId: '";
                sql += actorId;
                sql += "' }, true) ";
            }
        }

        if (queryParams.genre) {
            let genreResult: any;

            try {
                genreResult = await this.getDocument(queryParams.genre.trim().toLowerCase());
                genre = genreResult.genre;
            } catch (err) {
                if (err.toString().includes("404")) {
                    // return empty array if no genre found
                    return [];
                }
            }

            sql += " and array_contains(m.genres, '" + genre + "')";
        }

        sql += MOVIE_ORDER_BY + offsetLimit;

        return await this.queryDocuments(sql);
    }
}
