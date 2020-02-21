import * as ApplicationInsights from "applicationinsights";
import { inject, injectable, named } from "inversify";

/**
 * Handles sending telemetry data via AppInsights
 */
@injectable()
export class AppInsightsProvider {

    private telemClient: ApplicationInsights.TelemetryClient;

    /**
     * Creates a new instance of the App Insights client.
     * @param instrumentationKey The key needed to register your app with App Insights
     */
    constructor(@inject("string") @named("instrumentationKey") instrumentationKey: string) {
        // Setup Application insights with the automatic collection and dependency tracking enabled
        ApplicationInsights.setup(instrumentationKey)
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(true)
        .setUseDiskRetryCaching(true)
        .start();

        // Create the Application insights telemetry client to write custom events to
        this.telemClient = ApplicationInsights.defaultClient;
    }

    /**
     * Sends an event with the given name to App Insights
     * Note: Currently unused, but will be used with Key Rotation
     * @param eventName Name of event to track
     */
    public trackEvent(eventName: string) {
        this.telemClient.trackEvent({name: eventName});
    }
}
