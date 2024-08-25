import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { validateRequiredField } from '../utils/validation-utils';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}
  @Get()
  getAllReviews(@Query('page') page: number) {
    validateRequiredField('page', page);
    const userId = '66b4b5d2f9415815acd65e6a';
    return this.reviewsService.getAllReviews(userId, page);
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

  // 리뷰 생성하기
  @Post()
  createDefaultReview(@Body() createReviewDto: CreateReviewDto) {
    const userId = '66b4b5d2f9415815acd65e6a';
    return this.reviewsService.createDefaultReview(userId, createReviewDto);
  }
}
