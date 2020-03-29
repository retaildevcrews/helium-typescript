import { inject, injectable } from "inversify";
import { Controller, Get, interfaces } from "inversify-restify-utils";
import { Request } from "restify";
import * as HttpStatus from "http-status-codes";
import { DataService } from "../services/DataService";
import { LogService } from "../services/LogService";
import { sqlGenres } from "../config/constants";

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
      // TODO: Refactor error handling/response/logging to reduce duplication
      res.setHeader("Content-Type", "text/plain");
      if (err.code == undefined){
        resCode = HttpStatus.INTERNAL_SERVER_ERROR;
      } else {
        resCode = err.code;
      }

      this.logger.error(Error(err), "GenreControllerException: " + err.toString());
      return res.send(resCode, "GenreControllerException");
    }

    return res.send(resCode, results);
  }
}
