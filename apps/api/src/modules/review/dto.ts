import { ApprovalState } from "@prisma/client";
import { IsEmail, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class PublicCommentDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  body!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  x!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  y!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  timestampSec?: number;
}

export class PublicReplyDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  body!: string;
}

export class PublicApproveDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsEnum(ApprovalState)
  state!: ApprovalState;

  @IsOptional()
  @IsString()
  note?: string;
}
