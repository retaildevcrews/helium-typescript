/**
 * Utilities for date/time functions.
 */
export class DateUtilities {

    public static getTimestamp(): number {
        return Date.now();
    }

    public static getTimer() {
        const start: number = Date.now();

        return () => {
            return Date.now() - start;
        };
    }
}
