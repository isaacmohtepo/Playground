import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/auth.module";
import { PrismaService } from "./common/prisma.service";
import { ClientsModule } from "./modules/clients/clients.module";
import { CampaignsModule } from "./modules/campaigns/campaigns.module";
import { AssetsModule } from "./modules/assets/assets.module";
import { CommentsModule } from "./modules/comments/comments.module";
import { ReviewModule } from "./modules/review/review.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ClientsModule,
    CampaignsModule,
    AssetsModule,
    CommentsModule,
    ReviewModule,
    NotificationsModule
  ],
  providers: [PrismaService]
})
export class AppModule {}
