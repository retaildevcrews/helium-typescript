import "reflect-metadata";
import EndpointLogger from "./middleware/EndpointLogger";
import { DataService, TelemetryService, LogService } from "./services";
import { Container } from "inversify";
import { InversifyRestifyServer } from "inversify-restify-utils";
import { ConfigValues } from "./config/config";
import { html } from "./swagger-html";
import { robotsHandler } from "./middleware/robotsText";
import { version } from "./config/constants";
import bodyParser = require("body-parser");
import restify = require("restify");

export class HeliumServer {
    private server: restify.Server;
    private inversifyServer: InversifyRestifyServer;
    private telemetryService: TelemetryService;
    private dataService: DataService;
    private logService: LogService;
    private configValues: ConfigValues;

    constructor(private container: Container) {
        this.inversifyServer = new InversifyRestifyServer(this.container);
        if (this.container.isBound("TelemetryService"))
            this.container.get<TelemetryService>("TelemetryService")
        this.dataService = this.container.get<DataService>("DataService");
        this.logService = this.container.get<LogService>("LogService");
        this.configValues = this.container.get<ConfigValues>("ConfigValues");
        this.server = this.createRestifyServer();
    }

    createRestifyServer() {
        return this.inversifyServer.setConfig(app => {
            // middleware
            app
                .use(bodyParser.urlencoded({ extended: true }))
                .pre(robotsHandler)
                .use(restify.plugins.queryParser({ mapParams: false }))
                .use(bodyParser.json())
                .use(restify.plugins.requestLogger())
                .use(EndpointLogger(this.container));

            // routes
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
        }).build();
    }

    public start() {
        this.server.listen(this.configValues.port, () => {
            this.logService.trace(`Server is listening on port ${this.configValues.port}`);
        });
    }

    public stop() {
        if (this.server) this.server.close();
    }
}
