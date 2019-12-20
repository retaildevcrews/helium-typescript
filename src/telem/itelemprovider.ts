import { MetricTelemetry } from "applicationinsights/out/Declarations/Contracts";
import { DependencyTelemetry } from "applicationinsights/out/Declarations/Contracts/TelemetryTypes/DependencyTelemetry";

export interface ITelemProvider {
    /**
     * Sends an event with the given name to App Insights
     * @param eventName Name of event to track
     */
    trackEvent(eventName: string): void;

    trackDependency(dependency: DependencyTelemetry): void;

    trackMetric(metric: MetricTelemetry): void;

    getDependencyTrackingObject(
        dependencyTypeName: string,
        name: string,
        data: string,
        resultCode: string,
        success: boolean,
        duration: number): DependencyTelemetry;

    getMetricTelemetryObject(
        name: string,
        value: number): MetricTelemetry;
}
