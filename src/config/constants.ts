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

export const controllerExceptions = {
    actorsControllerException: "ActorsControllerException",
    featuredControllerException: "FeaturedControllerException",
    genresControllerException: "GenresControllerException",
    healthzControllerException: "HealthzControllerException",
    moviesControllerException: "MoviesControllerException"
};
