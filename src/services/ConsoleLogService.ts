import { LogService } from "./LogService";
import { injectable } from "inversify";

@injectable()
export class ConsoleLogService implements LogService {
    trace(message: string, id?: string): void {
        id;
        console.log(`LOG TRACE: ${message}`);
    }
    info(message: string, id?: string): void {
        id;
        console.log(`LOG INFO: ${message}`);
    }
    warn(message: string, id?: string): void {
        id;
        console.log(`LOG WARN: ${message}`);
    }
    error(error: Error, errorMessage: string, id?: string): void {
        console.error(`LOG ERROR: ${errorMessage}`);
    }
}
