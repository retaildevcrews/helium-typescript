export const apiPrefix: string = "/api";
export const integrationServer: string =  process.env.integration_server_url;

export const keyVaultName = "KeyVaultName";
export const cosmosUrl = "CosmosUrl";
export const cosmosKey = "CosmosKey";
export const cosmosDatabase = "CosmosDatabase";
export const cosmosCollection = "CosmosCollection";
export const appInsightsKey = "AppInsightsKey";

export const healthResult = "Movies: 100\r\nActors: 531\r\nGenres: 19";
export const healthzError = "Healthz Failed:\r\n{0}";

export const portConstant = "4120";

export const instanceRoleConstant = "WEBSITE_ROLE_INSTANCE_ID";

export const defaultPageSize = 100;
export const maxPageSize = 1000;

// Used in controllers - Note: Must be type Any so we can return the string in GET API calls.
export const actorDoesNotExistError: any = "An Actor with that ID does not exist";
export const movieDoesNotExistError: any = "A Movie with that ID does not exist";
