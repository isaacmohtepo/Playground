import { ApprovalState, AssetKind } from "@prisma/client";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateAssetDto {
  @IsString()
  campaignId!: string;

  @IsString()
  title!: string;

  @IsEnum(AssetKind)
  kind!: AssetKind;
}

export class CreateAssetVersionDto {
  @IsInt()
  @Min(1)
  versionNum!: number;

  @IsString()
  fileUrl!: string;

  @IsOptional()
  @IsString()
  thumbUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(ApprovalState)
  state?: ApprovalState;
}

export class CreateReviewLinkDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  expiresInDays?: number;
}

export class ApproveVersionDto {
  @IsEnum(ApprovalState)
  state!: ApprovalState;

  @IsOptional()
  @IsString()
  note?: string;
}
