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

    // ready will resolve when the KeyVaultProvider has been initialized and is ready to use
    public ready: Promise<void>;

    /**
     * Creates a new instance of the KeyVaultProvider class.
     * @param url The KeyVault testing action URL
     */
    constructor(private url: string,
        private authType: string,
        @inject("LoggingProvider") private logger: LoggingProvider) {
        this.url = url;
        this.authType = authType;
        this.logger = logger;

        try {
            this.ready = this.initialize();
        }
        catch (e) {
            const errorText = "An error occurred attempting to connect to the Azure Key vault.";
            this.logger.Error(e, errorText);
            throw new Error(errorText);
        }
    }

    /**
     * Returns the latest version of the names secret.
     * @param name The name of the secret.
     */
    public async getSecret(name: string): Promise<string> {
        await this.ready;

        try {
            const { value: secret } = await this.client.getSecret(name);
            return secret as string;
        } catch (err) {
            if (name === "AppInsightsKey") {
                this.logger.Trace("App Insights Key not set");
                return " ";
            } else {
                this.logger.Error(Error(), "Unable to find secret " + name + " " + err);
                throw new Error(`Unable to find secret ${name}`);
            }
        }
    }

    private async initialize() {

        // Use specified authentication type (either MSI or CLI)
        const creds: any = this.authType === "MSI" ?
            await msRestNodeAuth.loginWithAppServiceMSI({ resource: "https://vault.azure.net" }) :
            await msRestNodeAuth.AzureCliCredentials.create({ resource: "https://vault.azure.net" });

        this.client = new SecretClient(this.url, creds);
        return;
    }
}
