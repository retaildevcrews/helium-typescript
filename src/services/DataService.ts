export interface DataService {
    // connect to the data service
    connect();

    // runs the given query against the data service
    queryDocuments(query: string): Promise<any[]>;

    // retrieves a document by id
    getDocument(documentId: string): Promise<any>;

    // runs the given query for actors against the database
    queryActors(queryParams: any): Promise<any[]>;

    // runs the given query for movies against the database
    queryMovies(queryParams: any): Promise<any[]>;
}
