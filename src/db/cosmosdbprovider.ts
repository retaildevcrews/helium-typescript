import { CosmosClient, Container, FeedOptions } from "@azure/cosmos";
import { inject, injectable, named } from "inversify";
import { ILoggingProvider } from "../logging/iLoggingProvider";
import { QueryUtilities } from "../utilities/queryUtilities";
import { Actor } from "../app/models/actor";
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

        const offsetLimit = " offset " + pageNumber + " limit " + pageSize + " ";

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
}
