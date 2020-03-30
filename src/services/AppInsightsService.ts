import * as ApplicationInsights from "applicationinsights";
import { inject, injectable } from "inversify";
import { ConfigValues } from "../config/config";

// handles sending telemetry data via AppInsights
@injectable()
export class AppInsightsService {

    private telemetryClient: ApplicationInsights.TelemetryClient;

    /**
     * Creates a new instance of the App Insights client.
     */
    constructor(@inject("ConfigValues") configValues: ConfigValues) {
        if (configValues.insightsKey) {
            // Setup Application insights with the automatic collection and dependency tracking enabled
            ApplicationInsights.setup(configValues.insightsKey)
                .setAutoDependencyCorrelation(true)
                .setAutoCollectRequests(true)
                .setAutoCollectPerformance(true)
                .setAutoCollectExceptions(true)
                .setAutoCollectDependencies(true)
                .setAutoCollectConsole(true)
                .setUseDiskRetryCaching(true)
                .start();
    
            // Create the Application insights telemetry client to write custom events to
            this.telemetryClient = ApplicationInsights.defaultClient;
        }
    }

    /**
     * Sends an event with the given name to App Insights
     * Note: Currently unused, but will be used with Key Rotation
     * @param eventName Name of event to track
     */
    public trackEvent(eventName: string) {
        if (this.telemetryClient)
            this.telemetryClient.trackEvent({ name: eventName });
    }
}
