import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser, CurrentUserPayload } from "../../common/current-user.decorator";
import { JwtAuthGuard } from "../../common/jwt-auth.guard";
import { ApproveVersionDto, CreateAssetDto, CreateAssetVersionDto, CreateReviewLinkDto } from "./dto";
import { AssetsService } from "./assets.service";

@Controller("assets")
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  list(@Query("campaignId") campaignId?: string) {
    return this.assetsService.list(campaignId);
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.assetsService.getById(id);
  }

  @Post()
  create(@Body() dto: CreateAssetDto) {
    return this.assetsService.create(dto);
  }

  @Post(":id/versions")
  createVersion(@Param("id") id: string, @Body() dto: CreateAssetVersionDto) {
    return this.assetsService.createVersion(id, dto);
  }

  @Get(":id/versions/:versionId")
  getVersion(@Param("id") id: string, @Param("versionId") versionId: string) {
    return this.assetsService.getVersion(id, versionId);
  }

  @Post(":id/review-links")
  createReviewLink(@Param("id") id: string, @Body() dto: CreateReviewLinkDto) {
    return this.assetsService.createReviewLink(id, dto);
  }

  @Post(":id/versions/:versionId/approve")
  approveVersion(
    @Param("id") id: string,
    @Param("versionId") versionId: string,
    @Body() dto: ApproveVersionDto,
    @CurrentUser() user: CurrentUserPayload
  ) {
    return this.assetsService.approveVersion(id, versionId, dto, {
      userId: user.sub,
      email: user.email
    });
  }
}
