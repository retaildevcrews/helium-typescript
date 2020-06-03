import "reflect-metadata";
import EndpointLogger from "./middleware/EndpointLogger";
import { LogService } from "./services";
import { Container } from "inversify";
import { InversifyRestifyServer } from "inversify-restify-utils";
import { ConfigValues } from "./config/ConfigValues";
import { html } from "./swagger-html";
import { robotsHandler } from "./middleware/robotsText";
import { version } from "./config/constants";
import bodyParser = require("body-parser");
import restify = require("restify");

export class HeliumServer {
    private server: restify.Server;
    private inversifyServer: InversifyRestifyServer;
    private logService: LogService;
    private configValues: ConfigValues;

    constructor(private container: Container) {
        this.inversifyServer = new InversifyRestifyServer(this.container);
        this.logService = this.container.get<LogService>("LogService");
        this.configValues = this.container.get<ConfigValues>("ConfigValues");
        this.server = this.createRestifyServer();

        this.logService.info(`Version: ${version}`);
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
                default: "helium.json",
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
            this.logService.info(`Server is listening on port ${this.configValues.port}`);
            console.log("allo", process.env.NODE_ENV)
        });
    }

    public stop() {
        if (this.server) this.server.close();
    }
}
