import { inject, injectable } from "inversify";
import { Controller, Get, interfaces } from "inversify-restify-utils";
import { Request } from "restify";
import * as HttpStatus from "http-status-codes";
import { DataService } from "../services/DataService";
import { LogService } from "../services/LogService";
import { sqlGenres } from "../config/constants";
import { ErrorHandlingUtilities } from "../utilities/errorHandlingUtilities";

/**
 * controller implementation for our genres endpoint
 */
@Controller("/api/genres")
@injectable()
export class GenreController implements interfaces.Controller {

  constructor(@inject("DataService") private cosmosDb: DataService, @inject("LogService") private logger: LogService) {
  
  }

  @Get("/")
  public async getAllGenres(req: Request, res) {
    const resCode: number = HttpStatus.OK;
    let results: string[];

    try {
      results = await this.cosmosDb.queryDocuments(sqlGenres);
    } catch (err) {
      res.setHeader("Content-Type", "text/plain");
      const {resCode: resCode, message: message} = new ErrorHandlingUtilities(err, this.constructor.name, this.logger).returnResponse();
      return res.send(resCode, message);
    }

    return res.send(resCode, results);
  }
}
