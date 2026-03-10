import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ApprovalState, CommentAuthorType, NotificationType } from "@prisma/client";
import { PrismaService } from "../../common/prisma.service";
import { CommentsService } from "../comments/comments.service";
import { NotificationsService } from "../notifications/notifications.service";
import { PublicApproveDto, PublicCommentDto, PublicReplyDto } from "./dto";

@Injectable()
export class ReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commentsService: CommentsService,
    private readonly notificationsService: NotificationsService
  ) {}

  async getByToken(token: string) {
    const link = await this.validateLink(token);
    const asset = await this.prisma.creativeAsset.findUnique({
      where: { id: link.assetId },
      include: {
        campaign: {
          include: {
            client: true
          }
        },
        versions: {
          orderBy: {
            versionNum: "desc"
          }
        }
      }
    });
    if (!asset) {
      throw new NotFoundException("Pieza no encontrada");
    }
    const latestVersion = asset.versions[0];
    const comments = latestVersion ? await this.commentsService.listByVersion(latestVersion.id) : [];

    return {
      asset,
      latestVersion,
      comments
    };
  }

  async comment(token: string, dto: PublicCommentDto) {
    const link = await this.validateLink(token);
    const latestVersion = await this.getLatestVersion(link.assetId);
    return this.commentsService.createOnVersion(
      latestVersion.id,
      {
        body: dto.body,
        x: dto.x,
        y: dto.y,
        timestampSec: dto.timestampSec
      },
      {
        type: CommentAuthorType.CLIENT_PUBLIC,
        name: dto.name,
        email: dto.email
      }
    );
  }

  async reply(token: string, commentId: string, dto: PublicReplyDto) {
    await this.validateLink(token);
    return this.commentsService.reply(
      commentId,
      {
        body: dto.body
      },
      {
        type: CommentAuthorType.CLIENT_PUBLIC,
        name: dto.name,
        email: dto.email
      }
    );
  }

  async approve(token: string, dto: PublicApproveDto) {
    const link = await this.validateLink(token);
    const latestVersion = await this.getLatestVersion(link.assetId);

    const approval = await this.prisma.approval.create({
      data: {
        assetId: link.assetId,
        versionId: latestVersion.id,
        approverName: dto.name,
        approverEmail: dto.email,
        state: dto.state,
        note: dto.note
      }
    });

    await this.prisma.assetVersion.update({
      where: { id: latestVersion.id },
      data: { state: dto.state }
    });

    await this.prisma.creativeAsset.update({
      where: { id: link.assetId },
      data: { currentState: dto.state }
    });

    if (dto.state === ApprovalState.APPROVED) {
      const asset = await this.prisma.creativeAsset.findUnique({
        where: { id: link.assetId },
        include: {
          campaign: {
            include: {
              client: true
            }
          }
        }
      });

      if (asset) {
        await this.notificationsService.enqueue(NotificationType.ASSET_APPROVED, asset.campaign.client.email, {
          assetId: asset.id,
          versionId: latestVersion.id,
          approvedBy: dto.email
        });
      }
    }

    return approval;
  }

  private async validateLink(token: string) {
    const link = await this.prisma.reviewLink.findUnique({ where: { token } });
    if (!link || !link.isActive) {
      throw new NotFoundException("Link de revisión inválido");
    }
    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new ForbiddenException("Link de revisión expirado");
    }
    return link;
  }

  private async getLatestVersion(assetId: string) {
    const latestVersion = await this.prisma.assetVersion.findFirst({
      where: { assetId },
      orderBy: {
        versionNum: "desc"
      }
    });
    if (!latestVersion) {
      throw new NotFoundException("Esta pieza no tiene versiones");
    }
    return latestVersion;
  }
}
