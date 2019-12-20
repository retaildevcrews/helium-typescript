import { ValidationError } from "class-validator";

// This validation uses the class-validator npm package
// Documentation can be found here https://github.com/typestack/class-validator
export interface IValidatable {
    validate(): Promise<ValidationError[]>;
}
