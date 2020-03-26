// import { CosmosClient, Container, FeedOptions } from "@azure/cosmos";
import { inject, injectable, named } from "inversify";
// import { LogService } from "./LogService";
// import { QueryUtilities } from "../utilities/queryUtilities";
import { Actor, Movie } from "../models";
// import { defaultPageSize, maxPageSize } from "../config/constants";
import { DataService, LogService } from ".";

/**
 * Handles executing queries against CosmosDB
 */
@injectable()
export class JsonDataService implements DataService {

    ready: Promise<void>;

    constructor(
        @inject("string") @named("url") private url: string,
        @inject("LogService") private logger: LogService) {
        this.ready = this.initialize();
    }

    public async initialize(): Promise<void> {

        this.logger.trace("Initializing Json Data Service");
        try {

        } catch (err) {
            this.logger.error(Error(err), err);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async queryDocuments(query: string): Promise<any> {
        try {
            // fetch results
            // return results;
        } catch (err) {
            this.logger.error(Error(err), err);
            throw Error(err);
        }
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async getDocument(documentId: string): Promise<any> {
        throw Error("Method not yet implemented");
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async queryActors(queryParams: any): Promise<Actor[]> {
        throw Error("Method not yet implemented");
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async queryMovies(queryParams: any): Promise<Movie[]> {
        throw Error("Method not yet implemented");
    }
}
