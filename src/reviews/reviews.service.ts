import { Injectable } from '@nestjs/common';
import { ReviewsRepository } from './reviews.repository';

@Injectable()
export class ReviewsService {
  constructor(private readonly reviewsRepository: ReviewsRepository) {}

  async getAllReviews(userId: string, page: number) {
    const allReviews = await this.reviewsRepository.getAllReviews(userId, page);
    return allReviews;
  }
}
