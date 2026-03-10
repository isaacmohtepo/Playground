import { IsEmail, IsOptional, IsString } from "class-validator";

export class CreateClientDto {
  @IsString()
  name!: string;

  @IsString()
  company!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;
}
