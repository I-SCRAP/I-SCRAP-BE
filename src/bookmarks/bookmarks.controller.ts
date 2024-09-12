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
    @Query('status') status: string = 'all', // 기본값 'all'
  ): Promise<Popup[]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // BookmarkService에 페이지네이션 관련 값 전달
    return this.bookmarkService.getAllBookmarkedPopups(
      userId,
      pageNumber,
      limitNumber,
      status,
    );
  }

  @Post('unbookmark/:userId')
  async unbookmarkPopups(
    @Param('userId') userId: string,
    @Body('popupIds') popupIds: string[],
  ): Promise<{ message: string }> {
    if (!popupIds || popupIds.length === 0) {
      return { message: 'No popup IDs provided' };
    }

    await this.bookmarkService.unbookmarkPopups(userId, popupIds);
    return { message: 'Bookmarks removed successfully' };
  }

  @Get('date-range/:userId')
  async getPopupsInDateRange(
    @Param('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<Popup[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return this.bookmarkService.getPopupsInDateRange(userId, start, end);
  }

  @Get('monthly/:userId')
  async getPopupsInMonth(
    @Param('userId') userId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ): Promise<Popup[]> {
    const yearNumber = parseInt(year, 10);
    const monthNumber = parseInt(month, 10);

    // UTC 기준으로 해당 월의 첫날과 마지막 날을 설정
    const startOfMonth = new Date(
      Date.UTC(yearNumber, monthNumber - 1, 1, 0, 0, 0),
    );
    const endOfMonth = new Date(
      Date.UTC(yearNumber, monthNumber, 0, 23, 59, 59, 999),
    );

    return this.bookmarkService.getPopupsInDateRange(
      userId,
      startOfMonth,
      endOfMonth,
    );
  }
}
