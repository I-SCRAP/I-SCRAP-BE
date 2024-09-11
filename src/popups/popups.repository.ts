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
          from: 'reviews', // 리뷰 컬렉션의 이름
          localField: '_id', // 팝업의 _id 필드
          foreignField: 'popupId', // 리뷰에서 팝업과 연결된 필드
          as: 'reviews', // 결과에 포함될 리뷰 필드 이름
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
          reviews: {
            _id: 1,
            userId: 1,
            visitDate: 1,
            rating: 1,
            title: 1,
            shortComment: 1,
            detailedReview: 1,
            photos: 1,
            status: 1,
            createdDate: 1,
          },
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

  async getPopupsSortedByBookmarks(): Promise<Popup[]> {
    const today = new Date();

    const popups = await this.popupModel.aggregate([
      {
        $match: {
          'dateRange.end': { $gte: today }, // 지나간 팝업 제외 (종료 날짜가 오늘 이후인 팝업만 포함)
        },
      },
      {
        $lookup: {
          from: 'bookmarks', // bookmarks 컬렉션과 조인
          localField: '_id', // popups의 _id와 연결
          foreignField: 'popupId', // bookmarks에서 popupId와 연결
          as: 'bookmarks',
        },
      },
      {
        $addFields: {
          bookmarkCount: { $size: '$bookmarks' }, // 북마크 수 계산
        },
      },
      {
        $sort: { bookmarkCount: -1 }, // 북마크 수에 따라 내림차순 정렬
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
          bookmarkCount: 1, // 북마크 수를 결과에 포함
        },
      },
    ]);

    return popups;
  }

  async getPersonalizedPopups(): Promise<Popup[]> {
    const today = new Date();

    const popups = await this.popupModel.aggregate([
      {
        $match: {
          'dateRange.end': { $gte: today }, // 지나간 팝업 제외 (종료 날짜가 오늘 이후인 팝업만 포함)
        },
      },
      {
        $lookup: {
          from: 'bookmarks', // bookmarks 컬렉션과 조인
          localField: '_id', // popups의 _id와 연결
          foreignField: 'popupId', // bookmarks에서 popupId와 연결
          as: 'bookmarks',
        },
      },
      {
        $addFields: {
          bookmarkCount: { $size: '$bookmarks' }, // 북마크 수 계산
        },
      },
      {
        $sort: { bookmarkCount: -1 }, // 북마크 수에 따라 내림차순 정렬
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
          bookmarkCount: 1, // 북마크 수를 결과에 포함
        },
      },
    ]);

    return popups;
  }
}
