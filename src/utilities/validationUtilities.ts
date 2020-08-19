import { queryErrorMessages } from "../config/constants";
import * as HttpStatus from "http-status-codes";

// utilities for validating API parameters.
export class ValidationUtilities {

    // validate common parameters
    public static validateCommon(query: any) {

        if ( query === null || query === undefined ) {
            return { validated: true };
        }

        if ("q" in query) {
            if (query.q === null || query.q === undefined || query.q.length < 2 || query.q.length > 20 ) {
                const errorResponse = { error: {
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
                return { validated: false, message: errorResponse };
            }
        }

        if ("pageNumber" in query) {
            const pageNumber = parseInt(query.pageNumber, 10)
            if (isNaN(pageNumber) || pageNumber != query.pageNumber || pageNumber < 1 || pageNumber > 10000) {
                const errorResponse = { error: {
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
                return { validated: false, message: errorResponse };
            }
        }

        if ("pageSize" in query) {
            const pageSize = parseInt(query.pageSize, 10)
            if (isNaN(pageSize) || pageSize != query.pageSize || pageSize < 1 || pageSize > 1000) {
                const errorResponse = { error: {
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
                return { validated: false, message: errorResponse };
            }
        }

        return { validated: true };
    }

    // validate movie-specific parameters
    public static validateMovies(query: any) {

        if ( query === null || query === undefined ) {
            return { validated: true };
        }

        const { validated: validatedCommon, message: messageCommon} = this.validateCommon(query);
        if (!validatedCommon) {
            return { validated: false, message: messageCommon };
        }

        if ("genre" in query) {
            if (query.genre === null || query.genre === undefined || query.genre.length < 3 || query.genre.length > 20) {
                const errorResponse = { error: {
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
                return { validated: false, message: errorResponse };
            }
        }

        if ("year" in query) {
            const year = parseInt(query.year, 10);
            if (isNaN(year) || year != query.year || year < 1874 || year > (new Date(Date.now()).getFullYear() + 5)) {
                const errorResponse = { error: {
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
                return { validated: false, message: errorResponse };
            }
        }

        if ("rating" in query) {
            const rating = parseFloat(query.rating);
            if (isNaN(rating) || rating != query.rating || rating < 0 || rating > 10) {
                const errorResponse = { error: {
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
                return { validated: false, message: errorResponse };
            }
        }

        if ("actorId" in query) {
            const { validated: validatedActorId, message: messageActorId } = this.validateActorId(query.actorId);
            if (!validatedActorId) {
                return { validated: validatedActorId, message: messageActorId};
            }
        }

        return { validated: true };
    }

    public static validateMovieId(movieId: string) {
        
        let validated = true;

        if ( movieId === null ||
            movieId === undefined ||
            movieId.length < 7 ||
            movieId.length > 11 ||
            movieId.substring(0,2) !== "tt" ) {
                const message = { error: {
                    code: "BadArgument",
                    message: queryErrorMessages.invalidMovieIDMessage,
                    statusCode: HttpStatus.BAD_REQUEST,
                    target: "movieId",
                    innererror: {
                        code: "InvalidMovieIDParameter"
                    }
                }};
                validated = false;
                return { validated: validated, message: message };
        } else {
            const val = parseInt(movieId.substring(2), 10);
            if (isNaN(val) || val <= 0) {
                const message = { error: {
                    code: "BadArgument",
                    message: queryErrorMessages.invalidMovieIDMessage,
                    statusCode: HttpStatus.BAD_REQUEST,
                    target: "movieId",
                    innererror: {
                        code: "InvalidMovieIDParameter"
                    }
                }};
                validated = false;
                return { validated: validated, message: message };
            }
        }

        return { validated: validated};
    }

    public static validateActorId(actorId: string) {
        
        let validated = true;

        if ( actorId === null ||
            actorId === undefined ||
            actorId.length < 7 ||
            actorId.length > 11 ||
            actorId.substring(0,2) !== "nm" ) {
                const message = { error: {
                    code: "BadArgument",
                    message: queryErrorMessages.invalidActorIDMessage,
                    statusCode: HttpStatus.BAD_REQUEST,
                    target: "actorId",
                    innererror: {
                        code: "InvalidActorIDParameter"
                    }
                }};
                validated = false;
                return { validated: validated, message: message };
        } else {
            const val = parseInt(actorId.substring(2), 10);
            if (isNaN(val) || val <= 0) {
                const message = { error: {
                    code: "BadArgument",
                    message: queryErrorMessages.invalidActorIDMessage,
                    statusCode: HttpStatus.BAD_REQUEST,
                    target: "actorId",
                    innererror: {
                        code: "InvalidActorIDParameter"
                    }
                }};
                validated = false;
                return { validated: validated, message: message };
            }
        }
        
        return { validated: validated };
    }
}
