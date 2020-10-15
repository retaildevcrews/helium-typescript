import { SecretClient } from "@azure/keyvault-secrets";
import { inject, injectable } from "inversify";
import { LogService } from "./LogService";
import azureIdentity = require("@azure/identity");
import { cosmosUrl } from "../config/constants";

// handles accessing secrets from Azure Key Vault.
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
            throw new Error(`Unable to find secret ${name}`);
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
                // use specified authentication type (either MI or CLI)
                const creds: any = this.authType === "MI" ?
                    new azureIdentity.ManagedIdentityCredential() :
                    new azureIdentity.AzureCliCredential();

                this.client = new SecretClient(this.url, creds);

                // test getSecret to validate successful Key Vault connection
                await this.getSecret(cosmosUrl);
                return;
            } catch (e) {
                retries++;
                if (this.authType === "MI" && retries < MAX_RETRIES) {
                    this.logger.info("Key Vault: Retry");
                    // wait 1 second and retry (continue while loop)
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    throw new Error("Failed to connect to Key Vault with MI");
                }
            }
        }
    }
}
