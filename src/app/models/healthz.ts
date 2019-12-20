import { instanceRoleConstant } from "../../config/constants";

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     HealthzSuccessDetails:
 *       type: object
 *       required:
 *         - status
 *         - actors
 *         - movies
 *         - genres
 *         - instance
 *         - version
 *       properties:
 *         status:
 *           type: number
 *         actors:
 *           type: number
 *         movies:
 *           type: number
 *         genres:
 *           type: number
 *         instance:
 *           type: string
 *         version:
 *           type: string
 */
export class HealthzSuccessDetails {

    public status: number = 200;

    public actors: number;

    public movies: number;

    public genres: number;

    public instance: string;

    // TODO DYNAMIC
    public version: string = "1.0.0";

    constructor() {
        const instanceId = process.env[instanceRoleConstant];
        this.instance = !instanceId ? "unknown" : instanceId;
    }
}

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     SuccessDetails:
 *       type: object
 *       required:
 *         - cosmosDb
 *       properties:
 *         cosmosDb:
 *           $ref: '#/components/schemas/CosmosDbSuccess'
 */
export class SuccessDetails {
    public cosmosDb: CosmosDbSuccess = new CosmosDbSuccess();
}

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     HealthzSuccess:
 *       type: object
 *       required:
 *         - status
 *         - details
 *       properties:
 *         status:
 *           type: string
 *         details:
 *           $ref: '#/components/schemas/SuccessDetails'
 */
export class HealthzSuccess {
    public status: string = "UP";
    public details: SuccessDetails = new SuccessDetails();
}

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     HealthzError:
 *       type: object
 *       required:
 *         - status
 *         - details
 *       properties:
 *         status:
 *           type: string
 *         details:
 *           $ref: '#/components/schemas/ErrorDetails'
 */
export class HealthzError {
    public status: string = "DOWN";
    public details: ErrorDetails = new ErrorDetails();
}

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     ErrorDetails:
 *       type: object
 *       required:
 *         - cosmosDb
 *       properties:
 *         cosmosDb:
 *           $ref: '#/components/schemas/CosmosDbError'
 */
export class ErrorDetails {
    public cosmosDb: CosmosDbError = new CosmosDbError();
}

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     CosmosDbSuccess:
 *       type: object
 *       required:
 *         - status
 *         - details
 *       properties:
 *         status:
 *           type: string
 *         details:
 *           $ref: '#/components/schemas/HealthzSuccessDetails'
 */
export class CosmosDbSuccess {
    public status: string = "UP";
    public details: HealthzSuccessDetails = new HealthzSuccessDetails();
}

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     CosmosDbError:
 *       type: object
 *       required:
 *         - status
 *         - details
 *       properties:
 *         status:
 *           type: string
 *         details:
 *           $ref: '#/components/schemas/HealthzErrorDetails'
 */
export class CosmosDbError {
    public status: string = "DOWN";
    public details: HealthzErrorDetails = new HealthzErrorDetails();
}

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     HealthzErrorDetails:
 *       type: object
 *       required:
 *         - status
 *         - error
 *       properties:
 *         status:
 *           type: string
 *         details:
 *           type: string
 */
export class HealthzErrorDetails {
    public status: number = 503;
    public error: string = "";
}
