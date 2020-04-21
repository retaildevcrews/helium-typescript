import "reflect-metadata";
import { ActorController, MovieController, FeaturedController, GenreController, HealthzController } from "./controllers";
import { AppInsightsService, BunyanLogService, CosmosDBService, DataService, TelemetryService, LogService } from "./services";
import { Container } from "inversify";
import { ConsoleController } from "./config/ConsoleController";
import { ConfigValues } from "./config/ConfigValues";
import { interfaces, TYPE } from "inversify-restify-utils";
import { HeliumServer } from "./HeliumServer";

// main
(async function main() {
    const container: Container = new Container();

    // setup logService (we need it for configuration)
    container.bind<LogService>("LogService").to(BunyanLogService).inSingletonScope();
    const logService = container.get<LogService>("LogService");
    
    // parse command line arguments to get the Key Vault url and auth type
    const consoleController = new ConsoleController(logService);
    const config = await consoleController.run();

    // setup ioc container
    container.bind<ConfigValues>("ConfigValues").toConstantValue(config);
    container.bind<interfaces.Controller>(TYPE.Controller).to(ActorController).whenTargetNamed("ActorController");
    container.bind<interfaces.Controller>(TYPE.Controller).to(FeaturedController).whenTargetNamed("FeaturedController");
    container.bind<interfaces.Controller>(TYPE.Controller).to(GenreController).whenTargetNamed("GenreController");
    container.bind<interfaces.Controller>(TYPE.Controller).to(MovieController).whenTargetNamed("MovieController");
    container.bind<interfaces.Controller>(TYPE.Controller).to(HealthzController).whenTargetNamed("HealthzController");
    container.bind<DataService>("DataService").to(CosmosDBService).inSingletonScope();
    container.bind<TelemetryService>("TelemetryService").to(AppInsightsService).inSingletonScope();
    
    // the telem object is currently unused, but will be used with Key Rotation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let telemetryService: TelemetryService;
    // telemetry service is optional
    if (config.insightsKey) {
        container.get<TelemetryService>("TelemetryService");
    }

    // connect to cosmos db
    let cosmosDbService: DataService; 
    try {
        cosmosDbService = container.get<DataService>("DataService"); 
        await cosmosDbService.connect();
    }
    catch (err) {
        const errorText = "Failed to connect to Cosmos DB";
        this.logger.error(err, errorText);
    }

    // instantiate the server
    const heliumServer = new HeliumServer(container);

    // start the server
    heliumServer.start();

})()
