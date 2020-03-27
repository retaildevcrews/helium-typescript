import "reflect-metadata";
import { ActorController, MovieController, FeaturedController, GenreController, HealthzController } from "./controllers";
import { AppInsightsService, BunyanLogService, CosmosDBService, DataService, TelemetryService, LogService } from "./services";
import { Container } from "inversify";
import { getConfigValues, ConfigValues } from "./config/config";
import { interfaces, TYPE } from "inversify-restify-utils";
import { HeliumServer } from "./HeliumServer";
import { CommandLineUtilities } from "./utilities";
import { keyVaultName, authTypeEnv } from "./config/constants";

// Uncomment this if you want to auto generate swagger json
// import * as swaggerJSDoc from "swagger-jsdoc";

// main
(async function main() {
    const container: Container = new Container();

    // setup logService (we need it for configuration)
    container.bind<LogService>("LogService").to(BunyanLogService).inSingletonScope();
    const logService = container.get<LogService>("LogService");
    
    // parse command line arguments to get the key vault url and auth type
    const argumentValues = CommandLineUtilities.parseArguments();
    
    // retrieve configuration
    const config = await getConfigValues(argumentValues[keyVaultName], argumentValues[authTypeEnv], logService);
    if(!config) process.exit(-1);

    // setup ioc container
    container.bind<ConfigValues>("ConfigValues").toConstantValue(config);
    container.bind<interfaces.Controller>(TYPE.Controller).to(ActorController).whenTargetNamed("ActorController");
    container.bind<interfaces.Controller>(TYPE.Controller).to(FeaturedController).whenTargetNamed("FeaturedController");
    container.bind<interfaces.Controller>(TYPE.Controller).to(GenreController).whenTargetNamed("GenreController");
    container.bind<interfaces.Controller>(TYPE.Controller).to(MovieController).whenTargetNamed("MovieController");
    container.bind<interfaces.Controller>(TYPE.Controller).to(HealthzController).whenTargetNamed("HealthzController");
    container.bind<DataService>("DataService").to(CosmosDBService).inSingletonScope();
    container.bind<TelemetryService>("TelemetryService").to(AppInsightsService).inSingletonScope();
    
    // instantiate the server
    const heliumServer = new HeliumServer(container);

    // start the server
    heliumServer.start();

})()
