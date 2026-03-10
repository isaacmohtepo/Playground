import { Module } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { CommentsModule } from "../comments/comments.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { ReviewController } from "./review.controller";
import { ReviewService } from "./review.service";

@Module({
  imports: [CommentsModule, NotificationsModule],
  controllers: [ReviewController],
  providers: [ReviewService, PrismaService]
})
export class ReviewModule {}
