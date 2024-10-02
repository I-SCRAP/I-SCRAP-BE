import { Injectable } from '@nestjs/common';
import { PopupsRepository } from './popups.repository';
import { BookmarksRepository } from 'src/bookmarks/bookmarks.repository';

@Injectable()
export class PopupsService {
  constructor(
    private readonly popupsRepository: PopupsRepository,
    private readonly bookmarksRepository: BookmarksRepository, // 북마크 리포지토리 주입
  ) {}

  async getPopupDetail(popupId: string, userId: string) {
    const popupDetail = await this.popupsRepository.getPopupDetail(popupId);

    if (userId) {
      // 유저가 해당 팝업을 북마크했는지 확인
      const isBookmarked = await this.bookmarksRepository.isBookmarked(
        userId,
        popupId,
      );
      popupDetail.isBookmarked = isBookmarked; // 북마크 여부 추가
    } else {
      popupDetail.isBookmarked = false; // 유저가 없으면 북마크되지 않은 것으로 처리
    }

    return popupDetail;
  }

  async getPersonalizedPopups() {
    return this.popupsRepository.getPersonalizedPopups();
  }

  async getMonthlyPopups() {
    return this.popupsRepository.getMonthlyPopups();
  }
}
