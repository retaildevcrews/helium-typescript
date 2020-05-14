import { VersionUtilities } from "../utilities/versionUtilities";

export const version = VersionUtilities.getBuildVersion();
export const cosmosUrl = "CosmosUrl";
export const cosmosKey = "CosmosKey";
export const cosmosDatabase = "CosmosDatabase";
export const cosmosCollection = "CosmosCollection";
export const appInsightsKey = "AppInsightsKey";
export const portConstant = "4120";
export const webInstanceRole = "WEBSITE_ROLE_INSTANCE_ID";
export const defaultPageSize = 100;
export const sqlGenres = "SELECT VALUE m.genre FROM m where m.type = 'Genre'";
export const invalidMovieIDMessage = "Invalid Movie ID parameter";
export const invalidActorIDMessage = "Invalid Actor ID parameter";
export const invalidQSearchMessage = "Invalid q (search) parameter";
export const invalidPageNumberMessage = "Invalid PageNumber parameter";
export const invalidPageSizeMessage = "Invalid PageSize parameter"
export const invalidGenreMessage = "Invalid Genre parameter";
export const invalidYearMessage = "Invalid Year parameter";
export const invalidRatingMessage = "Invalid Rating parameter";
