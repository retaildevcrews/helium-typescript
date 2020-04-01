import * as bunyan from "bunyan";
import { injectable } from "inversify";
import { v4 } from "uuid";
import { LogService } from "./LogService";

@injectable()
export class BunyanLogService implements LogService {
  private logger: bunyan;
  private uniqueServerId: string;
  private customId: string;

  // creates a new instance of the Bunyan Logger.

  /**
   * Log levels:
   * -----------
   * "fatal" (60):
   *   The service/app is going to stop or become unusable now. An operator should definitely look into this soon.
   * "error" (50):
   *   Fatal for a particular request, but the service/app continues servicing other requests.
   *   An operator should look at this soon(ish).
   * "warn" (40):
   *   A note on something that should probably be looked at by an operator eventually.
   * "info" (30):
   *   Detail on regular operation.
   * "debug" (20):
   *   Anything else, i.e. too verbose to be included in "info" level.
   * "trace" (10):
   *   Logging from external libraries used by your app or very detailed application logging.
   */
  constructor() {
    this.logger = bunyan.createLogger({
      name: "bunyanLog",
      serializers: {
        req: bunyan.stdSerializers.req,
        res: bunyan.stdSerializers.res,
      },
      streams: [
        {
          level: bunyan.TRACE,  // logs "trace" level and everything above
          stream: process.stdout,
        },
        {
          level: bunyan.ERROR,
          stream: process.stderr, // logs "error" and "fatal" levels
        },
      ],
    });
    this.uniqueServerId = v4();
  }

  public trace(message: string, id?: string) {
    if (id == null) {
      if (this.customId == null) {
        this.logger.trace({ correlationID: this.uniqueServerId }, message);
      } else {
        this.logger.trace({ correlationID: this.uniqueServerId, customID: this.customId }, message);
      }
    } else {
      this.customId = id;
      this.logger.trace({ correlationID: this.uniqueServerId, customID: this.customId }, message);
    }
  }

  public error(error: Error, errorMessage: string) {
    this.logger.error({ err: error, correlationID: this.uniqueServerId, customID: this.customId }, errorMessage);
  }
}
