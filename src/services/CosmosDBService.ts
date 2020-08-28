import { CosmosClient, Container, FeedOptions } from "@azure/cosmos";
import { inject, injectable } from "inversify";
import { LogService } from "./LogService";
import { Actor, Movie } from "../models";
import { defaultPageSize } from "../config/constants";
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
        this.cosmosClient = new CosmosClient({ endpoint: config.cosmosDbUrl, key: config.cosmosDbKey, consistencyLevel: "Session" });
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

    // retrieves a specific document by id
    public async getDocument(documentId: string, partitionKey: string): Promise<any> {
        const { resource: result, statusCode: status }
            = await this.cosmosContainer.item(documentId, partitionKey).read();
        if (status === 200) {
            return result;
        }

        // 404 not found does not throw an error
        throw Error("Cosmos Error: " + status);
    }

    // retrieves an actor by actor id
    public async getActorById(actorId: string): Promise<Actor> {
        return await this.getDocument(actorId, Actor.computePartitionKey(actorId))
    }
    
    // retrieves a movie by movie id
    public async getMovieById(movieId: string): Promise<Movie> {
        return await this.getDocument(movieId, Movie.computePartitionKey(movieId))
    }

    // runs the given query for actors against the database.
    public async queryActors(queryParams: any): Promise<Actor[]> {
        const SELECT = "select m.id, m.partitionKey, m.actorId, m.type, m.name, m.birthYear, m.deathYear, m.profession, m.textSearch, m.movies from m where m.type = 'Actor' ";
        const ORDER_BY = " order by m.textSearch, m.actorId";
        const parameters = [];

        let sql = SELECT;

        let actorName: string = queryParams.q;

        const { size: pageSize, number: pageNumber } = this.setPagingParameters(parseInt(queryParams.pageSize, 10), parseInt(queryParams.pageNumber, 10));

        const offsetLimit = " offset @offset limit @limit ";
        parameters.push({name: "@offset", value: (pageNumber * pageSize)});
        parameters.push({name: "@limit", value: pageSize});

        // apply search term if provided in query
        if (actorName) {
            actorName = actorName.trim().toLowerCase().replace("'", "''");

            if (actorName) {
                sql += " and contains(m.textSearch, @actorName)";
                parameters.push({name: "@actorName", value: actorName});
            }
        }

        sql += ORDER_BY + offsetLimit;

        return await this.queryDocuments({ query: sql, parameters: parameters });
    }

    // runs the given query for movies against the database.
    public async queryMovies(queryParams: any): Promise<Movie[]> {
        const SELECT = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie' ";
        const ORDER_BY = " order by m.textSearch, m.movieId";
        const parameters = [];

        let sql: string = SELECT;

        let queryParam: string;
        let actorId: string;
        let genre: string;

        const { size: pageSize, number: pageNumber } = this.setPagingParameters(parseInt(queryParams.pageSize, 10), parseInt(queryParams.pageNumber, 10));
        const offsetLimit = " offset @offset limit @limit ";
        parameters.push({name: "@offset", value: (pageNumber * pageSize)});
        parameters.push({name: "@limit", value: pageSize});

        // handle query parameters and build sql query
        if (queryParams.q) {
            queryParam = queryParams.q.trim().toLowerCase().replace("'", "''");
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
                sql += " and array_contains(m.roles, { actorId: @actorId }, true) ";
                parameters.push({ name: "@actorId", value: actorId });
            }
        }

        if (queryParams.genre) {
            genre = queryParams.genre.trim();
            sql += " and contains(m.genreSearch, @genre, true)";
            parameters.push({name: "@genre", value: "|" + genre + "|"});
        }

        sql += ORDER_BY + offsetLimit;

        return await this.queryDocuments({ query: sql, parameters: parameters });
    }

    // sets the default paging values if none are provided, and updates to 0 base index.
    setPagingParameters(size, number) {
        // default values
        size = size || defaultPageSize;
        number = number || 1;

        // make sure number is at least 0
        number = Math.max(--number, 0);

        return { size, number };
    }

}
