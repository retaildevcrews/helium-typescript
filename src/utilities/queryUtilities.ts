/**
 * Utilities for querying from CosmosDB.
 */
export class QueryUtilities {

    // Compute the partition key based on the movieId or actorId
    // For this sample, the partition key is mod 10 of the numeric portion of the id
    // Returns "0" by default
    public static getPartitionKey(id: string): string {
        let idInt = 0;

        if ( id.length > 5 && (id.startsWith("tt") || id.startsWith("nm"))) {
            idInt = parseInt(id.substring(2), 10);
            return isNaN(idInt) ? "0" : (idInt % 10).toString();
        }

        return idInt.toString();
    }
}
