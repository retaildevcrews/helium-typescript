import * as bodyParser from "body-parser";
import "reflect-metadata";
import EndpointLogger from "./middleware/EndpointLogger";
import { ActorController, MovieController, FeaturedController, GenreController, HealthzController } from "./controllers";
import { AppInsightsService, BunyanLogService, CosmosDBService, DataService, TelemetryService, LogService } from "./services";
import { Container } from "inversify";
import { getConfigValues, ConfigValues } from "./config/config";
import { html } from "./swagger-html";
import { interfaces, InversifyRestifyServer, TYPE } from "inversify-restify-utils";
import { robotsHandler } from "./middleware/robotsText";
import { authTypeEnv, keyVaultName, version } from "./config/constants";
import { CommandLineUtilities } from "./utilities/commandLineUtilities";
import restify = require("restify");

export class HeliumServer {
    public server: restify.Server;
    public inversifyServer: InversifyRestifyServer;
    public container: Container = new Container();

    constructor() {

    }

    async initialize() {
        return new Promise(async (resolve, reject) => {
            /**
             * Bind the logging service implementation that you want to use to the container
             */
            this.container.bind<LogService>("LogService").to(BunyanLogService).inSingletonScope();
            const log: LogService = this.container.get<LogService>("LogService");

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
                process.exit(-1);
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

            // Exit if failed to connect to Key Vault
            if (config === undefined) {
                process.exit(-1);
            }

            /**
             *  Bind the Controller classes for the Controllers you want in your server
             */
            this.container.bind<interfaces.Controller>(TYPE.Controller).to(ActorController).whenTargetNamed("ActorController");
            this.container.bind<interfaces.Controller>(TYPE.Controller).to(FeaturedController).whenTargetNamed("FeaturedController");
            this.container.bind<interfaces.Controller>(TYPE.Controller).to(GenreController).whenTargetNamed("GenreController");
            this.container.bind<interfaces.Controller>(TYPE.Controller).to(MovieController).whenTargetNamed("MovieController");
            this.container.bind<interfaces.Controller>(TYPE.Controller).to(HealthzController).whenTargetNamed("HealthzController");

            /**
             * Bind the data service & telemetry service implementation that you want to use.
             * Also, bind the configuration parameters for the services.
             */
            this.container.bind<DataService>("DataService").to(CosmosDBService).inSingletonScope();
            this.container.bind<ConfigValues>("ConfigValues").toConstantValue(config);

            // Note: the telem object is currently unused, but will be used with Key Rotation
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            let telem: TelemetryService;
            // TelemetryService/AppInsightsService is optional
            if (config.insightsKey) {
                this.container.bind<string>("string").toConstantValue(config.insightsKey).whenTargetNamed("instrumentationKey");
                this.container.bind<TelemetryService>("TelemetryService").to(AppInsightsService).inSingletonScope();
                telem = this.container.get<TelemetryService>("TelemetryService");
            }

            // initialize cosmos db service
            let cosmosDb: DataService;
            try {
                cosmosDb = this.container.get<DataService>("DataService");
                await cosmosDb.ready;
            } catch (err) {
                log.error(Error(err), "Cosmos failed to initialize: " + err);
            }

            // create restify server
            this.inversifyServer = new InversifyRestifyServer(this.container);

            log.trace("Version: " + version);

            try {
                // listen for requests
                this.server = this.inversifyServer.setConfig(app => {
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
                    app.use(EndpointLogger(this.container));

                    // Uncomment this if you want to auto generate swagger json
                    // const options: any = {
                    //     // Path to the API docs
                    //     apis: [`${__dirname}/models/*.js`, `${__dirname}/controllers/*.js`],
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
                }).build()
                
                this.server.listen(config.port, () => {
                    log.trace("Server is listening on port " + config.port);
                    resolve();
                });

            } catch (err) {
                log.error(Error(err), "Error in setting up the server! " + err);
                reject();
            }

        });
    }

    public stop() {
        this.server.close();
    }
}
