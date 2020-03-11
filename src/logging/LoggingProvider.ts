/**
 * Logging and Tracing Provider Interface
 * that abstracts logging/tracing
 */

export interface LoggingProvider {
    /**
     * Logs tracing information
     * @param message message to trace
     * @param id custom id to correlate traces
     */

     trace(message: string, id?: string): void;
    /**
     * Logs an error with the error code and the error message string specified
     * @param error error to log
     * @param errormessage Message to log
     */
    error(error: Error, errormessage: string): void;
}
