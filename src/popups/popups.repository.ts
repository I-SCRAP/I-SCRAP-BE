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
        $lookup: {
          from: 'reviewLikes', // 리뷰 좋아요 테이블과 조인
          localField: 'reviews._id', // 리뷰의 _id 필드
          foreignField: 'reviewId', // reviewLikes에서 reviewId와 연결
          as: 'likes', // 결과에 포함될 좋아요 필드 이름
        },
      },
      {
        $lookup: {
          from: 'comments', // 댓글 테이블과 조인
          localField: 'reviews._id', // 리뷰의 _id 필드
          foreignField: 'reviewId', // comments에서 reviewId와 연결
          as: 'comments', // 결과에 포함될 댓글 필드 이름
        },
      },
      {
        $lookup: {
          from: 'subComments', // 서브 댓글 테이블과 조인
          localField: 'comments._id', // 댓글의 _id 필드
          foreignField: 'commentId', // subComments에서 commentId와 연결
          as: 'subComments', // 결과에 포함될 서브 댓글 필드 이름
        },
      },
      {
        $addFields: {
          reviewLikesCount: { $size: '$likes' }, // 각 리뷰에 대한 좋아요 개수 계산
          commentsCount: {
            $add: [
              { $size: '$comments' }, // 댓글 수
              { $size: '$subComments' }, // 서브 댓글 수 합산
            ],
          },
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
          dateRange: {
            $concat: [
              {
                $dateToString: { format: '%Y.%m.%d', date: '$dateRange.start' },
              },
              ' - ',
              { $dateToString: { format: '%Y.%m.%d', date: '$dateRange.end' } },
            ],
          },
          location: {
            address: '$location.address',
            latitude: '$location.latitude',
            longitude: '$location.longitude',
          },
          category: 1,
          websiteURL: 1,
          createdDate: 1,
          reviews: {
            $map: {
              input: '$reviews',
              as: 'review',
              in: {
                id: '$$review._id', // 리뷰의 id
                cardFront: '$$review.cardFront', // cardFront 이미지
                rating: '$$review.rating', // 평점
                shortComment: '$$review.shortComment', // 짧은 코멘트
                reviewLikes: '$reviewLikesCount', // 좋아요 수
                comments: '$commentsCount', // 모든 코멘트(댓글 + 서브 댓글) 합산
              },
            },
          },
        },
      },
    ]);

    if (popupDetail.length === 0) {
      return null;
    }

    const popup = popupDetail[0];

    // operatingHours의 정확한 타입 지정
    const operatingHours = popup.operatingHours as Record<
      string,
      { open?: string; close?: string; closed?: boolean }
    >;

    // 영어 요일을 한글 요일로 변환하는 맵
    const dayMap: Record<string, string> = {
      Monday: '월',
      Tuesday: '화',
      Wednesday: '수',
      Thursday: '목',
      Friday: '금',
      Saturday: '토',
      Sunday: '일',
    };

    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const weekdayHours = operatingHours[weekdays[0]];

    const allWeekdaysSame = weekdays.every(
      (day) =>
        operatingHours[day]?.open === weekdayHours?.open &&
        operatingHours[day]?.close === weekdayHours?.close,
    );

    if (
      (allWeekdaysSame &&
        !(
          operatingHours.Saturday?.open === weekdayHours.open &&
          operatingHours.Saturday?.close === weekdayHours.close
        )) ||
      operatingHours.Sunday?.closed
    ) {
      // 요일별로 운영 시간을 개별적으로 표시
      const days = Object.entries(operatingHours)
        .map(([day, hours]) => {
          const koreanDay = dayMap[day]; // 영어 요일을 한글로 변환
          if (hours?.closed) {
            return `${koreanDay} 휴무`; // 휴무일 표시
          }
          return `${koreanDay} ${hours?.open}-${hours?.close}`; // 요일별 시간 표시
        })
        .join('\n');

      popup.operatingHours = days;
    } else {
      // 모든 요일이 동일하면 "매일"로 표시
      popup.operatingHours = `매일 ${weekdayHours.open}-${weekdayHours.close}`;
    }

    // fee 값 처리
    if (popup.fee === 0) {
      popup.fee = '무료';
    } else {
      popup.fee = `${popup.fee}원`;
    }

    return popup;
  }

  // 특정 popupId 목록에 대한 팝업 상세 정보 조회
  async findPopupsByIds(popupIds: string[]): Promise<Popup[]> {
    const objectIds = popupIds.map((id) => new ObjectId(id));
    return this.popupModel.find({ _id: { $in: objectIds } }).exec();
  }

  // 특정 popupId 목록에 대한 팝업 상세 정보 조회 + 페이지네이션 추가 -> 북마크한 팝업 모두 불러오기 기능
  async findAllPopupsByIds(
    popupIds: string[],
    page: number,
    limit: number = 12,
    status: string,
  ): Promise<Popup[]> {
    const objectIds = popupIds.map((id) => new ObjectId(id));

    // 페이지네이션을 위한 skip과 limit 계산
    const skip = (page - 1) * limit;

    // 현재 날짜 가져오기
    const currentDate = new Date();

    // 진행 상태에 따른 조건 설정
    let matchCondition: any = {
      _id: { $in: objectIds },
    };

    if (status === 'ongoing') {
      // 진행 중인 팝업: start <= 현재 날짜 <= end
      matchCondition['dateRange.start'] = { $lte: currentDate };
      matchCondition['dateRange.end'] = { $gte: currentDate };
    } else if (status === 'upcoming') {
      // 진행 예정인 팝업: 현재 날짜 < start
      matchCondition['dateRange.start'] = { $gt: currentDate };
    } else if (status === 'finished') {
      // 종료된 팝업: 현재 날짜 > end
      matchCondition['dateRange.end'] = { $lt: currentDate };
    }

    // 필요한 필드만 선택하고, 날짜 형식 변환 + 페이지네이션 적용
    return this.popupModel
      .aggregate([
        {
          $match: matchCondition,
        },
        {
          $project: {
            _id: 0,
            id: '$_id',
            name: 1,
            poster: 1,
            dateRange: {
              start: {
                $dateToString: { format: '%Y.%m.%d', date: '$dateRange.start' },
              },
              end: {
                $dateToString: { format: '%Y.%m.%d', date: '$dateRange.end' },
              },
            },
          },
        },
        {
          $skip: skip, // 스킵할 문서 수
        },
        {
          $limit: limit, // 반환할 문서 수 (페이지 당 12개)
        },
      ])
      .exec();
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
        $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          poster: 1,
          dateRange: {
            $concat: [
              {
                $dateToString: { format: '%Y.%m.%d', date: '$dateRange.start' },
              },
              ' - ',
              { $dateToString: { format: '%Y.%m.%d', date: '$dateRange.end' } },
            ],
          },
          fee: 1,
          category: 1,
          bookmarkCount: 1,
          location: '$location.address', // location의 address 필드만 선택
        },
      },
      {
        $sample: { size: 9 }, // 랜덤으로 9개의 팝업 선택
      },
    ]);

    return popups;
  }

  async getMonthlyPopups(): Promise<Popup[]> {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // JavaScript에서 0이 1월이므로 +1을 해줍니다.

    // 이번 달의 첫날 (UTC 기준으로 9월 1일 00:00:00.000)
    const startOfMonth = new Date(
      Date.UTC(currentYear, currentMonth - 1, 1, 0, 0, 0, 0),
    );

    // 이번 달의 마지막 날 (UTC 기준으로 9월 30일 23:59:59.999)
    const endOfMonth = new Date(
      Date.UTC(currentYear, currentMonth, 0, 23, 59, 59, 999),
    );

    console.log('Start of Month:', startOfMonth);
    console.log('End of Month:', endOfMonth);

    const popups = await this.popupModel.aggregate([
      {
        $match: {
          // 팝업이 이번 달에 진행 중이어야 함
          'dateRange.start': { $lte: endOfMonth }, // 시작 날짜가 이번 달 마지막 날 이전이어야 함
          'dateRange.end': { $gte: startOfMonth }, // 종료 날짜가 이번 달 첫날 이후여야 함
        },
      },
      {
        $sort: { 'dateRange.start': 1 }, // 팝업 시작 날짜를 기준으로 오름차순 정렬
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          poster: 1,
          dateRange: {
            $concat: [
              {
                $dateToString: { format: '%Y.%m.%d', date: '$dateRange.start' },
              },
              ' - ',
              { $dateToString: { format: '%Y.%m.%d', date: '$dateRange.end' } },
            ],
          },
        },
      },
    ]);

    return popups;
  }

  // 주어진 popupId 목록 중에서 주간에 운영하는 팝업만 조회
  async findOperatingPopupsByIdsInDateRange(
    popupIds: string[],
    startOfWeek: Date,
    endOfWeek: Date,
  ): Promise<Popup[]> {
    const objectIds = popupIds.map((id) => new ObjectId(id));

    return this.popupModel
      .aggregate([
        {
          $match: {
            _id: { $in: objectIds },
            'dateRange.start': { $lte: endOfWeek }, // 팝업 시작일이 주간 종료일보다 이전 또는 같음
            'dateRange.end': { $gte: startOfWeek }, // 팝업 종료일이 주간 시작일보다 이후 또는 같음
          },
        },
        {
          $project: {
            _id: 0, // _id 필드를 제외
            id: '$_id', // _id를 id로 변환하여 반환
            name: 1,
            dateRange: 1,
          },
        },
      ])
      .exec();
  }
}
