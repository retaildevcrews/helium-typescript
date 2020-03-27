import { keyVaultName, authTypeEnv } from "../config/constants";
import commandLineArgs = require("command-line-args");
import { LogService } from "../services";
import { isNull } from "util";

/**
 * Utilities for handling command line arguments.
 */
export class CommandLineUtilities {

    public static parseArguments(logService?: LogService): { authType: string; keyVaultName: string } {
        const environmentVariables = {
            [keyVaultName]: process.env[keyVaultName],
            [authTypeEnv]: process.env[authTypeEnv]
        }

        const argumentOptions = [
            { name: keyVaultName, alias: "k" },
            { name: authTypeEnv, alias: "a" },
            { name: "help", alias: "h" }
        ];

        // compose the args and the environment 
        const values = { ...environmentVariables, ...commandLineArgs(argumentOptions) };

        // validate arguments
        if (isNull(values.help)) {
            CommandLineUtilities.showHelp();
            process.exit(0);
        }
        else {
            if (!values[keyVaultName])
                throw new Error(`Missing ${keyVaultName} argument`);
            if (!values[authTypeEnv]) {
                values[authTypeEnv] = "MSI";
                if(logService) logService.trace(`No ${authTypeEnv} provided. Defaulting to 'MSI'.`);
            }
            if (values[authTypeEnv].toUpperCase() != "MSI" && values[authTypeEnv].toUpperCase() != "CLI")
                throw new Error("Invalid authentication type");
            if (!values[keyVaultName].startsWith("https://"))
                values[keyVaultName] = `https://${values[keyVaultName]}.vault.azure.net`;
        }

        return values;
    }

    // Output CLI argument usage instructions to console
    // Optional parameter to display error/context message
    public static showHelp(message?: string) {
        if (message) console.log(message);

        console.log(`\n
            Usage: npm start -- ...
            -k  \t--kvname      \tKey Vault Name - name or full URL of the Azure Key Vault
                \t              \t(can alternatively be set with environment variable KeyVaultName)
            -a  \t--authtype    \tauthentication type] - Valid types: 
                \t              \tMSI - managed identity (default)
                \t              \tCLI - Azure CLI cached credentials
            -h  \t--help        \tdisplay command line usage
            `
        );
    }
}
