import { VersionUtilities } from "../utilities/versionUtilities";

export const buildVersion = VersionUtilities.getBuildVersion();
export const swaggerVersion = VersionUtilities.getSwaggerVersion();
export const cosmosUrl = "CosmosUrl";
export const cosmosKey = "CosmosKey";
export const cosmosDatabase = "CosmosDatabase";
export const cosmosCollection = "CosmosCollection";
export const appInsightsKey = "AppInsightsKey";
export const portConstant = "4120";
export const gracefulShutdownTimeout = 10000;
export const webInstanceRole = "WEBSITE_ROLE_INSTANCE_ID";
export const defaultPageSize = 100;
export const sqlGenres = "SELECT VALUE m.genre FROM m where m.type = 'Genre'";
export const queryErrorMessages = {
    invalidMovieIDMessage: "The parameter 'movieId' should start with 'tt' and be between 7 and 11 characters in total.",
    invalidActorIDMessage: "The parameter 'actorId' should start with 'nm' and be between 7 and 11 characters in total.",
    invalidQSearchMessage: "The parameter 'q' should be between 2 and 20 characters.",
    invalidPageNumberMessage: "The parameter 'pageNumber' should be between 1 and 10000.",
    invalidPageSizeMessage: "The parameter 'pageSize' should be between 1 and 1000.",
    invalidGenreMessage: "The parameter 'genre' should be between 3 and 20 characters.",
    invalidYearMessage: "The parameter 'year' should be between 1874 and {Current Year + 5}.",
    invalidRatingMessage: "The parameter 'rating' should be between 0.0 and 10.0."
};

export const queryErrorTypes = {
    actorQuery: "https://github.com/retaildevcrews/helium/blob/main/docs/ParameterValidation.md#actors",
    movieQuery: "https://github.com/retaildevcrews/helium/blob/main/docs/ParameterValidation.md#movies",
    movieDirectRead: "https://github.com/retaildevcrews/helium/blob/main/docs/ParameterValidation.md#direct-read",
    actorDirectRead: "https://github.com/retaildevcrews/helium/blob/main/docs/ParameterValidation.md#direct-read-1"
};

export const controllerExceptions = {
    actorsControllerException: "ActorsControllerException",
    featuredControllerException: "FeaturedControllerException",
    genresControllerException: "GenresControllerException",
    healthzControllerException: "HealthzControllerException",
    moviesControllerException: "MoviesControllerException"
};
