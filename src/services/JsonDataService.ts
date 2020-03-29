import { inject, injectable, named } from "inversify";
import { Actor, Movie } from "../models";
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
            // TODO: fetch results
            // TODO: return results;
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
