import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { validateRequiredField } from '../utils/validation-utils';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateSubCommentDto } from './dto/create-sub-comment.dto';
import { CreateReviewLikeDto } from './dto/create-review-like.dto';
import { DeleteReviewsDto } from './dto/delete-reviews.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}
  @Get()
  getAllReviews(@Query('page') page: string, @Req() req) {
    validateRequiredField('page', page);
    const userId = req.user.id;
    return this.reviewsService.getAllReviews(userId, page);
  }

  @Post('likes')
  likeReview(@Body() createReviewLikeDto: CreateReviewLikeDto, @Req() req) {
    const userId = req.user.id;
    return this.reviewsService.likeReview(userId, createReviewLikeDto);
  }

  @Get('recent')
  getRecentReviews(@Req() req) {
    const userId = req.user.id;
    return this.reviewsService.getRecentReviews(userId);
  }

  @Get(':reviewId/likes')
  getReviewLikes(@Param('reviewId') reviewId: string) {
    return this.reviewsService.getReviewLikes(reviewId);
  }

  @Delete(':reviewId/likes')
  unlikeReview(@Param('reviewId') reviewId: string, @Req() req) {
    const userId = req.user.id;
    return this.reviewsService.unlikeReview(userId, reviewId);
  }

  @Get(':reviewId')
  getReviewById(@Param('reviewId') reviewId: string, @Req() req) {
    const userId = req.user.id;
    return this.reviewsService.getReviewById(userId, reviewId);
  }

  @Delete(':reviewId')
  deleteReview(@Param('reviewId') reviewId: string, @Req() req) {
    const userId = req.user.id;
    return this.reviewsService.deleteReview(userId, reviewId);
  }

  @Delete()
  deleteReviews(@Body() deleteReviewsDto: DeleteReviewsDto, @Req() req) {
    const userId = req.user.id;
    return this.reviewsService.deleteReviews(userId, deleteReviewsDto);
  }

  @Post()
  createDefaultReview(@Body() createReviewDto: CreateReviewDto, @Req() req) {
    const userId = req.user.id;
    return this.reviewsService.createDefaultReview(userId, createReviewDto);
  }

  @Patch(':reviewId')
  updateReview(
    @Param('reviewId') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.reviewsService.updateReview(userId, reviewId, updateReviewDto);
  }

  @Get(':reviewId/text-review')
  getTextReview(@Param('reviewId') reviewId: string, @Req() req) {
    const userId = req.user?.id;
    return this.reviewsService.getTextReview(userId, reviewId);
  }

  @Get(':reviewId/card-review')
  getCardReview(@Param('reviewId') reviewId: string, @Req() req) {
    const userId = req.user.id;
    return this.reviewsService.getCardReview(userId, reviewId);
  }

  @Post('comment')
  createComment(@Body() createCommentDto: CreateCommentDto, @Req() req) {
    const userId = req.user.id;
    return this.reviewsService.createComment(userId, createCommentDto);
  }

  @Post('sub-comment')
  createSubComment(
    @Body() createSubCommentDto: CreateSubCommentDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.reviewsService.createSubComment(userId, createSubCommentDto);
  }

  @Get(':reviewId/comments')
  getAllComments(@Param('reviewId') reviewId: string, @Req() req) {
    const userId = req.user.id;
    return this.reviewsService.getAllComments(userId, reviewId);
  }
}
