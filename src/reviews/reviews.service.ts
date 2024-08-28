import { UpdateReviewDto } from './dto/update-review.dto';
import { Injectable } from '@nestjs/common';
import { ReviewsRepository } from './reviews.repository';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly reviewsRepository: ReviewsRepository) {}

  async getAllReviews(userId: string, page: number) {
    const allReviews = await this.reviewsRepository.getAllReviews(userId, page);
    return allReviews;
  }

  async getReviewById(userId: string, reviewId: string) {
    const review = await this.reviewsRepository.getReviewById(userId, reviewId);
    return review;
  }

  async deleteReview(userId: string, reviewId: string) {
    await this.reviewsRepository.deleteReview(userId, reviewId);
  }

  async createDefaultReview(userId: string, createReviewDto: CreateReviewDto) {
    await this.reviewsRepository.createDefaultReview(userId, createReviewDto);
  }

  async updateReview(
    userId: string,
    reviewId: string,
    UpdateReviewDto: UpdateReviewDto,
  ) {
    await this.reviewsRepository.updateReview(
      userId,
      reviewId,
      UpdateReviewDto,
    );
  }
}
