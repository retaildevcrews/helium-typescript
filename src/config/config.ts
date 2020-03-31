import { LogService } from "../services/LogService";
import { KeyVaultService } from "../services/KeyVaultService";
import {
    cosmosCollection, cosmosDatabase, cosmosKey, cosmosUrl,
    appInsightsKey, portConstant,
} from "./constants";

// gets configuration details needed to connect to KeyVault, CosmosDB, and AppInsights.
export async function getConfigValues(
    keyVaultUrl: string,
    authType: string,
    log: LogService): Promise<ConfigValues> {

    // use default port from constants
    const port = portConstant;

    // cosmos db secrets come from KeyVault
    let cosmosDbKey: string;
    let cosmosDbUrl: string;
    let database: string;
    let collection: string;
    let insightsKey: string;

    let keyvault: KeyVaultService;
    try {
        keyvault = new KeyVaultService(keyVaultUrl, authType, log);
        await keyvault.connect();
    } catch (err) {
        log.error(Error(), "Key Vault Exception: " + err);
        return;
    }

    // get Cosmos DB related secrets
    try {
        cosmosDbKey = await keyvault.getSecret(cosmosKey);
        cosmosDbUrl = await keyvault.getSecret(cosmosUrl);
        database = await keyvault.getSecret(cosmosDatabase);
        collection = await keyvault.getSecret(cosmosCollection);
    } catch {
        log.error(Error(), "Failed to get required Cosmos DB secrets from KeyVault");
        return;
    }

    // get optional App Insights Key
    try {
        insightsKey = await keyvault.getSecret(appInsightsKey);
    } catch {
        log.trace("Application Insights key not set.");
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

export interface ConfigValues {
    port: string;
    cosmosDbKey: string;
    cosmosDbUrl: string;
    database: string;
    collection: string;
    insightsKey: string;
}
