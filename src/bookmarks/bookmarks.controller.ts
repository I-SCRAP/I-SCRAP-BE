import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { Popup } from 'src/popups/entities/popup.entity';

@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarkService: BookmarksService) {}

  @Post()
  async toggleBookmark(
    @Query('userId') userId: string,
    @Query('popupId') popupId: string,
  ) {
    const message = await this.bookmarkService.toggleBookmark(userId, popupId);
    return { message };
  }

  @Get('popups')
  async getBookmarkedPopups(@Query('userId') userId: string): Promise<Popup[]> {
    return this.bookmarkService.getBookmarkedPopups(userId);
  }

  @Get('popups/:userId')
  async getAllBookmarkedPopups(
    @Param('userId') userId: string,
    @Query('page') page: string = '1', // 기본값 1
    @Query('limit') limit: string = '12', // 기본값 12
  ): Promise<Popup[]> {
    // page와 limit는 문자열로 들어오므로, 숫자로 변환
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // BookmarkService에 페이지네이션 관련 값 전달
    return this.bookmarkService.getAllBookmarkedPopups(
      userId,
      pageNumber,
      limitNumber,
    );
  }

  @Post('unbookmark')
  async unbookmarkPopups(
    @Query('userId') userId: string,
    @Body('popupIds') popupIds: string[],
  ): Promise<{ message: string }> {
    if (!popupIds || popupIds.length === 0) {
      return { message: 'No popup IDs provided' };
    }

    await this.bookmarkService.unbookmarkPopups(userId, popupIds);
    return { message: 'Bookmarks removed successfully' };
  }
}
