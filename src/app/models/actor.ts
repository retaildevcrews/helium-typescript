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
import { IValidatable } from "./ivalidatable";
import { Movie } from "./movie";

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
export class Actor implements IValidatable {

    @IsNotEmpty()
    @IsAlphanumeric()
    public id: string;

    @IsNotEmpty()
    @IsAlphanumeric()
    public actorId: string;

    @ValidateIf((x) => x.name !== undefined)
    @IsEqualToProperty("name", (x) => (x as string).toLowerCase(),
        {
            message: (args: ValidationArguments) => {
                if ((args.object as Actor).name !== undefined) {
                    return `textSearch must be equal to ${(args.object as Actor).name.toLowerCase()}`;
                } else {
                    return `textSearch must equal the lowercased version of the object's ${args.targetName} property`;
                }
            },
        })
    @IsLowercase()
    public textSearch: string;

    @IsNotEmpty()
    @NotEquals((x) => x.trim.length() > 0)
    public name: string;

    @Equals("Actor")
    public type: string;

    @IsNotEmpty()
    @NotEquals((x) => x.trim.length() > 0)
    public partitionKey: string;

    public birthYear?: number;
    public deathYear?: number;
    public profession?: string[];
    public movies?: Movie[];

    constructor(data: any) {
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

    public validate(): Promise<ValidationError[]> {
        return validate(this);
    }
}
