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

@UseGuards(JwtAuthGuard)
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarkService: BookmarksService) {}

  @Get('popups')
  async getBookmarkedPopups(@Req() req): Promise<Popup[]> {
    const userId = req.user.id;
    return this.bookmarkService.getBookmarkedPopups(userId);
  }

  @Get('bookmarked-popups')
  async getAllBookmarkedPopups(
    @Req() req,
    @Query('page') page: string = '1', // 기본값 1
    @Query('limit') limit: string = '12', // 기본값 12
    @Query('status') status: string = 'all', // 기본값 'all'
  ): Promise<Popup[]> {
    const userId = req.user.id;
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
    @Req() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<Popup[]> {
    const userId = req.user.id;
    const start = new Date(startDate);
    const end = new Date(endDate);

    return this.bookmarkService.getPopupsInDateRange(userId, start, end);
  }

  @Get('monthly')
  async getPopupsInMonth(
    @Req() req,
    @Query('year') year: string,
    @Query('month') month: string,
  ): Promise<Popup[]> {
    const userId = req.user.id;
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
    @Req() req,
    @Body('popupIds') popupIds: string[],
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    if (!popupIds || popupIds.length === 0) {
      return { message: 'No popup IDs provided' };
    }

    await this.bookmarkService.unbookmarkPopups(userId, popupIds);
    return { message: 'Bookmarks removed successfully' };
  }

  @Post('/:popupId')
  async toggleBookmark(@Req() req, @Param('popupId') popupId: string) {
    const userId = req.user.id;
    const message = await this.bookmarkService.toggleBookmark(userId, popupId);
    return { message };
  }
}
