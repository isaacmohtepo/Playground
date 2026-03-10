import { Injectable, NotFoundException } from "@nestjs/common";
import { CommentAuthorType, NotificationType, Prisma } from "@prisma/client";
import { PrismaService } from "../../common/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateCommentDto, ReplyCommentDto } from "./dto";

interface CommentAuthorContext {
  type: CommentAuthorType;
  userId?: string;
  name?: string;
  email?: string;
}

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
  ) {}

  async listByVersion(versionId: string) {
    const comments = await this.prisma.comment.findMany({
      where: {
        versionId,
        parentId: null
      },
      include: {
        replies: {
          orderBy: {
            createdAt: "asc"
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    return comments;
  }

  async createOnVersion(versionId: string, dto: CreateCommentDto, author: CommentAuthorContext) {
    const version = await this.prisma.assetVersion.findUnique({
      where: { id: versionId },
      include: {
        asset: {
          include: {
            campaign: {
              include: {
                client: true
              }
            }
          }
        }
      }
    });
    if (!version) {
      throw new NotFoundException("Versión no encontrada");
    }

    const data: Prisma.CommentCreateInput = {
      body: dto.body,
      x: dto.x,
      y: dto.y,
      timestampSec: dto.timestampSec,
      authorType: author.type,
      authorName: author.name,
      authorEmail: author.email,
      version: { connect: { id: versionId } },
      authorUser: author.userId ? { connect: { id: author.userId } } : undefined
    };

    const comment = await this.prisma.comment.create({ data });

    await this.notificationsService.enqueue(NotificationType.NEW_COMMENT, version.asset.campaign.client.email, {
      versionId,
      assetId: version.assetId,
      commentId: comment.id,
      body: comment.body
    });

    return comment;
  }

  async reply(commentId: string, dto: ReplyCommentDto, author: CommentAuthorContext) {
    const parent = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        version: {
          include: {
            asset: {
              include: {
                campaign: {
                  include: {
                    client: true
                  }
                }
              }
            }
          }
        }
      }
    });
    if (!parent) {
      throw new NotFoundException("Comentario no encontrado");
    }

    const data: Prisma.CommentCreateInput = {
      body: dto.body,
      x: parent.x,
      y: parent.y,
      timestampSec: parent.timestampSec,
      authorType: author.type,
      authorName: author.name,
      authorEmail: author.email,
      parent: { connect: { id: commentId } },
      version: { connect: { id: parent.versionId } },
      authorUser: author.userId ? { connect: { id: author.userId } } : undefined
    };

    const reply = await this.prisma.comment.create({ data });

    await this.notificationsService.enqueue(NotificationType.NEW_COMMENT, parent.version.asset.campaign.client.email, {
      versionId: parent.versionId,
      assetId: parent.version.assetId,
      commentId: reply.id,
      isReply: true
    });

    return reply;
  }

  async resolve(commentId: string, isResolved: boolean) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException("Comentario no encontrado");
    }
    return this.prisma.comment.update({
      where: { id: commentId },
      data: { isResolved }
    });
  }
}
