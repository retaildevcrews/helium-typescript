import { ILoggingProvider } from "../logging/iLoggingProvider";
import { KeyVaultProvider } from "../secrets/keyvaultprovider";
import {
    cosmosCollection, cosmosDatabase, cosmosKey, cosmosUrl,
    appInsightsKey, portConstant,
} from "./constants";

// Gets configuration details needed to connect to KeyVault, CosmosDB, and AppInsights.
export async function getConfigValues(
    keyVaultUrl: string,
    authType: string,
    log: ILoggingProvider): Promise<{
        port: string, cosmosDbKey: string, cosmosDbUrl: string,
        database: string, collection: string, insightsKey: string,
    }> {

    // use default port from constants
    const port = portConstant;

    // cosmosDbKey comes from KeyVault
    let cosmosDbKey: string;
    let cosmosDbUrl: string;
    let database: string;
    let collection: string;
    let insightsKey: string;

    const keyvault: KeyVaultProvider = new KeyVaultProvider(keyVaultUrl, authType, log);

    // get Cosmos DB related secrets
    try {
        cosmosDbKey = await keyvault.getSecret(cosmosKey);

        cosmosDbUrl = await keyvault.getSecret(cosmosUrl);

        database = await keyvault.getSecret(cosmosDatabase);

        collection = await keyvault.getSecret(cosmosCollection);
    } catch {
        log.Error(Error(), "Failed to get required Cosmos DB secrets from KeyVault");
        process.exit(1);
    }

    // get optional App Insights Key
    try {
        insightsKey = await keyvault.getSecret(appInsightsKey);
    } catch {
        log.Trace("Application Insights key not set.");
    }

    return {
        port,
        cosmosDbKey,
        cosmosDbUrl,
        database,
        collection,
        insightsKey,
    };
}
