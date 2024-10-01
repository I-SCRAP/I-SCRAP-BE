import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { Popup } from 'src/popups/entities/popup.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarkService: BookmarksService) {}

  @Get('popups')
  async getBookmarkedPopups(): Promise<Popup[]> {
    const userId = '64dcc0e7f001b623d8a71ba2';
    return this.bookmarkService.getBookmarkedPopups(userId);
  }

  @Get('bookmarked-popups')
  async getAllBookmarkedPopups(
    @Query('page') page: string = '1', // 기본값 1
    @Query('limit') limit: string = '12', // 기본값 12
    @Query('status') status: string = 'all', // 기본값 'all'
  ): Promise<Popup[]> {
    const userId = '64dcc0e7f001b623d8a71ba2';
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

  @Get('date-range')
  async getPopupsInDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<Popup[]> {
    const userId = '64dcc0e7f001b623d8a71ba2';
    const start = new Date(startDate);
    const end = new Date(endDate);

    return this.bookmarkService.getPopupsInDateRange(userId, start, end);
  }

  @Get('monthly')
  async getPopupsInMonth(
    @Query('year') year: string,
    @Query('month') month: string,
  ): Promise<Popup[]> {
    const userId = '64dcc0e7f001b623d8a71ba2';
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

  @Post('unbookmark')
  async unbookmarkPopups(
    @Body('popupIds') popupIds: string[],
  ): Promise<{ message: string }> {
    const userId = '64dcc0e7f001b623d8a71ba2';
    if (!popupIds || popupIds.length === 0) {
      return { message: 'No popup IDs provided' };
    }

    await this.bookmarkService.unbookmarkPopups(userId, popupIds);
    return { message: 'Bookmarks removed successfully' };
  }

  @Post('/:popupId')
  async toggleBookmark(@Param('popupId') popupId: string) {
    const userId = '66f58849558783d05810be3b';
    const message = await this.bookmarkService.toggleBookmark(userId, popupId);
    return { message };
  }
}
