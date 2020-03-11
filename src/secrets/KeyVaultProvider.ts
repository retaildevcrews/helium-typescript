import { SecretClient } from "@azure/keyvault-secrets";
import { inject, injectable } from "inversify";
import { LoggingProvider } from "../logging/LoggingProvider";
import * as msRestNodeAuth from "@azure/ms-rest-nodeauth";

/**
 * Handles accessing secrets from Azure Key vault.
 */
@injectable()
export class KeyVaultProvider {
    private client: SecretClient;

    /**
     * Creates a new instance of the KeyVaultProvider class.
     * @param url The KeyVault testing action URL
     */
    constructor(private url: string, private authType: string, @inject("LoggingProvider") private logger: LoggingProvider) {
    }

    /**
     * Returns the latest version of the names secret.
     * @param name The name of the secret.
     */
    public async getSecret(name: string): Promise<string> {
        if (this.client == null) {
            await this._initialize();
        }

        try {
            const { value: secret } = await this.client.getSecret(name);
            return secret as string;
        } catch (err) {
            if (name === "AppInsightsKey") {
                this.logger.trace("App Insights Key not set");
                return " ";
            } else {
                this.logger.error(Error(), "Unable to find secret " + name + " " + err);
                throw new Error(`Unable to find secret ${name}`);
            }
        }
    }

    /**
     * Initialized the KeyVault client.
     * This is handled in a separate method to avoid calling async operations in the constructor.
     */
    private async _initialize() {

        // Use specified authentication type (either MSI or CLI)
        const creds: any = this.authType === "MSI" ?
            await msRestNodeAuth.loginWithAppServiceMSI({ resource: "https://vault.azure.net" }) :
            await msRestNodeAuth.AzureCliCredentials.create({ resource: "https://vault.azure.net" });

        this.client = new SecretClient(this.url, creds);
    }
}
