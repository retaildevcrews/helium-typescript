import * as bodyParser from "body-parser";
import "reflect-metadata";
import EndpointLogger from "./middleware/EndpointLogger";
import { ActorController, MovieController, FeaturedController, GenreController, HealthzController } from "./app/controllers";
import { AppInsightsProvider } from "./telem/AppInsightsProvider";
import { BunyanLogger } from "./logging/BunyanLogger";
import { Container } from "inversify";
import { CosmosDBProvider } from "./db/CosmosDBProvider";
import { getConfigValues } from "./config/config";
import { html } from "./swagger-html";
import { DatabaseProvider } from "./db/DatabaseProvider";
import { LoggingProvider } from "./logging/LoggingProvider";
import { interfaces, InversifyRestifyServer, TYPE } from "inversify-restify-utils";
import { TelemProvider } from "./telem/TelemProvider";
import { robotsHandler } from "./middleware/robotsText";
import { authTypeEnv, keyVaultName, version } from "./config/constants";
import { CommandLineUtilities } from "./utilities/commandLineUtilities";
import restify = require("restify");
// Uncomment this if you want to auto generate swagger json
// import * as swaggerJSDoc from "swagger-jsdoc";

(async () => {

    /**
     * Create an Inversion of Control container using Inversify
     */
    const iocContainer: Container = new Container();

    /**
     * Bind the logging provider implementation that you want to use to the container
     */
    iocContainer.bind<LoggingProvider>("LoggingProvider").to(BunyanLogger).inSingletonScope();
    const log: LoggingProvider = iocContainer.get<LoggingProvider>("LoggingProvider");

    /**
     * Set Key Vault name/url and authentication type variables
     * Command line args override environment variables
     */
    let keyVaultUrl = process.env[keyVaultName];
    let authType = process.env[authTypeEnv];

    // Read command line args
    const args = process.argv;
    if (args.length > 2) {
        let i = 2;
        let message: string;
        while ((i) < args.length) {
            if (args[i].startsWith("--authtype") && (i + 1) < args.length && !args[i + 1].startsWith("-")) {
                authType = args[i + 1];

                if (authType !== "MSI" && authType !== "CLI") {
                    message = "Invalid authentication type.";
                    break;
                }
                i += 2;
            } else if (args[i].startsWith("--kvname") && (i + 1) < args.length && !args[i + 1].startsWith("-")) {
                keyVaultUrl = args[i + 1];
                i += 2;
            } else if (args[i] === "-h" || args[i] === "--help") {
                CommandLineUtilities.usage();
                process.exit(0);
            } else {
                message = "Invalid command line argument/s.";
                break;
            }
        }

        if (message) {
            CommandLineUtilities.usage(message);
            process.exit(0);
        }
    }

    // Exit if missing Key Vault Name
    if (!keyVaultUrl) {
        console.log("Key Vault name missing.");
        process.exit(1);
    } else if (!keyVaultUrl.startsWith("https://")) {
        keyVaultUrl = "https://" + keyVaultUrl + ".vault.azure.net/";
    }

    // Default authentication type to MSI
    if (!authType) {
        console.log("No authentication type specified, defaulting to MSI.");
        authType = "MSI";
    }

    // Get config values from Key Vault
    const config = await getConfigValues(keyVaultUrl, authType, log);

    /**
     *  Bind the Controller classes for the Controllers you want in your server
     */
    iocContainer.bind<interfaces.Controller>(TYPE.Controller).to(ActorController).whenTargetNamed("ActorController");
    iocContainer.bind<interfaces.Controller>(TYPE.Controller).to(FeaturedController).whenTargetNamed("FeaturedController");
    iocContainer.bind<interfaces.Controller>(TYPE.Controller).to(GenreController).whenTargetNamed("GenreController");
    iocContainer.bind<interfaces.Controller>(TYPE.Controller).to(MovieController).whenTargetNamed("MovieController");
    iocContainer.bind<interfaces.Controller>(TYPE.Controller).to(HealthzController).whenTargetNamed("HealthzController");

    /**
     * Bind the database provider & telemetry provider implementation that you want to use.
     * Also, bind the configuration parameters for the providers.
     */
    iocContainer.bind<DatabaseProvider>("DatabaseProvider").to(CosmosDBProvider).inSingletonScope();
    iocContainer.bind<string>("string").toConstantValue(config.cosmosDbUrl).whenTargetNamed("cosmosDbUrl");
    iocContainer.bind<string>("string").toConstantValue(config.cosmosDbKey).whenTargetNamed("cosmosDbKey");
    iocContainer.bind<string>("string").toConstantValue(config.database).whenTargetNamed("database");
    iocContainer.bind<string>("string").toConstantValue(config.collection).whenTargetNamed("collection");

    // Note: the telem object is currently unused, but will be used with Key Rotation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let telem: TelemProvider;
    // TelemProvider/AppInsightsProvider is optional
    if (config.insightsKey) {
        iocContainer.bind<string>("string").toConstantValue(config.insightsKey).whenTargetNamed("instrumentationKey");
        iocContainer.bind<TelemProvider>("TelemProvider").to(AppInsightsProvider).inSingletonScope();
        telem = iocContainer.get<TelemProvider>("TelemProvider");
    }

    // initialize cosmos db provider
    const cosmosDb: DatabaseProvider = iocContainer.get<DatabaseProvider>("DatabaseProvider");
    try {
        await cosmosDb.initialize();
    } catch (err) {
        log.error(Error(err), "Cosmos failed to initialize: " + err);
    }

    // create restify server
    const server = new InversifyRestifyServer(iocContainer);

    log.trace("Version: " + version);

    try {
        // listen for requests
        server.setConfig(app => {
            /**
             * Parse requests of content-type - application/x-www-form-urlencoded
             */
            app.use(bodyParser.urlencoded({ extended: true }));

            app.pre(robotsHandler);

            /**
             * Parses HTTP query string and makes it available in req.query.
             * Setting mapParams to false prevents additional params in query to be merged in req.Params
             */
            app.use(restify.plugins.queryParser({ mapParams: false }));

            /**
             * Set Content-Type as json for reading and parsing the HTTP request body
             */

            app.use(bodyParser.json());

            /**
             * Configure the requestlogger plugin to use Bunyan for correlating child loggers
             */
            app.use(restify.plugins.requestLogger());

            /**
             * Configure middleware function to be called for every endpoint.
             * This function logs the endpoint being called and measures duration taken for the call.
             */
            app.use(EndpointLogger(iocContainer));

            // Uncomment this if you want to auto generate swagger json
            // const options: any = {
            //     // Path to the API docs
            //     apis: [`${__dirname}/app/models/*.js`, `${__dirname}/app/controllers/*.js`],
            //     definition: {
            //         info: {
            //             title: "Helium", // Title (required)
            //             version: {version}, // Version (required)
            //         },
            //         openapi: "3.0.2", // Specification (optional, defaults to swagger: "2.0")
            //     },
            // };

            // Initialize swagger-jsdoc -> returns validated swagger spec in json format
            // Uncomment this if you want to auto generate swagger json
            // const swaggerSpec: any = swaggerJSDoc(options);

            // Uncomment this if you want to auto generate swagger json
            // app.get("/swagger.json", (req, res) => {
            //     res.setHeader("Content-Type", "application/json");
            //     res.send(swaggerSpec);
            // });

            app.get("/swagger/*", restify.plugins.serveStatic({
                directory: __dirname + "/..",
                default: "swagger.json",
            }));

            app.get("/", (req, res) => {
                res.writeHead(200, {
                    "Content-Length": Buffer.byteLength(html),
                    "Content-Type": "text/html",
                });
                res.write(html);
                res.end();
            });

            app.get("/node_modules/swagger-ui-dist/*", restify.plugins.serveStatic({
                directory: __dirname + "/..",
            }));

            app.get("/version", (req, res) => {
                res.setHeader("Content-Type", "text/plain");
                res.send(version);
            });
        }).build().listen(config.port, () => {
            log.trace("Server is listening on port " + config.port);
        });

    } catch (err) {
        log.error(Error(err), "Error in setting up the server! " + err);
    }
})();
