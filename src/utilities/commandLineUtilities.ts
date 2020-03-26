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
    public static usage(message?: string) {
        if (message) {
            console.log(message);
        }

        console.log("\nUsage: npm start -- ...");
        console.log("Required:");
        console.log("\t--kvname Key Vault Name - name or full URL of the Azure Key Vault");
        console.log("\t\t(can alternatively be set with environment variable KeyVaultName)");
        console.log("Optional:");
        console.log("\t[-h] [--help] - display command line usage");
        console.log("\t[--authtype authentication type] - Valid types: ");
        console.log("\t\t MSI - managed identity (default)");
        console.log("\t\t CLI - Azure CLI cached credentials");
    }
}
