import { keyVaultName, authTypeEnv } from "../config/constants";
import commandLineArgs = require("command-line-args");

/**
 * Utilities for handling command line arguments.
 */
export class CommandLineUtilities {

    public static parseArguments(): { authType: string; keyVaultName: string } {
        const environmentVariables = {
            keyVaultName: process.env[keyVaultName],
            authType: process.env[authTypeEnv]
        }

        const argumentOptions = [
            { name: "keyVaultName", alias: "k" },
            { name: "authType", alias: "a" },
            { name: "help", alias: "h" }
        ];

        // compose the args and the environment 
        const values = { ...environmentVariables, ...commandLineArgs(argumentOptions) };

        // validate arguments
        if (!values.keyVaultName)
            throw new Error("Missing keyVaultName argument");
        if (!values.authType)
            values.authType = "MSI";
        if (values.authType.toUpperCase() != "MSI" && values.authType.toUpperCase() != "CLI")
            throw new Error("Invalid authentication type");
        if (!values.keyVaultName.startsWith("https://"))
            values.keyVaultName = `https://${values.keyVaultName}.vault.azure.net`;

        return values;
    }

    // Output CLI argument usage instructions to console
    // Optional parameter to display error/context message
    public static showHelp(message?: string) {
        if (message) {
            console.log(message);
        }

        console.log(`\n
            Usage: npm start -- ...
            Required:
              --kvname Key Vault Name - name or full URL of the Azure Key Vault
                (can alternatively be set with environment variable KeyVaultName)
            Optional:
              [-h] [--help] - display command line usage
              [--authtype authentication type] - Valid types: 
                MSI - managed identity (default)
                CLI - Azure CLI cached credentials`
        );
    }
}
