export interface DataService {
    // connect to the data service
    connect();

    // runs the given query against the data service
    queryDocuments(query: any): Promise<any[]>;

    // retrieves a document by id and partition key
    getDocument(documentId: string, partitionKey: string): Promise<any>;

    // retrieves an actor by id
    getActorById(actorId: string): Promise<any>;

    // retrieves an movie by id
    getMovieById(movieId: string): Promise<any>;

    // runs the given query for actors against the database
    queryActors(queryParams: any): Promise<any[]>;

    // runs the given query for movies against the database
    queryMovies(queryParams: any): Promise<any[]>;
}
