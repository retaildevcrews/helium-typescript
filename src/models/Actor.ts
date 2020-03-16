import { Movie } from "./Movie";

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     Actor:
 *       type: object
 *       required:
 *         - id
 *         - actorId
 *         - textSearch
 *         - name
 *         - type
 *         - partitionKey
 *       properties:
 *         id:
 *           type: string
 *         actorId:
 *           type: string
 *         textSearch:
 *           type: string
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum:
 *             - Actor
 *         partitionKey:
 *           type: string
 *         birthYear:
 *           type: number
 *         deathYear:
 *           type: number
 *         profession:
 *           type: array
 *           items:
 *             type: string
 *         movies:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Movie'
 */
export class Actor {

    public id: string;
    public actorId: string;
    public name: string;
    public textSearch: string;
    public type: string;
    public partitionKey: string;
    public birthYear?: number;
    public deathYear?: number;
    public profession?: string[];
    public movies?: Movie[];

    constructor(data?: any) {
        if (data) {
            this.id = data.id;
            this.actorId = data.actorId;
            this.name = data.name;
            this.textSearch = data.textSearch;
            this.type = data.type;
            this.partitionKey = data.partitionKey;
            this.birthYear = data.birthYear;
            this.deathYear = data.deathYear;
            this.profession = data.profession;
            this.movies = data.movies;
        }
    }
}
