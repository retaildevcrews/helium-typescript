export interface DatabaseProvider {
    /**
     * Initialize the Cosmos DB Container.
     * This is handled in a separate method to avoid calling async operations in the constructor.
     */
    initialize();

    /**
     * Runs the given query against CosmosDB.
     * @param query The query to select the documents.
     */
    queryDocuments(query: string): Promise<any[]>;

    /**
     * Retrieves a specific document by Id.
     * @param documentId The id of the document to query.
     */
    getDocument(documentId: string): Promise<any>;

    /**
     * Runs the given query for actors against the database.
     * @param queryParams The query params used to select the actor documents.
     */
    queryActors(queryParams: any): Promise<any[]>;

    /**
     * Runs the given query for movies against the database.
     * @param queryParams The query params used to select the movie documents.
     */
    queryMovies(queryParams: any): Promise<any[]>;
}
