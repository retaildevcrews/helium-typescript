export interface LogService {
    trace(message: string, id?: string): void;
    info(message: string, id?: string): void;
    warn(message: string, id?: string): void;
    error(error: Error, errorMessage: string): void;
}
