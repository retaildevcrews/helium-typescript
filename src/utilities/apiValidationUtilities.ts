import { queryErrorTypes } from "../config/constants";
import * as HttpStatus from "http-status-codes";
import { ParameterValidationUtilities } from "./parameterValidationUtilities";

// utilities for validating API call responses.
export class APIValidationUtilities {

    public static buildQueryString(prefix: string, query: any) {

        let output = prefix;
        for (var key in query) {
            if (query.hasOwnProperty(key)) {
              output = output + key + "=" + query[key] + "&";
            }
        }
        //console.log(query);
        return output.substring(0, output.length-1);
    }

    // validate common parameters
    public static validateActors(query: any) {

        if ( query === null || query === undefined ) {
            return { validated: true };
        }

        let foundActorQueryError = false;

        const queryString = APIValidationUtilities.buildQueryString("/api/actors?", query);

        var errorResponse = {
            "type": queryErrorTypes.actorQuery,
            "title": "Parameter validation error",
            "status": HttpStatus.BAD_REQUEST,
            "detail": "One or more invalid parameters were specified.",
            "instance": queryString, //"/api/actors?q=a&pageSize=99999",
            "validationErrors": []
        };


        const { validated: validatedQ, message: messageQ } = ParameterValidationUtilities.validateQ(query);
        const { validated: validatedPN, message: messagePN } = ParameterValidationUtilities.validatePageNumber(query);
        const { validated: validatedPS, message: messagePS } = ParameterValidationUtilities.validatePageSize(query);

        if (!validatedQ) {
            errorResponse["validationErrors"].push(messageQ);
            foundActorQueryError = true;
        }
        if (!validatedPN) {
            errorResponse["validationErrors"].push(messagePN);
            foundActorQueryError = true;
        }
        if (!validatedPS) {
            errorResponse["validationErrors"].push(messagePS);
            foundActorQueryError = true;
        }

        if (foundActorQueryError){
            return { validated: false, errorResponse: errorResponse};
        }

        return { validated: true};
    }

    // validate movie-specific parameters
    public static validateMovies(query: any) {

        if ( query === null || query === undefined ) {
            return { validated: true };
        }

        let foundMovieQueryError = false;

        const queryString = APIValidationUtilities.buildQueryString("/api/movies?", query);

        var errorResponse = {
            "type": queryErrorTypes.movieQuery,
            "title": "Parameter validation error",
            "status": HttpStatus.BAD_REQUEST,
            "detail": "One or more invalid parameters were specified.",
            "instance": queryString, 
            "validationErrors": []
        };


        const { validated: validatedQ, message: messageQ } = ParameterValidationUtilities.validateQ(query);
        const { validated: validatedPN, message: messagePN } = ParameterValidationUtilities.validatePageNumber(query);
        const { validated: validatedPS, message: messagePS } = ParameterValidationUtilities.validatePageSize(query);
        const { validated: validatedG, message: messageG } = ParameterValidationUtilities.validateGenre(query);
        const { validated: validatedY, message: messageY } = ParameterValidationUtilities.validateYear(query);
        const { validated: validatedR, message: messageR } = ParameterValidationUtilities.validateRating(query);

        if (!validatedQ) {
            errorResponse["validationErrors"].push(messageQ);
            foundMovieQueryError = true;
        }
        if (!validatedPN) {
            errorResponse["validationErrors"].push(messagePN);
            foundMovieQueryError = true;
        }
        if (!validatedPS) {
            errorResponse["validationErrors"].push(messagePS);
            foundMovieQueryError = true;
        }
        if (!validatedG) {
            errorResponse["validationErrors"].push(messageG);
            foundMovieQueryError = true;
        }
        if (!validatedY) {
            errorResponse["validationErrors"].push(messageY);
            foundMovieQueryError = true;
        }
        if (!validatedR) {
            errorResponse["validationErrors"].push(messageR);
            foundMovieQueryError = true;
        }

        if ("actorId" in query) {
            const { validated: validatedActorId, message: messageActorId } = ParameterValidationUtilities.validateActorId(query.actorId);
            if (!validatedActorId) {
                errorResponse["validationErrors"].push(messageActorId);
                foundMovieQueryError = true;
            }
        }

        if (foundMovieQueryError){
            return { validated: false, errorResponse: errorResponse};
        }

        return { validated: true};
    }

    public static validateMovieId(movieId: string) {
        
        let foundMovieQueryError = false;

        var errorResponse = {
            "type": queryErrorTypes.movieDirectRead,
            "title": "Parameter validation error",
            "status": HttpStatus.BAD_REQUEST,
            "detail": "One or more invalid parameters were specified.",
            "instance": movieId, 
            "validationErrors": []
        };

        const { validated: validatedMovieId, message: messageMovieId } = ParameterValidationUtilities.validateMovieId(movieId);

        if (!validatedMovieId) {
            errorResponse["validationErrors"].push(messageMovieId);
            foundMovieQueryError = true;
        }

        if (foundMovieQueryError){
            return { validated: false, errorResponse: errorResponse};
        }
        
        return { validated: true };
    }

    public static validateActorId(actorId: string) {
        
        let foundActorQueryError = false;

        var errorResponse = {
            "type": queryErrorTypes.actorDirectRead,
            "title": "Parameter validation error",
            "status": HttpStatus.BAD_REQUEST,
            "detail": "One or more invalid parameters were specified.",
            "instance": actorId, 
            "validationErrors": []
        };

        const { validated: validatedActorId, message: messageActorId } = ParameterValidationUtilities.validateActorId(actorId);

        if (!validatedActorId) {
            errorResponse["validationErrors"].push(messageActorId);
            foundActorQueryError = true;
        }

        if (foundActorQueryError){
            return { validated: false, errorResponse: errorResponse};
        }
        
        return { validated: true };
    }
}
