/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, IsInt } from "class-validator";
import { PartialType, ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly lastName: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly docType: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly docNumber: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly miTest: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly miTest2: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsInt({ each: true })
    @Type(() => Number)
    @ApiProperty({ type: [Number] })
    readonly roleIds: number[];
}
export class UpdateUserDto extends PartialType(CreateUserDto) { }