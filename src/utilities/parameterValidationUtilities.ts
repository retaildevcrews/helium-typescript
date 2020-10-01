import { queryErrorMessages } from "../config/constants";

// utilities for validating API parameters.
export class ParameterValidationUtilities {

    // validate common parameters

    public static validateQ(query: any) {
        
        if ("q" in query) {
            
            if (query.q === null || query.q === undefined || query.q.length < 2 || query.q.length > 20 ) {
                
                const message = { 
                    message: queryErrorMessages.invalidQSearchMessage,
                    code: "InvalidValue",
                    target: "q"
                };

                return { validated: false, message: message };
            }

        }

        return { validated: true };

    }

    public static validatePageNumber(query: any) {
        
        if ("pageNumber" in query) {
            
            const pageNumber = parseInt(query.pageNumber, 10)
            
            if (isNaN(pageNumber) || pageNumber != query.pageNumber || pageNumber < 1 || pageNumber > 10000) {
                
                const message = { 
                    message: queryErrorMessages.invalidPageNumberMessage,
                    code: "InvalidValue",
                    target: "pageNumber"
                };

                return { validated: false, message: message };
            }

        }

        return { validated: true };

    }

    public static validatePageSize(query: any) {
        
        if ("pageSize" in query) {

            const pageSize = parseInt(query.pageSize, 10)

            if (isNaN(pageSize) || pageSize != query.pageSize || pageSize < 1 || pageSize > 1000) {
                
                const message = { 
                    message: queryErrorMessages.invalidPageSizeMessage,
                    code: "InvalidValue",
                    target: "pageSize"
                };

                return { validated: false, message: message };
            }

        }

        return { validated: true };

    }

    public static validateGenre(query: any) {
        
        if ("genre" in query) {

            if (query.genre === null || query.genre === undefined || query.genre.length < 3 || query.genre.length > 20) {
                
                const message = { 
                    message: queryErrorMessages.invalidGenreMessage,
                    code: "InvalidValue",
                    target: "genre"
                };

                return { validated: false, message: message };

            }

        }

        return { validated: true };

    }

    public static validateYear(query: any) {
        
        if ("year" in query) {
            const year = parseInt(query.year, 10);

            if (isNaN(year) || year != query.year || year < 1874 || year > (new Date(Date.now()).getFullYear() + 5)) {
                
                const message = { 
                    message: queryErrorMessages.invalidYearMessage,
                    code: "InvalidValue",
                    target: "year"
                };

                return { validated: false, message: message };

            }

        }

        return { validated: true };

    }

    public static validateRating(query: any) {
        
        if ("rating" in query) {

            const rating = parseFloat(query.rating);

            if (isNaN(rating) || rating != query.rating || rating < 0 || rating > 10) {

                const message = { 
                    message: queryErrorMessages.invalidRatingMessage,
                    code: "InvalidValue",
                    target: "rating"
                };

                return { validated: false, message: message };
            }

        }

        return { validated: true };

    }

    public static validateMovieId(movieId: string) {
        
        let validated = true;

        const message = { 
            message: queryErrorMessages.invalidMovieIDMessage,
            code: "InvalidValue",
            target: "movieId"
        };

        if ( movieId === null ||
            movieId === undefined ||
            movieId.length < 7 ||
            movieId.length > 11 ||
            movieId.substring(0,2) !== "tt" ) {
                validated = false;
                return { validated: validated, message: message };
        } else {
            const val = parseInt(movieId.substring(2), 10);
            if (isNaN(val) || val <= 0) {
                validated = false;
                return { validated: validated, message: message };
            }
        }

        return { validated: validated };
    }

    public static validateActorId(actorId: string) {
        
        let validated = true;

        const message = { 
            message: queryErrorMessages.invalidActorIDMessage,
            code: "InvalidValue",
            target: "actorId"
        };                

        if ( actorId === null ||
            actorId === undefined ||
            actorId.length < 7 ||
            actorId.length > 11 ||
            actorId.substring(0,2) !== "nm" ) {
                validated = false;
                return { validated: validated, message: message };
        } else {
            const val = parseInt(actorId.substring(2), 10);
            if (isNaN(val) || val <= 0) {
                validated = false;
                return { validated: validated, message: message };
            }
        }
        
        return { validated: validated };
    }
}
