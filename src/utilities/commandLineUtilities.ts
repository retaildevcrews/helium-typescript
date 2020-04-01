import commandLineArgs = require("command-line-args");
import { LogService } from "../services";
import { isNull } from "util";

// utilities for handling command line arguments.
export class CommandLineUtilities {

    public static parseArguments(logService?: LogService): { authType: string; keyVaultName: string } {

        // environment variables
        const env = {
            "keyvault-name": process.env.KEYVAULT_NAME,
            "auth-type": process.env.AUTH_TYPE
        }

        // cli args
        const args = commandLineArgs([
            { name: "keyvault-name", alias: "k" },
            { name: "auth-type", alias: "a" },
            { name: "dry-run", alias: "d" },
            { name: "help", alias: "h" }
        ]);

        // compose the environment variables and cli args
        const values = { ...env, ...args };

        // validate arguments
        if (isNull(values.help)) {
            CommandLineUtilities.showHelp();
            process.exit(0);
        }
        else {
            if (!values["keyvault-name"])
                throw new Error("Missing keyvault-name argument (or KEYVAULT_NAME environment variable).");
            if (!values["auth-type"]) {
                values["auth-type"] = "MSI";
                if(logService) logService.trace("No authorization type provided. Defaulting to 'MSI'.");
            }
            if (values["auth-type"].toUpperCase() != "MSI" && values["auth-type"].toUpperCase() != "CLI")
                throw new Error("Invalid authentication type");
            if (!values["keyvault-name"].startsWith("https://"))
                values["keyvault-name"] = `https://${values["keyvault-name"]}.vault.azure.net`;
        }

        return values;
    }

    // output CLI argument usage instructions to console
    public static showHelp(message?: string) {
        
        // optionally display error/context message
        if (message) console.log(message);

        console.log(`\n
            Usage: npm start -- ...
            -k  \t--keyvault-name   \tKey Vault Name - name or full URL of the Azure Key Vault
                \t                  \t(can alternatively be set with environment variable KeyVaultName)
            -a  \t--auth-type       \tauthentication type] - Valid types: 
                \t                  \tMSI - managed identity (default)
                \t                  \tCLI - Azure CLI cached credentials
            -h  \t--help            \tdisplay command line usage
            `
        );
    }
}
