import { Module } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { NotificationsModule } from "../notifications/notifications.module";
import { AssetsController } from "./assets.controller";
import { AssetsService } from "./assets.service";

@Module({
  imports: [NotificationsModule],
  controllers: [AssetsController],
  providers: [AssetsService, PrismaService],
  exports: [AssetsService]
})
export class AssetsModule {}
