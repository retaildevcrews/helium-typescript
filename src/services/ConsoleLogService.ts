import { LogService } from "./LogService";
import { injectable } from "inversify";

@injectable()
export class ConsoleLogService implements LogService {
    trace(message: string, id?: string): void {
        id;
        console.log(`LOG TRACE: ${message}`);
    }
    error(error: Error, errorMessage: string): void {
        console.error(`LOG ERROR: ${errorMessage}`);
    }
}
