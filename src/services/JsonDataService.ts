// import { CosmosClient, Container, FeedOptions } from "@azure/cosmos";
import { inject, injectable, named } from "inversify";
// import { LogService } from "./LogService";
// import { QueryUtilities } from "../utilities/queryUtilities";
import { Actor, Movie } from "../models";
// import { defaultPageSize, maxPageSize } from "../config/constants";
import { DataService } from ".";

/**
 * Handles executing queries against CosmosDB
 */
@injectable()
export class JsonDataService implements DataService {

    // private cosmosClient: CosmosClient;
    // private cosmosContainer: Container;
    // private feedOptions: FeedOptions = { maxItemCount: 2000 };

    constructor(
        @inject("string") @named("url") private url: string,
        @inject("LogService") private logger: LogService) {

    }

    public async initialize(): Promise<void> {

        this.logger.trace("Initializing Json Data Service");
        try {

        } catch (err) {
            this.logger.error(Error(err), err);
        }
    }

    public async queryDocuments(query: string): Promise<any> {
        try {
            // fetch results
            // return results;
        } catch (err) {
            this.logger.error(Error(err), err);
            throw Error(err);
        }
    }

    public async getDocument(documentId: string): Promise<any> {
        throw Error("Method not yet implemented");
    }
    
    public async queryActors(queryParams: any): Promise<Actor[]> {
        throw Error("Method not yet implemented");
    }
    
    public async queryMovies(queryParams: any): Promise<Movie[]> {
        throw Error("Method not yet implemented");
    }
}