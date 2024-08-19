import { Injectable } from '@nestjs/common';
import { Review } from './entities/review.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

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
          shortComment: 1,
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
}
