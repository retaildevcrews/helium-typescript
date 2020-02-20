import {
    Equals,
    IsAlphanumeric,
    IsLowercase,
    IsNotEmpty,
    NotEquals,
    validate,
    ValidateIf,
    ValidationArguments,
    ValidationError,
} from "class-validator";
import { IsEqualToProperty } from "../../utilities/validationUtilities";
import { Actor } from "./actor";
import { IValidatable } from "./ivalidatable";

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     Movie:
 *       type: object
 *       required:
 *         - id
 *         - movieId
 *         - textSearch
 *         - title
 *         - type
 *         - partitionKey
 *       properties:
 *         id:
 *           type: string
 *         movieId:
 *           type: string
 *         textSearch:
 *           type: string
 *         title:
 *           type: string
 *         type:
 *           type: string
 *           enum:
 *             - Movie
 *         partitionKey:
 *           type: string
 *         year:
 *           type: number
 *         runtime:
 *           type: number
 *         rating:
 *           type: number
 *         votes:
 *           type: number
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *         roles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Actor'
 */
export class Movie implements IValidatable {

    @IsNotEmpty()
    @IsAlphanumeric()
    public id: string;

    @IsNotEmpty()
    @IsAlphanumeric()
    public movieId: string;

    @ValidateIf((x) => x.title !== undefined)
    @IsEqualToProperty("title", (x) => (x as string).toLowerCase(),
        {
            message: (args: ValidationArguments) => {
                if ((args.object as Movie).title !== undefined) {
                    return `textSearch must be equal to ${(args.object as Movie).title.toLowerCase()}`;
                } else {
                    return `textSearch must equal the lowercased version of the object's ${args.targetName} property`;
                }
            },
        })
    @IsLowercase()
    public textSearch: string;

    @IsNotEmpty()
    @NotEquals((x) => x.trim.length() > 0)
    public title: string;

    @Equals("Movie")
    public type: string = "Movie";

    @IsNotEmpty()
    @NotEquals((x) => x.trim.length() > 0)
    public partitionKey: string;

    public year?: number;
    public runtime?: number;
    public rating?: number;
    public votes?: number;
    public totalScore?: number;
    public genres?: string[];
    public roles?: Actor[];

    constructor(data?: any) {
        if (data) {
            this.id = data.id;
            this.movieId = data.movieId;
            this.title = data.title;
            this.textSearch = data.textSearch;
            this.type = data.type;
            this.partitionKey = data.partitionKey;
            this.year = data.year;
            this.runtime = data.runtime;
            this.rating = data.rating;
            this.votes = data.votes;
            this.totalScore = data.totalScore;
            this.genres = data.genres;
            this.roles = data.roles;
        }
    }

    public validate(): Promise<ValidationError[]> {
        return validate(this);
    }
}
