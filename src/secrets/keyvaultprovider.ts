import * as keyvault from "@azure/keyvault";
import { instanceRoleConstant } from "../config/constants";
import { inject, injectable } from "inversify";
import { ILoggingProvider } from "../logging/iLoggingProvider";
import * as msRestNodeAuth from "@azure/ms-rest-nodeauth";

/**
 * Handles accessing secrets from Azure Key vault.
 */
@injectable()
export class KeyVaultProvider {
    private client: keyvault.KeyVaultClient;

    /**
     * Creates a new instance of the KeyVaultProvider class.
     * @param url The KeyVault testing action URL
     */
    constructor(private url: string,
                @inject("ILoggingProvider") private logger: ILoggingProvider) {
        this.url = url;
        this.logger = logger;
    }

    /**
     * Returns the latest version of the names secret.
     * @param name The name of the secret.
     */
    public async getSecret(name: string): Promise<string> {
        this.logger.Trace("In getSecret from KeyVault");
        if (this.client == null) {
            await this._initialize();
        }

        const secret: string = await this.client.getSecret(this.url, name, "")
            .then((s) => (s.value) as string)
            .catch((e) => {
                if (name === "AppInsightsKey") {
                    this.logger.Trace("App Insights Key not set");
                    return " ";
                } else {
                    this.logger.Error(Error(), "Unable to find secret " + name + " " + e);
                    throw new Error(`Unable to find secret ${name}`);
                }
            });
        this.logger.Trace("Got secret " + name + " from KeyVault");
        return secret;
    }

    /**
     * Initialized the KeyVault client.
     * This is handled in a separate method to avoid calling async operations in the constructor.
     */
    private async _initialize() {

        this.logger.Trace("Initializing KeyVault");

        // if web instance, use app service MSI, otherwise use az login credentials
        const creds: any = process.env[instanceRoleConstant] ?
            await msRestNodeAuth.loginWithAppServiceMSI({ resource: "https://vault.azure.net" }) :
            await msRestNodeAuth.AzureCliCredentials.create({ resource: "https://vault.azure.net" });

        this.client = new keyvault.KeyVaultClient(creds);
    }
}
