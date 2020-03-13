export interface TelemProvider {
    /**
     * Sends an event with the given name to App Insights
     * @param eventName Name of event to track
     */
    trackEvent(eventName: string): void;
}
