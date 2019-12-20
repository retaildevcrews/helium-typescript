import { ILoggingProvider } from "../logging/iLoggingProvider";
import { KeyVaultProvider } from "../secrets/keyvaultprovider";
import {
    keyVaultName, cosmosCollection, cosmosDatabase, cosmosKey, cosmosUrl,
    appInsightsKey, portConstant,
} from "./constants";

// Gets configuration details needed to connect to KeyVault, CosmosDB, and AppInsights.
export async function getConfigValues(
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
    // insightsKey comes from KeyVault
    let insightsKey: string;

    log.Trace("Getting configuration values");

    let keyVaultUrl: string = process.env[keyVaultName];
    if (keyVaultUrl && !keyVaultUrl.startsWith("https://")) {
        keyVaultUrl = "https://" + keyVaultUrl + ".vault.azure.net/";
    }

    if (!keyVaultUrl) {
        log.Trace("Key Vault name missing: " + keyVaultUrl);
        process.exit(1);
    }

    log.Trace("Trying to read from keyvault " + keyVaultUrl);
    const keyvault: KeyVaultProvider = new KeyVaultProvider(keyVaultUrl, log);
    try {
        cosmosDbKey = await keyvault.getSecret(cosmosKey);
        log.Trace("Got cosmosDBKey from keyvault");

        insightsKey = await keyvault.getSecret(appInsightsKey);
        log.Trace("Got AppInsightsInstrumentationKey from keyvault");

        cosmosDbUrl = await keyvault.getSecret(cosmosUrl);
        log.Trace("Got CosmosUrl from keyvault");

        database = await keyvault.getSecret(cosmosDatabase);
        log.Trace("Got CosmosDatabase from keyvault");

        collection = await keyvault.getSecret(cosmosCollection);
        log.Trace("Got CosmosCollection from keyvault");

    } catch {
        log.Error(Error(), "Failed to get secrets from KeyVault. Falling back to env vars for secrets");
    }

    // try {
    //     const cosmosProvider: CosmosDBProvider = new CosmosDBProvider(cosmosDbUrl, cosmosDbKey, database, collection, log);
    //     cosmosProvider.initialize();
    // } catch (e) {
    //     log.Error(Error(), "Failed to initialize cosmos connection");
    // }

    log.Trace("Returning config values");
    return {
        port,
        cosmosDbKey,
        cosmosDbUrl,
        database,
        collection,
        insightsKey,
    };
}
