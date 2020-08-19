import { assert } from "chai";
import * as HttpStatus from "http-status-codes";
import { QueryUtilities, DateUtilities, VersionUtilities, ValidationUtilities, getHttpStatusCode } from "../../src/utilities";
import { ConsoleController } from "../../src/config/ConsoleController";
import { queryErrorMessages } from "../../src/config/constants"
import { Container } from "inversify";
import { LogService, ConsoleLogService } from "../../src/services";

let logService;

describe("Utilities tests", () => {
  before(() => {
    const container: Container = new Container();
    container.bind<LogService>("LogService").to(ConsoleLogService);
    logService = container.get<LogService>("LogService");
  });

  describe("QueryUtilities", () => {
    describe("getPartitionKey", () => {
      it("should return the right type", () => {
        assert.typeOf(QueryUtilities.getPartitionKey("nm1234"), "string");
      });

      it("should return the right partition key", () => {
        assert.equal(QueryUtilities.getPartitionKey("nm1234"), "4");
        assert.equal(QueryUtilities.getPartitionKey("tt1234"), "4");
        assert.equal(QueryUtilities.getPartitionKey("tttttt"), "0");
        assert.equal(QueryUtilities.getPartitionKey("Action"), "0");
        assert.equal(QueryUtilities.getPartitionKey("tt1"), "0");
      });
    })
  });

  describe("DateUtilities", () => {
    describe("getTimer", () => {
      it("should return correct type", () => {
        assert.typeOf(DateUtilities.getTimer(), "function");
      });
      it("should time for a select duration accurately enough", () => {
        const timer = DateUtilities.getTimer();
        const VALUE = 2000;
        let result;
        setTimeout(() => {
          result = timer();

          // make sure the timer result is within 5% of the target
          assert.isTrue(((result / VALUE) - 1) < 0.05);
        }, VALUE);
      })
    });
    describe("getDurationMS", () => {
      it("should return correct type", () => {
        assert.typeOf(DateUtilities.getDurationMS([1800216, 25]), "string");
      });
      it("should return correct duration", () => {
        assert.equal(DateUtilities.getDurationMS([1800216, 25]), "1800216000");
      });
    });
  });

  describe("VersionUtilities", () => {
    describe("getBuildVersion", () => {
      it("should return correct type", () => {
        assert.typeOf(VersionUtilities.getBuildVersion(), "string");
      });
    });
    describe("getSwaggerVersion", () => {
      it("should return correct type", () => {
        assert.typeOf(VersionUtilities.getSwaggerVersion(), "string");
      });
    });
  });

  describe("ValidationUtilities", () => {
    describe("validateMovieId", () => {
      it("should invalidate ( null )", () => {
        const { validated, message } = ValidationUtilities.validateMovieId( null );
        const response = { error: {
          code: "BadArgument",
          message: queryErrorMessages.invalidMovieIDMessage,
          statusCode: HttpStatus.BAD_REQUEST,
          target: "movieId",
          innererror: {
              code: "InvalidMovieIDParameter"
          }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate ( undefined )", () => {
        const { validated, message } = ValidationUtilities.validateMovieId( undefined );
        const response = { error: {
          code: "BadArgument",
          message: queryErrorMessages.invalidMovieIDMessage,
          statusCode: HttpStatus.BAD_REQUEST,
          target: "movieId",
          innererror: {
              code: "InvalidMovieIDParameter"
          }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should validate movie ID tt333344", () => {
        const { validated, message } = ValidationUtilities.validateMovieId("tt333344");
        assert.isTrue(validated);
        //assert.isEmpty(message);
      });

      it("should invalidate TT333344 (uppercase prefix)", () => {
        const { validated, message } = ValidationUtilities.validateMovieId("TT333344");
        const response = { error: {
          code: "BadArgument",
          message: queryErrorMessages.invalidMovieIDMessage,
          statusCode: HttpStatus.BAD_REQUEST,
          target: "movieId",
          innererror: {
              code: "InvalidMovieIDParameter"
          }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate nm333344 (incorrect prefix)", () => {
        const { validated, message } = ValidationUtilities.validateMovieId("nm333344");
        const response = { error: {
          code: "BadArgument",
          message: queryErrorMessages.invalidMovieIDMessage,
          statusCode: HttpStatus.BAD_REQUEST,
          target: "movieId",
          innererror: {
              code: "InvalidMovieIDParameter"
          }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate tt (too short)", () => {
        const { validated, message } = ValidationUtilities.validateMovieId("tt");
        const response = { error: {
          code: "BadArgument",
          message: queryErrorMessages.invalidMovieIDMessage,
          statusCode: HttpStatus.BAD_REQUEST,
          target: "movieId",
          innererror: {
              code: "InvalidMovieIDParameter"
          }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate tttttttttttt (too long)", () => {
        const { validated, message } = ValidationUtilities.validateMovieId("tttttttttttt");
        const response = { error: {
          code: "BadArgument",
          message: queryErrorMessages.invalidMovieIDMessage,
          statusCode: HttpStatus.BAD_REQUEST,
          target: "movieId",
          innererror: {
              code: "InvalidMovieIDParameter"
          }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate ttabcdef (non-numeric after first 2 characters)", () => {
        const { validated, message } = ValidationUtilities.validateMovieId("ttabcdef");
        const response = { error: {
          code: "BadArgument",
          message: queryErrorMessages.invalidMovieIDMessage,
          statusCode: HttpStatus.BAD_REQUEST,
          target: "movieId",
          innererror: {
              code: "InvalidMovieIDParameter"
          }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });
    });

    describe("validateActorId", () => {
      it("should validate nm333344", () => {
        const { validated, message } = ValidationUtilities.validateActorId("nm333344");
        assert.isTrue(validated);
        //assert.isEmpty(message);
      });

      it("should invalidate NM333344 (upper case)", () => {
        const { validated, message } = ValidationUtilities.validateActorId("NM333344");
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidActorIDMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "actorId",
            innererror: {
                code: "InvalidActorIDParameter"
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate tt333344 (incorrect prefix)", () => {
        const { validated, message } = ValidationUtilities.validateActorId("tt333344");
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidActorIDMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "actorId",
            innererror: {
                code: "InvalidActorIDParameter"
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate nm (too short)", () => {
        const { validated, message } = ValidationUtilities.validateActorId("nm");
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidActorIDMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "actorId",
            innererror: {
                code: "InvalidActorIDParameter"
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate tttttttttttt (too long)", () => {
        const { validated, message } = ValidationUtilities.validateActorId("tttttttttttt");
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidActorIDMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "actorId",
            innererror: {
                code: "InvalidActorIDParameter"
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate nmabcdef (non-numeric after first 2 characters)", () => {
        const { validated, message } = ValidationUtilities.validateActorId("nmabcdef");
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidActorIDMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "actorId",
            innererror: {
                code: "InvalidActorIDParameter"
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });
    });

    describe("validateCommon", () => {
      it("should validate with no parameters", () => {
        const { validated, message } = ValidationUtilities.validateCommon({});
        assert.isTrue(validated);
        assert.isUndefined(message);
      });

      it("should validate with null", () => {
        const { validated, message } = ValidationUtilities.validateCommon( null );
        assert.isTrue(validated);
        assert.isUndefined(message);
      });

      it("should validate with undefined", () => {
        const { validated, message } = ValidationUtilities.validateCommon( undefined );
        assert.isTrue(validated);
        assert.isUndefined(message);
      });

      it("should validate with a valid q parameter", () => {
        const { validated, message } = ValidationUtilities.validateCommon({ q: "valid" });
        assert.isTrue(validated);
        assert.isUndefined(message);
      });

      it("should validate with a valid pageNumber parameter", () => {
        const { validated, message } = ValidationUtilities.validateCommon({ pageNumber: "100" });
        assert.isTrue(validated);
        assert.isUndefined(message);
      });

      it("should validate with a valid pageSize parameter", () => {
        const { validated, message } = ValidationUtilities.validateCommon({ pageSize: "200" });
        assert.isTrue(validated);
        assert.isUndefined(message);
      });

      it("should invalidate when q parameter is too long", () => {
        const { validated, message } = ValidationUtilities.validateCommon({ q: "this query is too long" });
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidQSearchMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "q",
            innererror: {
                code: "InvalidSearchParameter",
                minLength: "2",
                maxLength: "20",
                characterTypes: ["lowerCase","upperCase","number","symbol"]
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate when q parameter is too short", () => {
        const { validated, message } = ValidationUtilities.validateCommon({ q: "a" });
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidQSearchMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "q",
            innererror: {
                code: "InvalidSearchParameter",
                minLength: "2",
                maxLength: "20",
                characterTypes: ["lowerCase","upperCase","number","symbol"]
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate when pageNumber parameter cannot parse to an integer", () => {
        const { validated, message } = ValidationUtilities.validateCommon({ pageNumber: "number" });
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidPageNumberMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "pageNumber",
            innererror: {
                code: "InvalidPageNumberParameter",
                minValue: "1",
                maxValue: "10000",
                valueTypes: ["integer"]
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate when pageNumber parameter is too large", () => {
        const { validated, message } = ValidationUtilities.validateCommon({ pageNumber: "20000" });
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidPageNumberMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "pageNumber",
            innererror: {
                code: "InvalidPageNumberParameter",
                minValue: "1",
                maxValue: "10000",
                valueTypes: ["integer"]
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate when pageNumber parameter is too small", () => {
        const { validated, message } = ValidationUtilities.validateCommon({ pageNumber: "0" });
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidPageNumberMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "pageNumber",
            innererror: {
                code: "InvalidPageNumberParameter",
                minValue: "1",
                maxValue: "10000",
                valueTypes: ["integer"]
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate when pageSize parameter cannot parse to an integer", () => {
        const { validated, message } = ValidationUtilities.validateCommon({ pageSize: "size" });
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidPageSizeMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "pageSize",
            innererror: {
                code: "InvalidPageSizeParameter",
                minValue: "1",
                maxValue: "1000",
                valueTypes: ["integer"]
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate when pageSize parameter is too large", () => {
        const { validated, message } = ValidationUtilities.validateCommon({ pageSize: "2000" });
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidPageSizeMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "pageSize",
            innererror: {
                code: "InvalidPageSizeParameter",
                minValue: "1",
                maxValue: "1000",
                valueTypes: ["integer"]
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate when pageSize parameter is too small", () => {
        const { validated, message } = ValidationUtilities.validateCommon({ pageSize: "0" });
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidPageSizeMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "pageSize",
            innererror: {
                code: "InvalidPageSizeParameter",
                minValue: "1",
                maxValue: "1000",
                valueTypes: ["integer"]
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });
    });

    describe("validateMovies", () => {
      it("should validate with no parameters", () => {
        const { validated, message } = ValidationUtilities.validateMovies({});
        assert.isTrue(validated);
        assert.isUndefined(message);
      });

      it("should validate with null", () => {
        const { validated, message } = ValidationUtilities.validateMovies( null );
        assert.isTrue(validated);
        assert.isUndefined(message);
      });

      it("should validate with undefined", () => {
        const { validated, message } = ValidationUtilities.validateMovies( undefined );
        assert.isTrue(validated);
        assert.isUndefined(message);
      });

      it("should validate with a valid genre", () => {
        const { validated, message } = ValidationUtilities.validateMovies({ genre: "action" });
        assert.isTrue(validated);
        assert.isUndefined(message);
      });

      it("should validate with a valid year", () => {
        const { validated, message } = ValidationUtilities.validateMovies({ year: "1999" });
        assert.isTrue(validated);
        assert.isUndefined(message);
      });

      it("should validate with a valid rating", () => {
        const { validated, message } = ValidationUtilities.validateMovies({ rating: "9.3" });
        assert.isTrue(validated);
        assert.isUndefined(message);
      });

      it("should validate with a valid actorId", () => {
        const { validated, message } = ValidationUtilities.validateMovies({ actorId: "nm123345" });
        assert.isTrue(validated);
        assert.isUndefined(message);
      });

      it("should invalidate with invalid q parameter", () => {
        const { validated, message } = ValidationUtilities.validateMovies({ q: "a" });
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidQSearchMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "q",
            innererror: {
                code: "InvalidSearchParameter",
                minLength: "2",
                maxLength: "20",
                characterTypes: ["lowerCase","upperCase","number","symbol"]
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate with invalid pageNumber parameter", () => {
        const { validated, message } = ValidationUtilities.validateMovies({ pageNumber: "0" });
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidPageNumberMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "pageNumber",
            innererror: {
                code: "InvalidPageNumberParameter",
                minValue: "1",
                maxValue: "10000",
                valueTypes: ["integer"]
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate with invalid pageSize parameter", () => {
        const { validated, message } = ValidationUtilities.validateMovies({ pageSize: "size" });
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidPageSizeMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "pageSize",
            innererror: {
                code: "InvalidPageSizeParameter",
                minValue: "1",
                maxValue: "1000",
                valueTypes: ["integer"]
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate with invalid genre parameter (null)", () => {
        const { validated, message } = ValidationUtilities.validateMovies({ genre: null });
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidGenreMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "genre",
            innererror: {
                code: "InvalidGenreParameter",
                minLength: "3",
                maxLength: "20",
                valueTypes: ["string"]
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate with invalid genre parameter (undefined)", () => {
        const { validated, message } = ValidationUtilities.validateMovies({ genre: undefined });
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidGenreMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "genre",
            innererror: {
                code: "InvalidGenreParameter",
                minLength: "3",
                maxLength: "20",
                valueTypes: ["string"]
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate with invalid genre parameter (too long)", () => {
        const { validated, message } = ValidationUtilities.validateMovies({ genre: "this is too long for a genre" });
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidGenreMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "genre",
            innererror: {
                code: "InvalidGenreParameter",
                minLength: "3",
                maxLength: "20",
                valueTypes: ["string"]
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate with invalid genre parameter (too short)", () => {
        const { validated, message } = ValidationUtilities.validateMovies({ genre: "ge" });
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidGenreMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "genre",
            innererror: {
                code: "InvalidGenreParameter",
                minLength: "3",
                maxLength: "20",
                valueTypes: ["string"]
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate with invalid year parameter (won't parse to an integer)", () => {
        const { validated, message } = ValidationUtilities.validateMovies({ year: "year" });
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidYearMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "year",
            innererror: {
                code: "InvalidYearParameter",
                minValue: 1874,
                maxValue: (new Date(Date.now()).getFullYear() + 5),
                valueTypes: ["integer"]
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate with invalid year parameter (too large)", () => {
        const { validated, message } = ValidationUtilities.validateMovies({ year: "3060" });
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidYearMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "year",
            innererror: {
                code: "InvalidYearParameter",
                minValue: 1874,
                maxValue: (new Date(Date.now()).getFullYear() + 5),
                valueTypes: ["integer"]
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate with invalid year parameter (too small)", () => {
        const { validated, message } = ValidationUtilities.validateMovies({ year: "1870" });
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidYearMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "year",
            innererror: {
                code: "InvalidYearParameter",
                minValue: 1874,
                maxValue: (new Date(Date.now()).getFullYear() + 5),
                valueTypes: ["integer"]
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate with invalid rating parameter (won't parse to an integer)", () => {
        const { validated, message } = ValidationUtilities.validateMovies({ rating: "rating" });
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidRatingMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "rating",
            innererror: {
                code: "InvalidRatingParameter",
                minValue: "0",
                maxValue: "10",
                valueTypes: ["double"]
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate with invalid rating parameter (too large)", () => {
        const { validated, message } = ValidationUtilities.validateMovies({ rating: "12.34" });
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidRatingMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "rating",
            innererror: {
                code: "InvalidRatingParameter",
                minValue: "0",
                maxValue: "10",
                valueTypes: ["double"]
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate with invalid rating parameter (too small)", () => {
        const { validated, message } = ValidationUtilities.validateMovies({ rating: "-1" });
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidRatingMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "rating",
            innererror: {
                code: "InvalidRatingParameter",
                minValue: "0",
                maxValue: "10",
                valueTypes: ["double"]
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });

      it("should invalidate with invalid actorId parameter", () => {
        const { validated, message } = ValidationUtilities.validateMovies({ actorId: "actor" });
        const response = { error: {
            code: "BadArgument",
            message: queryErrorMessages.invalidActorIDMessage,
            statusCode: HttpStatus.BAD_REQUEST,
            target: "actorId",
            innererror: {
                code: "InvalidActorIDParameter"
            }
        }};
        assert.isFalse(validated);
        assert.equal(message, response);
      });
    });
  });

  let consoleController: ConsoleController;

  describe("CommandLineUtilities", () => {
    describe("parseArguments", () => {
      before(() => {
        // strip the spec 
        // when tests are executed, the spec (file path) goofs up command-line-args parsing them
        const specIndex = process.argv.findIndex(a => a.includes("test/e2e/**/*.ts"));
        process.argv.splice(specIndex, 1);

        consoleController = new ConsoleController(logService)
      });
      // save the command line arguments so they can be restored after each test
      const argvSave = JSON.parse(JSON.stringify(process.argv));
      const specIndex = argvSave.findIndex(a => a.includes("test/unit/**/*.ts"));
      if (specIndex >= 0) argvSave.splice(specIndex, 1);

      it("should pass with no validation errors", () => {
        process.argv = process.argv.concat(["--keyvault-name", "abc"]);
        process.argv = process.argv.concat(["--auth-type", "MSI"]);
        process.argv = process.argv.concat(["--log-level", "info"]);
        assert(consoleController.parseArguments().validationMessages.length == 0);
      });

      it("should invalidate if keyvault-name is missing", () => {
        const { validationMessages } = consoleController.parseArguments();
        assert(validationMessages.length > 0);
      });

      it("should default --auth-type to MSI", () => {
        process.argv = process.argv.concat(["--keyvault-name", "abc"]);
        const { values } = consoleController.parseArguments();
        assert(values["auth-type"] && values["auth-type"].toUpperCase() == "MSI");
      });

      it("should set --auth-type to CLI", () => {
        process.argv = process.argv.concat(["--keyvault-name", "abc"]);
        process.env.AUTH_TYPE = "CLI";
        const { values } = consoleController.parseArguments();
        assert(values["auth-type"] && values["auth-type"].toUpperCase() == "CLI");
      });

      it("should invalidate if the value of auth-type is not valid", () => {
        process.argv = process.argv.concat(["--keyvault-name", "abc"]);
        process.argv = process.argv.concat(["--auth-type", "def"]);
        assert(consoleController.parseArguments().validationMessages.length > 0);
      });

      it("should invalidate if the value of auth-type is not valid from env var", () => {
        process.argv = process.argv.concat(["--keyvault-name", "abc"]);
        process.env.AUTH_TYPE = "def";
        assert(consoleController.parseArguments().validationMessages.length > 0);
      });

      it("should default --log-level to info", () => {
        process.argv = process.argv.concat(["--keyvault-name", "abc"]);
        const { values } = consoleController.parseArguments();
        assert(values["log-level"] && values["log-level"] == "info");
      });

      it("should set log-level to warn", () => {
        process.argv = process.argv.concat(["--keyvault-name", "abc"]);
        process.env.LOG_LEVEL = "warn";
        const { values } = consoleController.parseArguments();
        assert(values["log-level"] && values["log-level"] == "warn");
      });

      it("should invalidate if the value of log-level is not valid", () => {
        process.argv = process.argv.concat(["--keyvault-name", "abc"]);
        process.argv = process.argv.concat(["--auth-type", "MSI"]);
        process.argv = process.argv.concat(["--log-level", "boffo"]);
        assert(consoleController.parseArguments().validationMessages.length > 0);
      });

      it("should invalidate if the value of log-level is not valid from env var", () => {
        process.argv = process.argv.concat(["--keyvault-name", "abc"]);
        process.argv = process.argv.concat(["--auth-type", "MSI"]);
        process.env.LOG_LEVEL = "boffo";
        assert(consoleController.parseArguments().validationMessages.length > 0);
      });

      it("should invalidate if the value of auth-type is CLI with out a dev flag", () => {
        process.argv = process.argv.concat(["--keyvault-name", "abc"]);
        process.argv = process.argv.concat(["--auth-type", "CLI"]);
        assert(consoleController.parseArguments().validationMessages.length > 0);
      });

      it("should validate if the value of auth-type is CLI with a dev flag valid", () => {
        process.argv = process.argv.concat(["--keyvault-name", "abc"]);
        process.argv = process.argv.concat(["--auth-type", "CLI"]);
        process.argv = process.argv.concat(["--dev"]);
        const { values } = consoleController.parseArguments();
        assert.exists(values["dev"]);
      });

      it("should expand the keyvault URL if only the name was provided", () => {
        process.argv = process.argv.concat(["--keyvault-name", "abc"]);
        const { values } = consoleController.parseArguments();
        assert(values["keyvault-name"] == "https://abc.vault.azure.net");
      });

      it("should show help when --help is provided", () => {
        process.argv = process.argv.concat(["--help"]);
        const { values } = consoleController.parseArguments();
        assert.exists(values["help"]);
      });

      afterEach(() => {
        process.argv = argvSave.slice();
        // Clear environment variables
        process.env.KEYVAULT_NAME = "";
        process.env.AUTH_TYPE = "";
        process.env.LOG_LEVEL = "";
      });
    });
  });

  describe("httpStatusUtilities", () => {
    describe("getHttpStatusCode", () => {
      it("should return the error code given", () => {
        const error = { code: HttpStatus.BAD_GATEWAY }
        const status = getHttpStatusCode(error)
        assert(status == HttpStatus.BAD_GATEWAY);
      });

      it("should return a 500 Internal Server error when it not a 404 or error is a string", () => {
        const error = "Houston we have a problem"
        const status = getHttpStatusCode(error)
        assert(status == HttpStatus.INTERNAL_SERVER_ERROR);
      });

      it("should return a 404 error", () => {
        const error = "This is a 404 error code"
        const status = getHttpStatusCode(error)
        assert(status == HttpStatus.NOT_FOUND);
      })
    });
  });
});

