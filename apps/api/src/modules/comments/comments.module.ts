import { Module } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { NotificationsModule } from "../notifications/notifications.module";
import { CommentsController } from "./comments.controller";
import { CommentsService } from "./comments.service";

@Module({
  imports: [NotificationsModule],
  controllers: [CommentsController],
  providers: [CommentsService, PrismaService],
  exports: [CommentsService]
})
export class CommentsModule {}
