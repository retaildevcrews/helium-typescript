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
        this.logService.setLoglevel(values.log);

        // handle --help
        if (values.help) {
            this.showHelp();
            process.exit();
        }


        // handle invalid values
        else if (validationMessages.length > 0) {
            validationMessages.forEach(m => console.error(m));
            this.showHelp();
            process.exit();
        }

        // get config values
        let config: ConfigValues;
        try {
            config = await this.getConfigValues(values["keyvault-name"], values["auth-type"]);
        } catch (err) {
            this.logService.error(err, `Key Vault Config Exception: ${err}`);
            process.exit(-1);
        }

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
            Cosmos Key                    Length(${config.cosmosDbKey.length})
            Cosmos Database               ${config.database}
            Cosmos Collection             ${config.collection}
            App Insights Key              ${config.insightsKey ? `Length(${config.insightsKey.length})` : "(not set)"}
        `);
    }

    async getConfigValues(keyVaultUrl: string, authType: string): Promise<ConfigValues> {

        // use default port from constants
        const port = portConstant;

        const keyvault = new KeyVaultService(keyVaultUrl, authType, this.logService);
        await keyvault.connect();

        // get Cosmos DB secrets from Key Vault
        const cosmosDbKey = await keyvault.getSecret(cosmosKey);
        const cosmosDbUrl = await keyvault.getSecret(cosmosUrl);
        const database = await keyvault.getSecret(cosmosDatabase);
        const collection = await keyvault.getSecret(cosmosCollection);

        // get optional App Insights Key
        let insightsKey: string;
        try {
            insightsKey = await keyvault.getSecret(appInsightsKey);
        } catch {
            this.logService.warn("Application Insights key not set.");
            insightsKey = "";
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
