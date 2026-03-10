import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CommentAuthorType } from "@prisma/client";
import { CurrentUser, CurrentUserPayload } from "../../common/current-user.decorator";
import { JwtAuthGuard } from "../../common/jwt-auth.guard";
import { CreateCommentDto, ReplyCommentDto, ResolveCommentDto } from "./dto";
import { CommentsService } from "./comments.service";

@Controller("comments")
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get("version/:versionId")
  listByVersion(@Param("versionId") versionId: string) {
    return this.commentsService.listByVersion(versionId);
  }

  @Post("version/:versionId")
  create(
    @Param("versionId") versionId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: CurrentUserPayload
  ) {
    return this.commentsService.createOnVersion(versionId, dto, {
      type: CommentAuthorType.AGENCY_USER,
      userId: user.sub,
      email: user.email
    });
  }

  @Post(":commentId/reply")
  reply(@Param("commentId") commentId: string, @Body() dto: ReplyCommentDto, @CurrentUser() user: CurrentUserPayload) {
    return this.commentsService.reply(commentId, dto, {
      type: CommentAuthorType.AGENCY_USER,
      userId: user.sub,
      email: user.email
    });
  }

  @Patch(":commentId/resolve")
  resolve(@Param("commentId") commentId: string, @Body() dto: ResolveCommentDto) {
    return this.commentsService.resolve(commentId, dto.isResolved);
  }
}
