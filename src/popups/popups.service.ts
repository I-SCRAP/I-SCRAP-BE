import { Injectable } from '@nestjs/common';
import { PopupsRepository } from './popups.repository';
import { BookmarksRepository } from 'src/bookmarks/bookmarks.repository';

@Injectable()
export class PopupsService {
  constructor(
    private readonly popupsRepository: PopupsRepository,
    private readonly bookmarksRepository: BookmarksRepository,
  ) {}

  async getPopupDetail(popupId: string, userId: string) {
    const popupDetail = await this.popupsRepository.getPopupDetail(popupId);
    if (userId) {
      const isBookmarked = await this.bookmarksRepository.isBookmarked(
        userId,
        popupId,
      );
      popupDetail.isBookmarked = isBookmarked;
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
