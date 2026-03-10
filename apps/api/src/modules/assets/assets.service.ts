import { Injectable, NotFoundException } from "@nestjs/common";
import { ApprovalState, NotificationType } from "@prisma/client";
import { randomBytes } from "crypto";
import { PrismaService } from "../../common/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { ApproveVersionDto, CreateAssetDto, CreateAssetVersionDto, CreateReviewLinkDto } from "./dto";

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
  ) {}

  list(campaignId?: string) {
    return this.prisma.creativeAsset.findMany({
      where: campaignId ? { campaignId } : undefined,
      include: {
        campaign: true,
        versions: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  async getById(id: string) {
    const asset = await this.prisma.creativeAsset.findUnique({
      where: { id },
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
        },
        reviewLinks: true
      }
    });
    if (!asset) {
      throw new NotFoundException("Pieza no encontrada");
    }
    return asset;
  }

  create(dto: CreateAssetDto) {
    return this.prisma.creativeAsset.create({
      data: dto
    });
  }

  async createVersion(assetId: string, dto: CreateAssetVersionDto) {
    await this.ensureAsset(assetId);
    const version = await this.prisma.assetVersion.create({
      data: {
        ...dto,
        assetId
      }
    });

    const asset = await this.prisma.creativeAsset.update({
      where: { id: assetId },
      data: {
        currentState: dto.state ?? ApprovalState.PENDING_REVIEW
      },
      include: {
        campaign: {
          include: {
            client: true
          }
        }
      }
    });

    await this.notificationsService.enqueue(NotificationType.NEW_VERSION, asset.campaign.client.email, {
      assetId,
      versionId: version.id,
      versionNum: version.versionNum,
      title: asset.title
    });

    return version;
  }

  async getVersion(assetId: string, versionId: string) {
    const version = await this.prisma.assetVersion.findFirst({
      where: {
        id: versionId,
        assetId
      },
      include: {
        asset: {
          include: {
            campaign: {
              include: {
                client: true
              }
            }
          }
        },
        approvals: {
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    });
    if (!version) {
      throw new NotFoundException("Versión no encontrada");
    }
    return version;
  }

  async createReviewLink(assetId: string, dto: CreateReviewLinkDto) {
    await this.ensureAsset(assetId);
    const token = randomBytes(24).toString("hex");
    const expiresAt = dto.expiresInDays
      ? new Date(Date.now() + dto.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const link = await this.prisma.reviewLink.create({
      data: {
        assetId,
        token,
        expiresAt
      }
    });

    return {
      ...link,
      publicUrl: `${process.env.APP_URL ?? "http://localhost:3000"}/review/${token}`
    };
  }

  async approveVersion(assetId: string, versionId: string, dto: ApproveVersionDto, approver: { userId: string; name?: string; email?: string }) {
    const version = await this.getVersion(assetId, versionId);

    const approval = await this.prisma.approval.create({
      data: {
        assetId,
        versionId,
        approverUserId: approver.userId,
        approverName: approver.name,
        approverEmail: approver.email,
        state: dto.state,
        note: dto.note
      }
    });

    await this.prisma.assetVersion.update({
      where: { id: version.id },
      data: { state: dto.state }
    });

    await this.prisma.creativeAsset.update({
      where: { id: assetId },
      data: { currentState: dto.state }
    });

    if (dto.state === ApprovalState.APPROVED) {
      await this.notificationsService.enqueue(NotificationType.ASSET_APPROVED, version.asset.campaign.client.email, {
        assetId,
        versionId,
        title: version.asset.title
      });
    }

    return approval;
  }

  private async ensureAsset(assetId: string) {
    const asset = await this.prisma.creativeAsset.findUnique({ where: { id: assetId } });
    if (!asset) {
      throw new NotFoundException("Pieza no encontrada");
    }
    return asset;
  }
}
