import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { validateRequiredField } from '../utils/validation-utils';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateSubCommentDto } from './dto/create-sub-comment.dto';
import { CreateReviewLikeDto } from './dto/create-review-like.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}
  @Get()
  getAllReviews(@Query('page') page: number) {
    validateRequiredField('page', page);
    const userId = '66b4b5d2f9415815acd65e6a';
    return this.reviewsService.getAllReviews(userId, page);
  }

  @Post('likes')
  likeReview(@Body() createReviewLikeDto: CreateReviewLikeDto) {
    const userId = '64dcc0e7f001b623d8a71ba2';
    return this.reviewsService.likeReview(userId, createReviewLikeDto);
  }

  @Get(':reviewId/likes')
  getReviewLikes(@Param('reviewId') reviewId: string) {
    return this.reviewsService.getReviewLikes(reviewId);
  }

  @Get(':reviewId')
  getReviewById(@Param('reviewId') reviewId: string) {
    const userId = '66b4b5d2f9415815acd65e6a';
    return this.reviewsService.getReviewById(userId, reviewId);
  }

  @Delete(':reviewId')
  deleteReview(@Param('reviewId') reviewId: string) {
    const userId = '66b4b5d2f9415815acd65e6a';
    return this.reviewsService.deleteReview(userId, reviewId);
  }

  @Post()
  createDefaultReview(@Body() createReviewDto: CreateReviewDto) {
    const userId = '66b4b5d2f9415815acd65e6a';
    return this.reviewsService.createDefaultReview(userId, createReviewDto);
  }

  @Patch(':reviewId')
  updateReview(
    @Param('reviewId') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    const userId = '66b4b5d2f9415815acd65e6a';
    return this.reviewsService.updateReview(userId, reviewId, updateReviewDto);
  }

  @Get(':reviewId/text-review')
  getTextReview(@Param('reviewId') reviewId: string) {
    const userId = '66b4b5d2f9415815acd65e6a';
    return this.reviewsService.getTextReview(userId, reviewId);
  }

  @Post('comment')
  createComment(@Body() createCommentDto: CreateCommentDto) {
    const userId = '66b4b5d2f9415815acd65e6a';
    return this.reviewsService.createComment(userId, createCommentDto);
  }

  @Post('sub-comment')
  createSubComment(@Body() createSubCommentDto: CreateSubCommentDto) {
    const userId = '66b4b5d2f9415815acd65e6a';
    return this.reviewsService.createSubComment(userId, createSubCommentDto);
  }

  @Get(':reviewId/comments')
  getAllComments(@Param('reviewId') reviewId: string) {
    const userId = '66b4b5d2f9415815acd65e6a';
    return this.reviewsService.getAllComments(userId, reviewId);
  }
}
