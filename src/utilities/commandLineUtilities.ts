import commandLineArgs = require("command-line-args");
import commandLineUsage = require("command-line-usage");
import { LogService } from "../services";
import { isNull } from "util";

const sections = [
    { header: "Helium", content: "A web app" },
    { header: "Usage", content: "npm start -- [options]" },
    {
        header: "Options",
        optionList: [
            { name: "keyvault-name", alias: "k", description: "The name or URL of the Azure Keyvault. Required." },
            { name: "auth-type", alias: "a", description: "Authentication type - MSI or CLI. Defaults to 'CLI'.", defaultValue: "CLI" },
            { name: "dry-run", alias: "d", description: "Validate configuration but does not run web server", typeLabel: " " },
            { name: "help", alias: "h", description: "Print this usage guide.", typeLabel: " " }
        ]
    }
]

export function parseArguments(logService?: LogService) {


    // environment variables
    const env = {
        "keyvault-name": process.env.KEYVAULT_NAME,
        "auth-type": process.env.AUTH_TYPE
    }

    const args = commandLineArgs(sections.find(s => s.header == "Options").optionList);

    // compose the environment variables and cli args
    const values = { ...env, ...args };

    // validate arguments
    if (isNull(values.help)) {
        showHelp();
        process.exit(0);
    }
    else {
        if (!values["keyvault-name"])
            throw new Error("Missing keyvault-name argument (or KEYVAULT_NAME environment variable).");
        if (!values["auth-type"]) {
            values["auth-type"] = "MSI";
            if (logService) logService.trace("No authorization type provided. Defaulting to 'MSI'.");
        }
        if (values["auth-type"].toUpperCase() != "MSI" && values["auth-type"].toUpperCase() != "CLI")
            throw new Error("Invalid authentication type");
        if (!values["keyvault-name"].startsWith("https://"))
            values["keyvault-name"] = `https://${values["keyvault-name"]}.vault.azure.net`;
    }

    return values;
}

export function showHelp(message?: string) {
    if (message) console.log(message);
    console.log(commandLineUsage(sections));
}

// // Output CLI argument usage instructions to console
// // Optional parameter to display error/context message
// export function showHelp(message?: string) {
//     if (message) console.log(message);

//     console.log(`\n
//             Usage: npm start -- ...
//             -k  \t--keyvault-name   \tKey Vault Name - name or full URL of the Azure Key Vault
//                 \t                  \t(can alternatively be set with environment variable KeyVaultName)
//             -a  \t--auth-type       \tauthentication type] - Valid types: 
//                 \t                  \tMSI - managed identity (default)
//                 \t                  \tCLI - Azure CLI cached credentials
//             -h  \t--help            \tdisplay command line usage
//             `
//     );
// }
