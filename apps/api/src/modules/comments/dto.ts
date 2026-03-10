import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateCommentDto {
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

export class ReplyCommentDto {
  @IsString()
  body!: string;
}

export class ResolveCommentDto {
  @IsBoolean()
  isResolved!: boolean;
}
