import {
    invalidActorIDMessage, invalidGenreMessage, invalidMovieIDMessage, 
    invalidPageNumberMessage, invalidPageSizeMessage, invalidQSearchMessage, 
    invalidRatingMessage, invalidYearMessage
} from "../config/constants";

// utilities for validating API parameters.
export class ValidationUtilities {

    // 
    public static validateCommon(query: any) {

        if ( query === null || query === undefined ) {
            return { validated: true };
        }

        if (query.hasOwnProperty("q")) {
            if (query.q === null || query.q === undefined || query.q.length < 2 || query.q.length > 20 ) {
                return { validated: false, message: invalidQSearchMessage };
            }
        }

        if (query.hasOwnProperty("pageNumber")) {
            const pageNumber = parseInt(query.pageNumber, 10)
            if (isNaN(pageNumber) || pageNumber != query.pageNumber || pageNumber < 1 || pageNumber > 10000) {
                return { validated: false, message: invalidPageNumberMessage };
            }
        }

        if (query.hasOwnProperty("pageSize")) {
            const pageSize = parseInt(query.pageSize, 10)
            if (isNaN(pageSize) || pageSize != query.pageSize || pageSize < 1 || pageSize > 1000) {
                return { validated: false, message: invalidPageSizeMessage };
            }
        }

        return { validated: true };
    }

    public static validateMovies(query: any) {

        if ( query === null || query === undefined ) {
            return { validated: true };
        }

        const { validated: validatedCommon, message: messageCommon} = this.validateCommon(query);
        if (!validatedCommon) {
            return { validated: false, message: messageCommon };
        }

        if (query.hasOwnProperty("genre")) {
            if (query.genre === null || query.genre === undefined || query.genre.length < 3 || query.genre.length > 20) {
                return { validated: false, message: invalidGenreMessage };
            }
        }

        if (query.hasOwnProperty("year")) {
            const year = parseInt(query.year, 10);
            if (isNaN(year) || year != query.year || year < 1874 || year > (new Date(Date.now()).getFullYear() + 5)) {
                return { validated: false, message: invalidYearMessage};
            }
        }

        if (query.hasOwnProperty("rating")) {
            const rating = parseFloat(query.rating);
            if (isNaN(rating) || rating != query.rating || rating < 0 || rating > 10) {
                return { validated: false, message: invalidRatingMessage};
            }
        }

        if (query.hasOwnProperty("actorId")) {
            const { validated: validatedActorId, message: messageActorId } = this.validateActorId(query.actorId);
            if (!validatedActorId) {
                return { validated: validatedActorId, message: messageActorId};
            }
        }

        return { validated: true };
    }

    public static validateMovieId(movieId: string) {
        let message = "";
        let validated = true;

        if ( movieId === null ||
            movieId === undefined ||
            movieId.length < 7 ||
            movieId.length > 11 ||
            movieId.substring(0,2) !== "tt" ) {
                message = invalidMovieIDMessage;
                validated = false;
        } else {
            const val = parseInt(movieId.substring(2), 10);
            if (isNaN(val) || val <= 0) {
                message = invalidMovieIDMessage;
                validated = false;
            }
        }
        
        return { validated: validated, message: message };
    }

    public static validateActorId(actorId: string) {
        let message = "";
        let validated = true;

        if ( actorId === null ||
            actorId === undefined ||
            actorId.length < 7 ||
            actorId.length > 11 ||
            actorId.substring(0,2) !== "nm" ) {
                message = invalidActorIDMessage;
                validated = false;
        } else {
            const val = parseInt(actorId.substring(2), 10);
            if (isNaN(val) || val <= 0) {
                message = invalidActorIDMessage;
                validated = false;
            }
        }
        
        return { validated: validated, message: message };
    }
}
