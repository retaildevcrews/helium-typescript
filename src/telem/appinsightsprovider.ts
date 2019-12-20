import * as ApplicationInsights from "applicationinsights";
import { MetricTelemetry } from "applicationinsights/out/Declarations/Contracts";
import { DependencyTelemetry } from "applicationinsights/out/Declarations/Contracts/TelemetryTypes/DependencyTelemetry";
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
     * @param eventName Name of event to track
     */
    public trackEvent(eventName: string) {
        this.telemClient.trackEvent({name: eventName});
    }

    /**
     * Send quantifiable metrics to App Insights
     * TelemetryClient.TrackDependency class and properties:
     *      https://docs.microsoft.com/en-us/dotnet/api/microsoft.applicationinsights
     *      .datacontracts.dependencytelemetry?view=azure-dotnet
     */

    public trackDependency(dependency: DependencyTelemetry) {

        this.telemClient.trackDependency(dependency);
    }

    public trackMetric(metric: MetricTelemetry) {

        this.telemClient.trackMetric(metric);

    }

    public getDependencyTrackingObject(
        dependencyTypeNameParam: string,
        nameParam: string,
        dataParam: string,
        resultCodeParam: string,
        successParam: boolean,
        durationParam: number): DependencyTelemetry {

        // Declare and initialize a DependencyTelemetry object for sending metrics to AppInsights
        const dependencyTelem: DependencyTelemetry = {
            dependencyTypeName: dependencyTypeNameParam,
            name: nameParam,
            data: dataParam,
            resultCode: resultCodeParam,
            success: successParam,
            duration: durationParam,
        };

        // Return the DependencyTelemetry object
        return dependencyTelem;
    }

    public getMetricTelemetryObject(
        metricname: string,
        metricvalue: number): MetricTelemetry {

        // Declare and initialize a MetricTelemetry object for sending metrics to AppInsights
        const metricTelem: MetricTelemetry = {
            name: metricname,
            value: metricvalue,
        };

        // Return the MetricTelemetry object
        return metricTelem;
    }
}
