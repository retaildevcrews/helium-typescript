// eslint-disable prefer-arrow-callback
import "reflect-metadata";
import { assert } from "chai";
import { promisify } from "util";
import childProcess = require("child_process");
import { ActorController, MovieController, FeaturedController, GenreController, HealthzController } from "../../src/controllers";
import { HeliumServer } from "../../src/HeliumServer";
import { ConsoleController } from "../../src/config/ConsoleController";
import { ConfigValues } from "../../src/config/ConfigValues";
import { interfaces, TYPE } from "inversify-restify-utils";
import { DataService, CosmosDBService, LogService, ConsoleLogService } from "../../src/services";
import { Container } from "inversify";

let heliumServer: HeliumServer;
let exec;

before(async function() {
    this.timeout(30000);

    exec = promisify(childProcess.exec);

    process.env.KEYVAULT_NAME = "froyo-kv";
    process.env.AUTH_TYPE = "CLI";
    process.env.LOG_LEVEL = "info";

    console.log("Setting up server for test...");
    const container: Container = new Container();
    container.bind<LogService>("LogService").to(ConsoleLogService).inSingletonScope();
    const logService = container.get<LogService>("LogService");

    // HACK: strip the spec 
    const specIndex = process.argv.findIndex(a => a.includes("test/e2e/**/*.ts"));
    process.argv.splice(specIndex, 1);
    
    // retrieve configuration
    const consoleController = new ConsoleController(logService);
    const config = await consoleController.run();

    // setup an ioc container for test
    // these could be replaced with mocks if necessary
    container.bind<ConfigValues>("ConfigValues").toConstantValue(config);
    container.bind<interfaces.Controller>(TYPE.Controller).to(ActorController).whenTargetNamed("ActorController");
    container.bind<interfaces.Controller>(TYPE.Controller).to(FeaturedController).whenTargetNamed("FeaturedController");
    container.bind<interfaces.Controller>(TYPE.Controller).to(GenreController).whenTargetNamed("GenreController");
    container.bind<interfaces.Controller>(TYPE.Controller).to(MovieController).whenTargetNamed("MovieController");
    container.bind<interfaces.Controller>(TYPE.Controller).to(HealthzController).whenTargetNamed("HealthzController");
    container.bind<DataService>("DataService").to(CosmosDBService).inSingletonScope();

    // connect to cosmos db
    let cosmosDbService: DataService;
    try {
        cosmosDbService = container.get<DataService>("DataService"); 
        await cosmosDbService.connect();
    }
    catch (err) {
        console.log(`Failed to connect to Cosmos DB ${err}`);
    }

    // instantiate and start the server
    heliumServer = new HeliumServer(container);
    heliumServer.start();
    return;
});

// this test requires that you have the helium/webvalidate project in a directory next to helium-typescript
it("Run webv against the running server", async function () {
    this.timeout(120000);

    const URL = "localhost:4120";
    const FILES = "node.json baseline.json bad.json";

    console.log(`Running webv against ${URL} using files: ${FILES}.`);
    const command = `./webvalidate --server ${URL} --files ${FILES}`;
    
    let exitCode;
    try {
        const { stdout } = await exec(command, { cwd: "../webvalidate/src/app/bin/Debug/netcoreapp3.1" });
        console.log(stdout);
    }
    catch (exc) {
        exitCode = exc.code;
    }
    if(exitCode) assert.equal(exitCode, 0);

});

after(() => {
    if (heliumServer) {
        console.log("Stopping Helium server...");
        heliumServer.stop();
    }
    else console.log("No Helium server to stop.");
})
