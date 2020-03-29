export interface LogService {
    trace(message: string, id?: string): void;
    error(error: Error, errorMessage: string): void;
}
