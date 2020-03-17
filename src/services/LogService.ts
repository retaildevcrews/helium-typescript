/**
 * Logging and Tracing Service Interface
 * that abstracts logging/tracing
 */

export interface LogService {
    /**
     * Logs tracing information
     * @param message message to trace
     * @param id custom id to correlate traces
     */

     trace(message: string, id?: string): void;
    /**
     * Logs an error with the error code and the error message string specified
     * @param error error to log
     * @param errorMessage Message to log
     */
    error(error: Error, errorMessage: string): void;
}
