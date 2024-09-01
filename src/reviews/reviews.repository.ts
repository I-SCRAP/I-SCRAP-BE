import { CreateSubCommentDto } from './dto/create-sub-comment.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Review } from './entities/review.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { CreateReviewDto } from './dto/create-review.dto';
import { Comment } from './entities/comment.entity';
import { SubComment } from './entities/subComment.entity';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class ReviewsRepository {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    @InjectModel(SubComment.name)
    private readonly subCommentModel: Model<SubComment>,
  ) {}

  async getAllReviews(userId: string, page: number) {
    const pageSize = 18;
    const skip: number = (page - 1) * pageSize;

    const allReviews = await this.reviewModel.aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
          status: 'published',
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
          detailedReview: 1,
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
        },
      },
    ]);

    if (!review.length) {
      throw new NotFoundException('Review not found');
    }

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
  }

  async createDefaultReview(userId: string, createReviewDto: CreateReviewDto) {
    // [TODO] popupId가 존재하는지 확인, 존재하지 않으면 에러 발생

    await this.reviewModel.create({
      ...createReviewDto,
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
