import { Injectable } from '@nestjs/common';
import { Popup } from './entities/popup.entity'; // Popup 엔티티를 정의한 파일을 임포트
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

@Injectable()
export class PopupsRepository {
  constructor(
    @InjectModel(Popup.name) private readonly popupModel: Model<Popup>,
  ) {}

  async getPopupDetail(popupId: string) {
    const popupDetail = await this.popupModel.aggregate([
      {
        $match: {
          _id: new ObjectId(popupId),
        },
      },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'popupId',
          as: 'reviews',
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          reviewIds: {
            $map: {
              input: '$reviews._id',
              as: 'review',
              in: '$$review',
            },
          },
          poster: 1,
          detailImages: 1,
          fee: 1,
          operatingHours: 1,
          sizeInfo: 1,
          description: 1,
          dateRange: 1,
          location: {
            address: '$location.address',
            latitude: '$location.latitude',
            longitude: '$location.longitude',
          },
          category: 1,
          websiteURL: 1,
          tags: 1,
          createdDate: 1,
        },
      },
    ]);

    return popupDetail.length > 0 ? popupDetail[0] : null;
  }
}
