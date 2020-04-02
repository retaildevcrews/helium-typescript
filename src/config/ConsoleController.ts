import "reflect-metadata";
import { LogService } from "../services/LogService";
import { KeyVaultService } from "../services/KeyVaultService";
import commandLineArgs = require("command-line-args");
import commandLineUsage = require("command-line-usage");
import { sections } from "./cli-config";
import { cosmosCollection, cosmosDatabase, cosmosKey, cosmosUrl, appInsightsKey, portConstant, version } from "./constants";
import { ConfigValues } from "./ConfigValues";

export class ConsoleController {
    constructor(private logService: LogService) { }

    // capture cli arguments and fetch application configuration
    async run() {
        const { validationMessages, values } = this.parseArguments();

        // handle --help
        if (values.help) this.showHelp();

        // handle invalid values
        else if (validationMessages.length > 0) {
            validationMessages.forEach(m => console.error(m));
            this.showHelp();
            process.exit();
        }

        // get config values
        const config = await this.getConfigValues(values["keyvault-name"], values["auth-type"]);

        // dry run or return
        if (values["dry-run"]) {
            this.dryRun(config, values);
            process.exit();
        }
        return config;
    }

    public parseArguments() {
        const options: OptionDefinition[] = sections.find(s => s.header == "Options").optionList;

        // environment variables
        const env = {
            "keyvault-name": process.env.KEYVAULT_NAME,
            "auth-type": process.env.AUTH_TYPE
        }

        // command line arguments
        const args = commandLineArgs(options);

        // compose the two
        const values = { ...env, ...args };

        const validationMessages = [];

        // check required arguments
        options.filter(o => o.required && !values[o.name])
            .forEach(o => validationMessages.push(`Missing ${o.name} argument`));

        // check validation patterns
        options.filter(o => o.validationPattern && !o.validationPattern.test(values[o.name]))
            .forEach(o => validationMessages.push(`Value for ${o.name} argument is not valid`));

        // expand keyvault URL
        if (values["keyvault-name"] && !values["keyvault-name"].startsWith("https://"))
            values["keyvault-name"] = `https://${values["keyvault-name"]}.vault.azure.net`;

        return { validationMessages: validationMessages, values: values };
    }

    showHelp(message?: string) {
        if (message) console.log(message);
        console.log(commandLineUsage(sections));
    }

    dryRun(config, values) {
        console.log(`
            Version                       ${version}
            Keyvault                      ${values["keyvault-name"]}
            Auth Type                     ${values["auth-type"]}
            Cosmos Server                 ${config.cosmosDbUrl}
            Cosmos Key                    ...${config.cosmosDbKey.slice(-4)}
            Cosmos Database               ${config.database}
            Cosmos Collection             ${config.collection}
            App Insights Key              ${config.insightsKey}
        `);
    }

    async getConfigValues(keyVaultUrl: string, authType: string): Promise<ConfigValues> {

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
            keyvault = new KeyVaultService(keyVaultUrl, authType, this.logService);
            await keyvault.connect();            
        } catch (err) {
            this.logService.error(Error(), "Key Vault Exception: " + err);
            return;
        }

        // get Cosmos DB related secrets
        try {
            cosmosDbKey = await keyvault.getSecret(cosmosKey);
            cosmosDbUrl = await keyvault.getSecret(cosmosUrl);
            database = await keyvault.getSecret(cosmosDatabase);
            collection = await keyvault.getSecret(cosmosCollection);
        } catch {
            this.logService.error(Error(), "Failed to get required Cosmos DB secrets from KeyVault");
            return;
        }

        // get optional App Insights Key
        try {
            insightsKey = await keyvault.getSecret(appInsightsKey);
        } catch {
            this.logService.trace("Application Insights key not set.");
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
}

export interface OptionDefinition {
    name: string;
    alias?: string;
    type?: Function;
    description?: string;
    validationPattern?: RegExp;
    required?: boolean;
}
