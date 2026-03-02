/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, IsInt } from "class-validator";
import { PartialType, ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly description: string;
}
export class UpdateRoleDto extends PartialType(CreateRoleDto) { }