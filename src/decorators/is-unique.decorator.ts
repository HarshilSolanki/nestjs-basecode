import { Injectable } from "@nestjs/common"
import { ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from "class-validator"
import { EntityManager } from "typeorm"

@ValidatorConstraint({ name: 'IsUniqueConstraint', async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {

    constructor(private readonly entityManager: EntityManager) { }

    async validate(value: any, args?: ValidationArguments): Promise<boolean> {
        const { tableName, column }: IsUniqeInterface = args.constraints[0]
        const dataExist = await this.entityManager.getRepository(tableName)
            .createQueryBuilder(tableName)
            .where({ [column]: value })
            .getExists()

        return !dataExist
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        const field: string = validationArguments.property
        return `${field} is already exist`
    }
}

export type IsUniqeInterface = {
    tableName: string,
    column: string
}

export function isUnique(options: IsUniqeInterface, validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'isUnique',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [options],
            validator: IsUniqueConstraint,
        })
    }
}