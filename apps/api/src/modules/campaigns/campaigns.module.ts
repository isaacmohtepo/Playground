import { Module } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { CampaignsController } from "./campaigns.controller";
import { CampaignsService } from "./campaigns.service";

@Module({
  controllers: [CampaignsController],
  providers: [CampaignsService, PrismaService],
  exports: [CampaignsService]
})
export class CampaignsModule {}
