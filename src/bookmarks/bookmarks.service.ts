import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { BookmarksRepository } from './bookmarks.repository';
import { Bookmark } from './entities/bookmarks.entity';
import { PopupsRepository } from 'src/popups/popups.repository';
import { Popup } from 'src/popups/entities/popup.entity';

@Injectable()
export class BookmarksService {
  constructor(
    private readonly bookmarksRepository: BookmarksRepository,
    @Inject(forwardRef(() => PopupsRepository))
    private readonly popupsRepository: PopupsRepository,
  ) {}

  async toggleBookmark(userId: string, popupId: string): Promise<string> {
    return this.bookmarksRepository.toggleBookmark(userId, popupId);
  }

  // 특정 사용자가 북마크한 모든 팝업의 상세 정보 조회
  async getBookmarkedPopups(userId: string): Promise<Popup[]> {
    // 1. 북마크된 popupId 목록 조회
    const popupIds = await this.bookmarksRepository.findBookmarkedPopups(
      userId,
    );

    // 2. 해당 popupId 목록으로 팝업 상세 정보 조회
    return this.popupsRepository.findPopupsByIds(popupIds);
  }
}
