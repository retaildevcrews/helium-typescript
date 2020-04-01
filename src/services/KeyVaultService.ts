import { SecretClient } from "@azure/keyvault-secrets";
import { inject, injectable } from "inversify";
import { LogService } from "./LogService";
import * as msRestNodeAuth from "@azure/ms-rest-nodeauth";
import azureIdentity = require("@azure/identity");
import { cosmosUrl } from "../config/constants";

// handles accessing secrets from Azure Key vault.
@injectable()
export class KeyVaultService {
    private client: SecretClient;

    // creates a new instance of the KeyVaultService class
    constructor(private url: string, private authType: string, @inject("LogService") private logger: LogService) {}

    // returns the latest version of the name's secret.
    public async getSecret(name: string): Promise<string> {

        try {
            const { value: secret } = await this.client.getSecret(name);
            return secret as string;
        } catch (e) {
            if (name === "AppInsightsKey") {
                this.logger.trace("App Insights Key not set");
                return " ";
            } else {
                throw new Error(`Unable to find secret ${name}`);
            }
        }
    }

    // connect to the Key Vault client
    // AKS can take longer to spin up pod identity for the first pod, so
    //      we retry for up to 90 seconds
    public async connect() {
        // retry managed identity for 90 seconds
        const MAX_RETRIES = 90;

        let retries = 0;
        while (retries < MAX_RETRIES){
            try {
                // use specified authentication type (either MSI or CLI)
                const creds: any = this.authType === "MSI" ?
                    new azureIdentity.ManagedIdentityCredential() :
                    await msRestNodeAuth.AzureCliCredentials.create({ resource: "https://vault.azure.net" });

                this.client = new SecretClient(this.url, creds);

                // test getSecret to validate successful Key Vault connection
                await this.getSecret(cosmosUrl);
                return;
            } catch (e) {
                if (this.authType === "MSI") {
                    this.logger.trace("KeyVault: Retry");
                    // wait 1 second and retry (continue while loop)
                    retries++;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    throw new Error(e);
                }
            }
        }
    }
}
