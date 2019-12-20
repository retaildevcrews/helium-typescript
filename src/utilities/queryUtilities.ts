/**
 * Utilities for querying from CosmosDB.
 */

export class QueryUtilities {

    // Compute the partition key based on the movieId or actorId
    // For this sample, the partition key is mod 10 of the numeric portion of the id
    public static getPartitionKey(id: string): string {
        let idInt: number = 0;

        if ( id.length > 5 && (id.startsWith("tt") || id.startsWith("nm"))) {
            idInt = parseInt(id.substring(2), 10);
        }

        return isNaN(idInt) ? "" : (idInt % 10).toString();
    }
}
