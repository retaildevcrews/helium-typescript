import * as bodyParser from "body-parser";
import * as swaggerJSDoc from "swagger-jsdoc";
import "reflect-metadata";
import EndpointLogger from "./middleware/EndpointLogger";
import { ActorController } from "./app/controllers/actor";
import { AppInsightsProvider } from "./telem/appinsightsprovider";
import { BunyanLogger } from "./logging/bunyanLogProvider";
import { Container } from "inversify";
import { CosmosDBProvider } from "./db/cosmosdbprovider";
import { FeaturedController } from "./app/controllers/featured";
import { GenreController } from "./app/controllers/genre";
import { getConfigValues } from "./config/config";
import { HealthzController } from "./app/controllers/healthz";
import { html } from "./swagger-html";
import { IDatabaseProvider } from "./db/idatabaseprovider";
import { ILoggingProvider } from "./logging/iLoggingProvider";
import { interfaces, InversifyRestifyServer, TYPE } from "inversify-restify-utils";
import { ITelemProvider } from "./telem/itelemprovider";
import { MovieController } from "./app/controllers/movie";
import { robotsHandler } from "./middleware/robotsText";
import { version } from "./config/constants";

(async () => {
    const restify = require("restify");

    /**
     * Create an Inversion of Control container using Inversify
     */
    const iocContainer: Container = new Container();

    /**
     * Bind the logging provider implementation that you want to use to the container
     */
    iocContainer.bind<ILoggingProvider>("ILoggingProvider").to(BunyanLogger).inSingletonScope();
    const log: ILoggingProvider = iocContainer.get<ILoggingProvider>("ILoggingProvider");

    // Get config values from Key Vault
    const config = await getConfigValues(log);

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
    iocContainer.bind<IDatabaseProvider>("IDatabaseProvider").to(CosmosDBProvider).inSingletonScope();
    iocContainer.bind<string>("string").toConstantValue(config.cosmosDbUrl).whenTargetNamed("cosmosDbUrl");
    iocContainer.bind<string>("string").toConstantValue(config.cosmosDbKey).whenTargetNamed("cosmosDbKey");
    iocContainer.bind<string>("string").toConstantValue(config.database).whenTargetNamed("database");
    iocContainer.bind<string>("string").toConstantValue(config.collection).whenTargetNamed("collection");

    // Note: the telem object is currently unused, but will be used with Key Rotation 
    let telem: ITelemProvider;
    // ITelemProvicer/AppInsightsProvider is optional
    if (config.insightsKey) {
        iocContainer.bind<string>("string").toConstantValue(config.insightsKey).whenTargetNamed("instrumentationKey");
        iocContainer.bind<ITelemProvider>("ITelemProvider").to(AppInsightsProvider).inSingletonScope();
        telem = iocContainer.get<ITelemProvider>("ITelemProvider");
    }

    // initialize cosmos db provider
    const cosmosDb: IDatabaseProvider = iocContainer.get<IDatabaseProvider>("IDatabaseProvider");
    try {
        await cosmosDb.initialize();
    } catch (err) {
        log.Error(Error(err), "Cosmos failed to initialize: " + err);
    }

    // create restify server
    const server = new InversifyRestifyServer(iocContainer);

    log.Trace("Version: " + version);

    try {
        // listen for requests
        server.setConfig((app) => {
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

            const options: any = {
                // Path to the API docs
                apis: [`${__dirname}/app/models/*.js`, `${__dirname}/app/controllers/*.js`],
                definition: {
                    info: {
                        title: "Helium", // Title (required)
                        version: {version}, // Version (required)
                    },
                    openapi: "3.0.2", // Specification (optional, defaults to swagger: "2.0")
                },
            };

            // Initialize swagger-jsdoc -> returns validated swagger spec in json format
            const swaggerSpec: any = swaggerJSDoc(options);

            app.get("/swagger.json", (req, res) => {
                res.setHeader("Content-Type", "application/json");
                res.send(swaggerSpec);
            });

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
            log.Trace("Server is listening on port " + config.port);
        });

    } catch (err) {
        log.Error(Error(err), "Error in setting up the server! " + err);
    }
})();
