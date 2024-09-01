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
}
