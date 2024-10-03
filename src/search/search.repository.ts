import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bookmark } from 'src/bookmarks/entities/bookmarks.entity';
import { Popup } from 'src/popups/entities/popup.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { SortBy } from './dto/filter.dto';
import { ObjectId } from 'mongodb';

export class SearchRepository {
  constructor(
    @InjectModel(Popup.name) private readonly popupModel: Model<Popup>,
    @InjectModel(Bookmark.name) private readonly bookmarkModel: Model<Bookmark>,
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
  ) {}

  async findFilteredPopups(
    userId: string | null,
    query: any,
  ): Promise<Popup[]> {
    return this.popupModel
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'popupId',
            as: 'bookmarks',
          },
        },
        {
          $addFields: {
            isBookmarked: userId
              ? {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: '$bookmarks',
                          as: 'bookmark',
                          cond: {
                            $eq: ['$$bookmark.userId', new ObjectId(userId)],
                          },
                        },
                      },
                    },
                    0,
                  ],
                }
              : false,
          },
        },
        {
          $project: {
            _id: 0,
            id: '$_id',
            address: '$location.address',
            name: 1,
            poster: 1,
            category: 1,
            isBookmarked: 1,
            dateRange: {
              start: {
                $concat: [
                  {
                    $substr: [
                      {
                        $dateToString: {
                          format: '%Y/%m/%d',
                          date: '$dateRange.start',
                          timezone: '+09:00',
                        },
                      },
                      2,
                      2,
                    ],
                  },
                  '/',
                  {
                    $dateToString: {
                      format: '%m/%d',
                      date: '$dateRange.start',
                      timezone: '+09:00',
                    },
                  },
                ],
              },
              end: {
                $concat: [
                  {
                    $substr: [
                      {
                        $dateToString: {
                          format: '%Y/%m/%d',
                          date: '$dateRange.end',
                          timezone: '+09:00',
                        },
                      },
                      2,
                      2,
                    ],
                  },
                  '/',
                  {
                    $dateToString: {
                      format: '%m/%d',
                      date: '$dateRange.end',
                      timezone: '+09:00',
                    },
                  },
                ],
              },
            },
          },
        },
      ])
      .exec();
  }

  async sortPopups(popups: Popup[], sortBy: SortBy): Promise<Popup[]> {
    if (sortBy === SortBy.POPULARITY) {
      const popupIds = popups.map((popup) => popup.id);
      const bookmarks = await this.bookmarkModel
        .aggregate([
          { $match: { popupId: { $in: popupIds } } },
          { $group: { _id: '$popupId', count: { $sum: 1 } } },
        ])
        .exec();

      const bookmarkMap = new Map<string, number>(
        bookmarks.map((b) => [b._id.toString(), b.count]),
      );

      return popups.sort(
        (a, b) =>
          (bookmarkMap.get(b.id.toString()) || 0) -
          (bookmarkMap.get(a.id.toString()) || 0),
      );
    } else if (sortBy === SortBy.RATING) {
      const popupIds = popups.map((popup) => popup.id);
      const reviews = await this.reviewModel
        .aggregate([
          { $match: { popupId: { $in: popupIds }, isPublic: true } },
          { $group: { _id: '$popupId', avgRating: { $avg: '$rating' } } },
        ])
        .exec();

      const reviewMap = new Map<string, number>(
        reviews.map((r) => [r._id.toString(), r.avgRating]),
      );

      return popups.sort(
        (a, b) =>
          (reviewMap.get(b.id.toString()) || 0) -
          (reviewMap.get(a.id.toString()) || 0),
      );
    }

    return popups;
  }

  async searchPopupsByName(popupName: string) {
    const popups = await this.popupModel.aggregate([
      {
        $match: {
          name: { $regex: new RegExp(popupName, 'i') },
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          poster: 1,
          dateRange: {
            start: {
              $dateToString: {
                format: '%Y.%m.%d',
                date: '$dateRange.start',
                timezone: '+09:00',
              },
            },
            end: {
              $dateToString: {
                format: '%Y.%m.%d',
                date: '$dateRange.end',
                timezone: '+09:00',
              },
            },
          },
          fee: 1,
          address: '$location.address',
        },
      },
      {
        $limit: 3,
      },
    ]);

    return popups;
  }
}
