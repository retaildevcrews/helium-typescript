import { inject, injectable } from "inversify";
import { Controller, Get, interfaces } from "inversify-restify-utils";
import { Request } from "restify";
import * as HttpStatus from "http-status-codes";
import { DataService, LogService } from "../services";
import { sqlGenres } from "../config/constants";
import { getHttpStatusCode } from "../utilities/httpStatusUtilities";

// controller implementation for our genres endpoint
@Controller("/api/genres")
@injectable()
export class GenreController implements interfaces.Controller {

    constructor(@inject("DataService") private cosmosDb: DataService, @inject("LogService") private logger: LogService) {

    }

    @Get("/")
    public async getAllGenres(req: Request, res) {
        let resCode: number = HttpStatus.OK;
        let results: string[];

        try {
            results = await this.cosmosDb.queryDocuments(sqlGenres);
        } catch (err) {
            res.setHeader("Content-Type", "text/plain");
            resCode = getHttpStatusCode(err);
            this.logger.error(Error(err), "GenreControllerException: " + err.toString());
            return res.send(resCode, "GenreControllerException");
        }

        return res.send(resCode, results);
    }
}
