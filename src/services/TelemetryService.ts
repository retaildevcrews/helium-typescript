export interface TelemetryService {
    // sends an event with the given name to App Insights
    trackEvent(eventName: string): void;
}
