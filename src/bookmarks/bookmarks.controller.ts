import { Body, Controller, Get, Post, Query } from '@nestjs/common';
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
