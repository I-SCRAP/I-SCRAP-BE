import { Injectable, NotFoundException } from '@nestjs/common';
import { Review } from './entities/review.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsRepository {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
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
}
