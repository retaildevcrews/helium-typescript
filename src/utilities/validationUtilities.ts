import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

/**
 *
 * @param property The name of the object's property that will be compared against the decorated property
 * @param modifier Optional function that is used to modify the value of the property passed to the decorator
 * @param validationOptions Options used to pass to validation decorators
 */
export function IsEqualToProperty(
    property: string,
    modifier?: (value: any) => any,
    validationOptions?: ValidationOptions) {
    return (object: object, propertyName: string) => {
        registerDecorator({
            constraints: [property],
            name: "isEqualToProperty",
            options: validationOptions,
            propertyName,
            target: object.constructor,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const [relatedPropertyName]: any = args.constraints; // object being validated
                    const relatedValue: any = (args.object as any)[relatedPropertyName];
                    return typeof value === typeof relatedValue
                        && value === (modifier !== undefined ? modifier(relatedValue) : relatedValue);
                },
            },
        });
    };
}
