import * as ApplicationInsights from "applicationinsights";
import { inject, injectable } from "inversify";
import { ConfigValues } from "../config/ConfigValues";

// handles sending telemetry data via AppInsights
@injectable()
export class AppInsightsService {

    private telemetryClient: ApplicationInsights.TelemetryClient;

    // creates a new instance of the App Insights client.
    constructor(@inject("ConfigValues") configValues: ConfigValues) {
        if (configValues.insightsKey) {
            // setup Application insights with the automatic collection and dependency tracking enabled
            ApplicationInsights.setup(configValues.insightsKey)
                .setAutoDependencyCorrelation(true)
                .setAutoCollectRequests(true)
                .setAutoCollectPerformance(true)
                .setAutoCollectExceptions(true)
                .setAutoCollectDependencies(true)
                .setAutoCollectConsole(true)
                .setUseDiskRetryCaching(true)
                .start();
    
            // create the Application insights telemetry client to write custom events to
            this.telemetryClient = ApplicationInsights.defaultClient;
        }
    }

    // sends an event with the given name to App Insights
    // currently unused, but will be used with Key Rotation
    public trackEvent(eventName: string) {
        if (this.telemetryClient)
            this.telemetryClient.trackEvent({ name: eventName });
    }
}
