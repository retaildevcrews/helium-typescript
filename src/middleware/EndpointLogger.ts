import * as restify from "restify";
import { Container } from "inversify";
import { ILoggingProvider } from "../logging/iLoggingProvider";
import { ITelemProvider } from "../telem/itelemprovider";
import { DateUtilities } from "../utilities/dateUtilities";

/**
 * Endpoint logger and telem sender
 * Adds start/end logs and telemetry to every endpoint
 * @param container The inversify container with the logger and telem client
 */
export default function responseDuration(container: Container) {
    // get the log and telem clients
    const log: ILoggingProvider = container.get<ILoggingProvider>("ILoggingProvider");
    const telem: ITelemProvider = container.get<ITelemProvider>("ITelemProvider");

    // return a function with the correct middleware signature
    return function responseTime(req: restify.Request, res: restify.Response, next) {
        // start tracking time
        const duration: () => number = DateUtilities.getTimer();
        // create string unique to this action at this endpoint
        const apiName: string = `${req.method} ${req.url}`;

        telem.trackEvent(apiName);

        // hook into response finish to log call duration/result
        res.on("finish", (() => {
            const totalDuration = duration();
            telem.trackMetric(telem.getMetricTelemetryObject(
                apiName + " duration",
                totalDuration,
            ));

            if (res.statusCode > 399) {
                log.Trace(apiName + "  Result: " + res.statusCode + "; Duration: " + totalDuration, req.getId());
            }
        }));

        // call next middleware
        next();
    };
}
