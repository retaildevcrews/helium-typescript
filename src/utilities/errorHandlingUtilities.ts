import { inject, injectable } from "inversify";
import { LogService } from "../services/LogService";
import * as HttpStatus from "http-status-codes";

@injectable()
export class ErrorHandlingUtilities {
    private messages ={
        "ActorController": {
            "error": "ActorControllerException",
            "message": "Actor Not Found"
        }
    }

    constructor(
        private error, private controller, @inject("LogService") private logger: LogService
    ) {
        this.error = error;
        this.controller = controller;
    }

    public returnResponse (id = "") {
        let resCode: number;
        
        if (this.error.code) {
            resCode = this.error.code;
        } else {
            resCode = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        if (resCode === HttpStatus.NOT_FOUND || this.error.toString().includes("404")){
            resCode = HttpStatus.NOT_FOUND;
            this.logger.trace(this.messages[this.controller].message +  ": " + id);
            return {resCode: resCode, message: this.messages[this.controller].message};
        }
        
        this.logger.error(Error(this.error), this.messages[this.controller].error + ": " + this.error.toString());
        return {resCode: resCode, message: this.messages[this.controller].error};
    }

}
