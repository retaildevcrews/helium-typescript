export const sections = [
    { "header": "Helium", "content": "A web app" },
    { "header": "Usage", "content": "npm start -- [options]" },
    {
        "header": "Options",
        "optionList": [
            {
                "name": "keyvault-name",
                "alias": "k",
                "type": String,
                "description": "The name or URL of the Azure Key Vault. required.",
                "validationPattern": /^[a-z](?!.*--)([a-z0-9-]*[a-z0-9])?$/i,
                "required": true
            },
            {
                "name": "auth-type",
                "alias": "a",
                "type": String,
                "description": "Authentication type - MSI or CLI. Defaults to 'MSI'. CLI is only supported with the dev flag set",
                "validationPattern": /^(MSI)$/gi,
            },
            {
                "name": "dry-run",
                "alias": "d",
                "type": Boolean,
                "description": "Validate configuration but does not run web server",
                "defaultValue": false
            },
            {
                "name": "log-level",
                "alias": "l",
                "type": String,
                "description": "Sets the log verboseness level, from highest to lowest: 'trace', 'info', 'warn', 'error', 'fatal'. Defaults to 'info'",
                "validationPattern": /^(trace|debug|info|warn|error|fatal)$/gi,
            },
            {
                "name": "dev",
                "type": Boolean,
                "description": "Enables development mode - including CLI authorization type",
                "defaultValue": false
            },
            {
                "name": "help",
                "alias": "h",
                "type": Boolean,
                "description": "Print this usage guide.",
                "defaultValue": false
            }
        ]
    }
]
