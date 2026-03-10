import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { PublicApproveDto, PublicCommentDto, PublicReplyDto } from "./dto";
import { ReviewService } from "./review.service";

@Controller("review")
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get(":token")
  getByToken(@Param("token") token: string) {
    return this.reviewService.getByToken(token);
  }

  @Post(":token/comments")
  comment(@Param("token") token: string, @Body() dto: PublicCommentDto) {
    return this.reviewService.comment(token, dto);
  }

  @Post(":token/comments/:commentId/reply")
  reply(@Param("token") token: string, @Param("commentId") commentId: string, @Body() dto: PublicReplyDto) {
    return this.reviewService.reply(token, commentId, dto);
  }

  @Post(":token/approve")
  approve(@Param("token") token: string, @Body() dto: PublicApproveDto) {
    return this.reviewService.approve(token, dto);
  }
}
