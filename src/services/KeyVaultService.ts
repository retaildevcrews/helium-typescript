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

    // Ready will resolve when the KeyVaultProvider has been initialized and is ready to use
    public ready: Promise<void>;

    /**
     * Creates a new instance of the KeyVaultService class.
     * @param url The KeyVault testing action URL
     */
    constructor(private url: string, private authType: string, @inject("LogService") private logger: LogService) {
        try {
            this.ready = this.initialize();
        }
        catch (e) {
            const errorText = "An error occurred attempting to connect to the Azure Key vault.";
            this.logger.error(e, errorText);
            throw new Error(errorText);
        }
    }

    /**
     * Returns the latest version of the name's secret.
     * @param name The name of the secret.
     */
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

    private async initialize() {
        const timeout = Date.now() + 90000;

        while (true){
            try {
                // Use specified authentication type (either MSI or CLI)
                const creds: any = this.authType === "MSI" ?
                    new azureIdentity.ManagedIdentityCredential() :
                    await msRestNodeAuth.AzureCliCredentials.create({ resource: "https://vault.azure.net" });

                this.client = new SecretClient(this.url, creds);

                // Test getSecret to validate successful Key Vault connection
                await this.getSecret(cosmosUrl);
                return;
            } catch (e) {
                if (Date.now() <= timeout && this.authType === "MSI") {
                    this.logger.trace("KeyVault: Retry");
                    // Wait 1 second and retry (continue while loop) 
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    throw new Error(e);
                }
            }
        }
    }
}
