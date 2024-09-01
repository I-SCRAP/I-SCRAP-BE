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
        $project: {
          _id: 0,
          id: '$_id',
          name: 1,
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
          createdDate: 1,
        },
      },
    ]);

    return popupDetail.length > 0 ? popupDetail[0] : null;
  }

  // 특정 popupId 목록에 대한 팝업 상세 정보 조회
  async findPopupsByIds(popupIds: string[]): Promise<Popup[]> {
    const objectIds = popupIds.map((id) => new ObjectId(id));
    return this.popupModel.find({ _id: { $in: objectIds } }).exec();
  }
}
