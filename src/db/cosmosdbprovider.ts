import { CosmosClient, Container, FeedOptions } from "@azure/cosmos";
import { inject, injectable, named } from "inversify";
import { ILoggingProvider } from "../logging/iLoggingProvider";
import { QueryUtilities } from "../utilities/queryUtilities";
import { Actor } from "../app/models/actor";
import { Movie } from "../app/models/movie";
import { defaultPageSize, maxPageSize } from "../config/constants";

/**
 * Handles executing queries against CosmosDB
 */
@injectable()
export class CosmosDBProvider {

    private cosmosClient: CosmosClient;
    private databaseId: string;
    private containerId: string;
    private cosmosContainer: Container;
    private feedOptions: FeedOptions = { maxItemCount: 2000 };

    private readonly _actorSelect: string = "select m.id, m.partitionKey, m.actorId, m.type, m.name, m.birthYear, m.deathYear, m.profession, m.textSearch, m.movies from m where m.type = 'Actor' ";
    private readonly _actorOrderBy: string = " order by m.name";
    private readonly _movieSelect: string = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie' ";
    private readonly _movieOrderBy: string = " order by m.title";

    /**
     * Creates a new instance of the CosmosDB class.
     * @param url The url of the CosmosDB.
     * @param accessKey The CosmosDB access key (primary of secondary).
     * @param logger Logging provider user for tracing/logging.
     */
    constructor(@inject("string") @named("cosmosDbUrl") private url: string,
                @inject("string") @named("cosmosDbKey") accessKey: string,
                @inject("string") @named("database") database: string,
                @inject("string") @named("collection") collection: string,
                @inject("ILoggingProvider") private logger: ILoggingProvider) {

        this.cosmosClient = new CosmosClient({
            endpoint: url,
            key: accessKey,
        });
        this.url = url;
        this.databaseId = database;
        this.containerId = collection;
        this.logger = logger;
    }

    /**
     * Initialize the Cosmos DB Container.
     * This is handled in a separate method to avoid calling async operations in the constructor.
     */
    public async initialize() {

        this.logger.Trace("Initializing CosmosDB Container");
        this.cosmosContainer = await this.cosmosClient.database(this.databaseId).container(this.containerId);
    }

    /**
     * Runs the given query against CosmosDB.
     * @param query The query to select the documents.
     */
    public async queryDocuments(query: string): Promise<any[]> {
        // Wrap all functionality in a promise to avoid forcing the caller to use callbacks
        return new Promise(async (resolve, reject) => {
            const { resources: queryResults } = await this.cosmosContainer.items.query(query, this.feedOptions).fetchAll();

            resolve(queryResults);
            reject("Cosmos Error");
        });
    }

    /**
     * Retrieves a specific document by Id.
     * @param documentId The id of the document to query.
     */
    public async getDocument(documentId: string): Promise<any> {

        return new Promise(async (resolve, reject) => {
            const { resource: result, statusCode: status } =
                await this.cosmosContainer.item(documentId, QueryUtilities.getPartitionKey(documentId)).read();
            if (status === 200) {
                resolve(result);
            } else {
                reject("Cosmos Error: " + status);
            }
        });
    }

    /**
     * Runs the given query for actors against the database.
     * @param queryParams The query params used to select the actor documents.
     */
    public async queryActors(queryParams: any): Promise<Actor[]> {
        let sql: string = this._actorSelect;

        let pageSize: number = 100;
        let pageNumber: number = 1;
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

        // apply search term if provided in query
        if (actorName) {
            actorName = actorName.trim().toLowerCase().replace("'", "''");

            if (actorName) {
                sql += " and contains(m.textSearch, '" + actorName + "')";
            }
        }

        sql += this._actorOrderBy + offsetLimit;

        return await this.queryDocuments(sql);
    }

    /**
     * Runs the given query for movies against the database.
     * @param queryParams The query params used to select the movie documents.
     */
    public async queryMovies(queryParams: any): Promise<Movie[]> {
        let sql: string = this._movieSelect;

        let pageSize: number = 100;
        let pageNumber: number = 1;
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

        if (queryParams.actorid) {
            actorId = queryParams.actorid.trim().toLowerCase().replace("'", "''");

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
            } catch (e) {
                if (e.toString().includes("404")) {
                    // return empty array if no genre found
                    return [];
                }
            }

            sql += " and array_contains(m.genres, '" + genre + "')";
        }

        sql += this._movieOrderBy + offsetLimit;

        return await this.queryDocuments(sql);
    }
}
