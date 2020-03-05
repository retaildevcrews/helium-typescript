/**
 * Utilities for handling command line arguments.
 */
export class CommandLineUtilities {

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
