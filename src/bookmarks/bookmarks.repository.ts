import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bookmark } from './entities/bookmarks.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class BookmarksRepository {
  constructor(
    @InjectModel(Bookmark.name) private readonly bookmarkModel: Model<Bookmark>,
  ) {}

  // 북마크 생성
  async createBookmark(userId: string, popupId: string): Promise<Bookmark> {
    const newBookmark = new this.bookmarkModel({
      userId: new ObjectId(userId),
      popupId: new ObjectId(popupId),
      createdDate: new Date(),
    });
    return newBookmark.save();
  }

  // 북마크 삭제
  async removeBookmark(userId: string, popupId: string): Promise<void> {
    const result = await this.bookmarkModel
      .deleteOne({
        userId: new ObjectId(userId),
        popupId: new ObjectId(popupId),
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new Error('No bookmark found to delete');
    }
  }

  // 특정 사용자가 특정 팝업을 북마크했는지 여부 확인
  async isBookmarked(userId: string, popupId: string): Promise<boolean> {
    const bookmark = await this.bookmarkModel
      .findOne({ userId: new ObjectId(userId), popupId: new ObjectId(popupId) })
      .exec();
    return !!bookmark;
  }

  // 북마크 존재 여부에 따라 삭제 또는 생성
  async toggleBookmark(userId: string, popupId: string): Promise<string> {
    const isBookmarked = await this.isBookmarked(userId, popupId);

    if (isBookmarked) {
      await this.removeBookmark(userId, popupId);
      return '북마크가 삭제되었습니다.';
    } else {
      await this.createBookmark(userId, popupId);
      return '북마크가 추가되었습니다.';
    }
  }

  // 특정 사용자가 북마크한 모든 popupId 조회
  async findBookmarkedPopups(userId: string): Promise<string[]> {
    const bookmarks = await this.bookmarkModel
      .find({ userId: new ObjectId(userId) })
      .select('popupId')
      .exec();

    return bookmarks.map((bookmark) => bookmark.popupId.toString());
  }

  // 여러 팝업에 대해 북마크를 제거하는 메서드
  async unbookmarkPopups(userId: string, popupIds: string[]): Promise<void> {
    if (popupIds.length === 0) {
      return; // 리스트가 비어있으면 아무 작업도 하지 않음
    }

    // ObjectId로 변환
    const objectIds = popupIds.map((id) => new ObjectId(id));

    // 여러 팝업에 대한 북마크를 삭제
    const result = await this.bookmarkModel
      .deleteMany({
        userId: new ObjectId(userId),
        popupId: { $in: objectIds },
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new Error('No bookmarks found to delete');
    }
  }

  // 특정 사용자가 북마크한 총 개수를 반환하는 메서드
  async countUserBookmarks(userId: string): Promise<number> {
    const count = await this.bookmarkModel.countDocuments({
      userId: new ObjectId(userId),
    });
    return count;
  }

  // 북마크가 있는 모든 사용자의 목록을 가져오는 메서드
  async getAllUsersWithBookmarks(): Promise<
    { userId: string; email: string }[]
  > {
    const usersWithBookmarks = await this.bookmarkModel.aggregate([
      {
        $group: {
          _id: '$userId',
        },
      },
      {
        $lookup: {
          from: 'users', // users 컬렉션과 연결
          localField: '_id',
          foreignField: '_id', // userId로 users 컬렉션에서 매칭
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          email: '$user.email',
        },
      },
    ]);

    return usersWithBookmarks;
  }
}
