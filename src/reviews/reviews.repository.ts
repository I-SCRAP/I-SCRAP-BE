import { CreateSubCommentDto } from './dto/create-sub-comment.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Review } from './entities/review.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { CreateReviewDto } from './dto/create-review.dto';
import { Comment } from './entities/comment.entity';
import { SubComment } from './entities/sub-comment.entity';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReviewLikeDto } from './dto/create-review-like.dto';
import { ReviewLike } from './entities/review-like.entity';
import { DeleteReviewsDto } from './dto/delete-reviews.dto';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class ReviewsRepository {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    @InjectModel(SubComment.name)
    private readonly subCommentModel: Model<SubComment>,
    @InjectModel(ReviewLike.name)
    private readonly reviewLikeModel: Model<ReviewLike>,
    private readonly s3Service: S3Service,
  ) {}

  async getAllReviews(userId: string, page: number) {
    const pageSize = 18;
    const skip: number = (page - 1) * pageSize;

    const allReviews = await this.reviewModel.aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $match: {
          'user._id': new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'popups',
          localField: 'popupId',
          foreignField: '_id',
          as: 'popup',
        },
      },
      {
        $unwind: '$popup',
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          visitDate: {
            $dateToString: {
              format: '%m.%d',
              date: '$visitDate',
              timezone: '+09:00',
            },
          },
          title: 1,
          cardFront: 1,
          popupName: '$popup.name',
        },
      },
      {
        $sort: {
          modifiedDate: -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: pageSize,
      },
    ]);

    allReviews.forEach(async (review) => {
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
    });

    return allReviews;
  }

  async getReviewById(userId: string, reviewId: string) {
    const review = await this.reviewModel.aggregate([
      {
        $match: {
          _id: new ObjectId(reviewId),
          userId: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'popups',
          localField: 'popupId',
          foreignField: '_id',
          as: 'popup',
        },
      },
      {
        $unwind: '$popup',
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          visitDate: {
            $dateToString: {
              format: '%Y.%m.%d',
              date: '$visitDate',
              timezone: '+09:00',
            },
          },
          popupName: '$popup.name',
          title: 1,
          isPublic: 1,
          detailedReview: 1,
          cardFront: 1,
          cardBack: 1,
          shortComment: 1,
        },
      },
    ]);

    if (!review.length) {
      throw new NotFoundException('Review not found');
    }

    review[0].cardFront = await this.s3Service.generatePresignedDownloadUrl(
      process.env.S3_USER_BUCKET,
      userId,
      review[0].cardFront,
    );

    review[0].cardBack = await this.s3Service.generatePresignedDownloadUrl(
      process.env.S3_USER_BUCKET,
      userId,
      review[0].cardBack,
    );

    return review[0];
  }

  async deleteReview(userId: string, reviewId: string) {
    const review = await this.reviewModel.findOneAndDelete({
      _id: new ObjectId(reviewId),
      userId: new ObjectId(userId),
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // [TODO] 리뷰에 연결된 댓글, 대댓글, 좋아요 삭제
    // [TODO] 리뷰에 연결된 사진 삭제
  }

  async deleteReviews(userId: string, deleteReviewsDto: DeleteReviewsDto) {
    const validReviewIds = await this.reviewModel.find({
      _id: { $in: deleteReviewsDto.reviewIds },
      userId: new ObjectId(userId),
    });

    if (validReviewIds.length !== deleteReviewsDto.reviewIds.length) {
      throw new BadRequestException('Some review IDs do not exist.');
    }

    const reviews = await this.reviewModel.deleteMany({
      _id: { $in: deleteReviewsDto.reviewIds },
      userId: new ObjectId(userId),
    });

    if (reviews.deletedCount !== deleteReviewsDto.reviewIds.length) {
      throw new InternalServerErrorException('Error during deletion');
    }

    // [TODO] 리뷰에 연결된 댓글, 대댓글, 좋아요 삭제
    // [TODO] 리뷰에 연결된 사진 삭제
  }

  async createDefaultReview(userId: string, createReviewDto: CreateReviewDto) {
    // [TODO] popupId가 존재하는지 확인, 존재하지 않으면 에러 발생

    await this.reviewModel.create({
      ...createReviewDto,
      cardFront: createReviewDto.cardImage,
      userId: new ObjectId(userId),
    });
  }

  async updateReview(
    userId: string,
    reviewId: string,
    updateReviewDto: UpdateReviewDto,
  ) {
    const review = await this.reviewModel.findOneAndUpdate(
      {
        _id: new ObjectId(reviewId),
        userId: new ObjectId(userId),
      },
      {
        $set: updateReviewDto,
      },
      {
        new: true,
      },
    );

    if (!review) {
      throw new NotFoundException('Review not found');
    }
  }

  async getTextReview(userId: string, reviewId: string) {
    const textReview = await this.reviewModel.aggregate([
      {
        $match: {
          _id: new ObjectId(reviewId),
          userId: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'popups',
          localField: 'popupId',
          foreignField: '_id',
          as: 'popup',
        },
      },
      {
        $unwind: '$popup',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          title: 1,
          shortComment: 1,
          detailedReview: 1,
          rating: 1,
          photos: 1,
          cardFront: 1,
          cardBack: 1,
          visitDate: {
            $dateToString: {
              format: '%Y.%m.%d',
              date: '$visitDate',
              timezone: '+09:00',
            },
          },
          popup: {
            id: '$popup._id',
            name: '$popup.name',
            location: '$popup.location.address',
          },
          user: {
            id: '$user._id',
            name: '$user.name',
            profileImage: '$user.profileImage',
          },
          isPublic: 1,
        },
      },
    ]);

    if (textReview.length === 0) {
      throw new NotFoundException('Review not found');
    }

    textReview[0].cardFront = await this.s3Service.generatePresignedDownloadUrl(
      process.env.S3_USER_BUCKET,
      userId,
      textReview[0].cardFront,
    );

    textReview[0].cardBack = await this.s3Service.generatePresignedDownloadUrl(
      process.env.S3_USER_BUCKET,
      userId,
      textReview[0].cardBack,
    );

    textReview[0].photos = await Promise.all(
      textReview[0].photos.map((photo) =>
        this.s3Service.generatePresignedDownloadUrl(
          process.env.S3_USER_BUCKET,
          userId,
          photo,
        ),
      ),
    );

    return textReview[0];
  }

  async getCardReview(userId: string, reviewId: string) {
    const cardReview = await this.reviewModel.aggregate([
      {
        $match: {
          _id: new ObjectId(reviewId),
          userId: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'popups',
          localField: 'popupId',
          foreignField: '_id',
          as: 'popup',
        },
      },
      {
        $unwind: '$popup',
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          rating: 1,
          layout: 1,
          backgroundColor: 1,
          cardImage: 1,
          place: 1,
          amount: 1,
          companions: 1,
          visitDate: {
            $dateToString: {
              format: '%Y.%m.%d',
              date: '$visitDate',
              timezone: '+09:00',
            },
          },
          popup: {
            id: '$popup._id',
            name: '$popup.name',
          },
          elements: 1,
          isPublic: 1,
        },
      },
    ]);

    if (cardReview.length === 0) {
      throw new NotFoundException('Review not found');
    }

    cardReview[0].cardImage = await this.s3Service.generatePresignedDownloadUrl(
      process.env.S3_USER_BUCKET,
      userId,
      cardReview[0].cardImage,
    );

    return cardReview[0];
  }

  async likeReview(userId: string, createReviewLikeDto: CreateReviewLikeDto) {
    const review = await this.reviewModel.findOne({
      _id: createReviewLikeDto.reviewId,
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const like = await this.reviewLikeModel.findOne({
      reviewId: createReviewLikeDto.reviewId,
      userId: new ObjectId(userId),
    });

    if (like) {
      throw new ConflictException('Already liked');
    }

    await this.reviewLikeModel.create({
      ...createReviewLikeDto,
      userId: new ObjectId(userId),
    });
  }

  async getReviewLikes(reviewId: string) {
    const review = await this.reviewModel.findOne({
      _id: new ObjectId(reviewId),
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const likes = await this.reviewLikeModel.aggregate([
      {
        $match: {
          reviewId: new ObjectId(reviewId),
        },
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          type: '$_id',
          count: 1,
        },
      },
    ]);

    const likeTypes = [
      'Amazing',
      'Like',
      'Surprising',
      'Impressive',
      'Relatable',
    ];

    likeTypes.forEach((type) => {
      const fullTypeLike = likes.find((like) => like.type === type);
      if (!fullTypeLike) {
        likes.push({ type, count: 0 });
      }
    });

    return likes;
  }

  async unlikeReview(userId: string, reviewId: string) {
    const review = await this.reviewModel.findOne({
      _id: new ObjectId(reviewId),
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const like = await this.reviewLikeModel.findOne({
      reviewId: new ObjectId(reviewId),
      userId: new ObjectId(userId),
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.reviewLikeModel.findOneAndDelete({
      reviewId: new ObjectId(reviewId),
      userId: new ObjectId(userId),
    });
  }

  async createComment(userId: string, createCommentDto: CreateCommentDto) {
    const review = await this.reviewModel.findOne({
      _id: createCommentDto.reviewId,
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }
    await this.commentModel.create({
      ...createCommentDto,
      authorId: new ObjectId(userId),
    });
  }

  async createSubComment(
    userId: string,
    createSubCommentDto: CreateSubCommentDto,
  ) {
    const comment = await this.commentModel.findOne({
      _id: createSubCommentDto.commentId,
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.subCommentModel.create({
      ...createSubCommentDto,
      authorId: new ObjectId(userId),
    });
  }

  async getAllComments(userId: string, reviewId: string) {
    const comments = await this.commentModel.aggregate([
      {
        $match: {
          reviewId: new ObjectId(reviewId),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'authorId',
          foreignField: '_id',
          as: 'author',
        },
      },
      {
        $unwind: {
          path: '$author',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'subComments',
          localField: '_id',
          foreignField: 'commentId',
          as: 'subComments',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'subComments.authorId',
          foreignField: '_id',
          as: 'subCommentsAuthors',
        },
      },
      {
        $addFields: {
          subComments: {
            $map: {
              input: '$subComments',
              as: 'subComment',
              in: {
                _id: '$$subComment._id',
                authorId: '$$subComment.authorId',
                contents: '$$subComment.contents',
                createdDate: '$$subComment.createdDate',
                author: {
                  $arrayElemAt: [
                    '$subCommentsAuthors',
                    {
                      $indexOfArray: [
                        '$subCommentsAuthors._id',
                        '$$subComment.authorId',
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          subComments: {
            $map: {
              input: {
                $sortArray: {
                  input: '$subComments',
                  sortBy: { createdDate: 1 },
                },
              },
              as: 'subComment',
              in: '$$subComment',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          contents: 1,
          createdDate: 1,
          author: {
            id: '$author._id',
            name: '$author.name',
            profileImage: '$author.profileImage',
          },
          subComments: {
            $cond: {
              if: { $gt: [{ $size: '$subComments' }, 0] },
              then: {
                $map: {
                  input: '$subComments',
                  as: 'subComment',
                  in: {
                    id: '$$subComment._id',
                    author: {
                      id: '$$subComment.author._id',
                      name: '$$subComment.author.name',
                      profileImage: '$$subComment.author.profileImage',
                    },
                    contents: '$$subComment.contents',
                    createdDate: '$$subComment.createdDate',
                  },
                },
              },
              else: [],
            },
          },
        },
      },
      {
        $sort: {
          createdDate: 1,
        },
      },
    ]);

    return comments;
  }
}
