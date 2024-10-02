import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
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
  async getBookmarkedPopups(
    @Req() req,
  ): Promise<{ userName: string; popups: Popup[] }> {
    // req.user가 존재하지 않으면 UnauthorizedException 던지기
    if (!req.user) {
      throw new UnauthorizedException(
        '유효하지 않은 ID Token이거나 사용자 정보를 찾을 수 없습니다.',
      );
    }

    const userId = req.user.id;
    const userName = req.user.name;
    const popups = await this.bookmarkService.getBookmarkedPopups(userId);
    return { userName, popups };
  }

  @Get('bookmarked-popups')
  async getAllBookmarkedPopups(
    @Req() req,
    @Query('page') page: string = '1', // 기본값 1
    @Query('limit') limit: string = '12', // 기본값 12
    @Query('status') status: string = 'all', // 기본값 'all'
  ): Promise<Popup[]> {
    // req.user가 존재하지 않으면 UnauthorizedException 던지기
    if (!req.user) {
      throw new UnauthorizedException(
        '유효하지 않은 ID Token이거나 사용자 정보를 찾을 수 없습니다.',
      );
    }

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
    // req.user가 존재하지 않으면 UnauthorizedException 던지기
    if (!req.user) {
      throw new UnauthorizedException(
        '유효하지 않은 ID Token이거나 사용자 정보를 찾을 수 없습니다.',
      );
    }

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
    // req.user가 존재하지 않으면 UnauthorizedException 던지기
    if (!req.user) {
      throw new UnauthorizedException(
        '유효하지 않은 ID Token이거나 사용자 정보를 찾을 수 없습니다.',
      );
    }

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

  @Get('unbookmark')
  async unbookmarkPopups(
    @Req() req,
    @Body('popupIds') popupIds: string[],
  ): Promise<{ message: string }> {
    // req.user가 존재하지 않으면 UnauthorizedException 던지기
    if (!req.user) {
      throw new UnauthorizedException(
        '유효하지 않은 ID Token이거나 사용자 정보를 찾을 수 없습니다.',
      );
    }

    const userId = req.user.id;
    if (!popupIds || popupIds.length === 0) {
      return { message: 'No popup IDs provided' };
    }

    await this.bookmarkService.unbookmarkPopups(userId, popupIds);
    return { message: 'Bookmarks removed successfully' };
  }

  @Get('/:popupId')
  async toggleBookmark(@Req() req, @Param('popupId') popupId: string) {
    // req.user가 존재하지 않으면 UnauthorizedException 던지기
    if (!req.user) {
      throw new UnauthorizedException(
        '유효하지 않은 ID Token이거나 사용자 정보를 찾을 수 없습니다.',
      );
    }

    const userId = req.user.id;
    const message = await this.bookmarkService.toggleBookmark(userId, popupId);
    return { message };
  }
}
