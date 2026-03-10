import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/jwt-auth.guard";
import { CampaignsService } from "./campaigns.service";
import { CreateCampaignDto } from "./dto";

@Controller("campaigns")
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  list(@Query("clientId") clientId?: string) {
    return this.campaignsService.list(clientId);
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.campaignsService.getById(id);
  }

  @Post()
  create(@Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(dto);
  }
}
