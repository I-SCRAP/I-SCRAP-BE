import { CreateReviewLikeDto } from './dto/create-review-like.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Injectable } from '@nestjs/common';
import { ReviewsRepository } from './reviews.repository';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateSubCommentDto } from './dto/create-sub-comment.dto';
import { DeleteReviewsDto } from './dto/delete-reviews.dto';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly s3Service: S3Service,
  ) {}

  async getAllReviews(userId: string, page: string) {
    const pageNumber = parseInt(page, 10);
    let allReviews = await this.reviewsRepository.getAllReviews(
      userId,
      pageNumber,
    );

    allReviews = await Promise.all(
      allReviews.map(async (review) => {
        review.cardFront = await this.s3Service.generatePresignedDownloadUrl(
          process.env.S3_USER_BUCKET,
          userId,
          review.cardFront,
        );
        review.cardBack = await this.s3Service.generatePresignedDownloadUrl(
          process.env.S3_USER_BUCKET,
          userId,
          review.cardBack,
        );
        return review;
      }),
    );
    return allReviews;
  }

  async getReviewById(userId: string, reviewId: string) {
    const review = await this.reviewsRepository.getReviewById(userId, reviewId);
    review.cardFront = await this.s3Service.generatePresignedDownloadUrl(
      process.env.S3_USER_BUCKET,
      userId,
      review.cardFront,
    );

    review.cardBack = await this.s3Service.generatePresignedDownloadUrl(
      process.env.S3_USER_BUCKET,
      userId,
      review.cardBack,
    );

    return review;
  }

  async deleteReview(userId: string, reviewId: string) {
    await this.reviewsRepository.deleteReview(userId, reviewId);
  }

  async deleteReviews(userId: string, deleteReviewsDto: DeleteReviewsDto) {
    await this.reviewsRepository.deleteReviews(userId, deleteReviewsDto);
  }

  async createDefaultReview(userId: string, createReviewDto: CreateReviewDto) {
    const defaultReviewId = await this.reviewsRepository.createDefaultReview(
      userId,
      createReviewDto,
    );
    return defaultReviewId;
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

  async getTextReview(userId: string, reviewId: string) {
    const textReview = await this.reviewsRepository.getTextReview(
      userId,
      reviewId,
    );

    textReview.cardFront = await this.s3Service.generatePresignedDownloadUrl(
      process.env.S3_USER_BUCKET,
      userId,
      textReview.cardFront,
    );

    textReview.cardBack = await this.s3Service.generatePresignedDownloadUrl(
      process.env.S3_USER_BUCKET,
      userId,
      textReview.cardBack,
    );

    textReview.photos = await Promise.all(
      textReview.photos.map((photo) =>
        this.s3Service.generatePresignedDownloadUrl(
          process.env.S3_USER_BUCKET,
          userId,
          photo,
        ),
      ),
    );
    return textReview;
  }

  async getCardReview(userId: string, reviewId: string) {
    const cardReview = await this.reviewsRepository.getCardReview(
      userId,
      reviewId,
    );

    cardReview.cardImage = await this.s3Service.generatePresignedDownloadUrl(
      process.env.S3_USER_BUCKET,
      userId,
      cardReview.cardImage,
    );

    return cardReview;
  }

  async likeReview(userId: string, createReviewLikeDto: CreateReviewLikeDto) {
    await this.reviewsRepository.likeReview(userId, createReviewLikeDto);
  }

  async getReviewLikes(reviewId: string) {
    const likes = await this.reviewsRepository.getReviewLikes(reviewId);
    return likes;
  }

  async unlikeReview(userId: string, reviewId: string) {
    await this.reviewsRepository.unlikeReview(userId, reviewId);
  }

  async createComment(userId: string, createCommentDto: CreateCommentDto) {
    await this.reviewsRepository.createComment(userId, createCommentDto);
  }

  async createSubComment(
    userId: string,
    createSubCommentDto: CreateSubCommentDto,
  ) {
    await this.reviewsRepository.createSubComment(userId, createSubCommentDto);
  }

  async getAllComments(userId: string, reviewId: string) {
    const comments = await this.reviewsRepository.getAllComments(
      userId,
      reviewId,
    );
    return comments;
  }

  async getRecentReviews(userId: string) {
    let recentReviews = await this.reviewsRepository.getRecentReviews(userId);

    recentReviews = await Promise.all(
      recentReviews.map(async (review) => {
        review.cardFront = await this.s3Service.generatePresignedDownloadUrl(
          process.env.S3_USER_BUCKET,
          userId,
          review.cardFront,
        );

        review.cardBack = await this.s3Service.generatePresignedDownloadUrl(
          process.env.S3_USER_BUCKET,
          userId,
          review.cardBack,
        );

        return review;
      }),
    );

    return recentReviews;
  }
}
