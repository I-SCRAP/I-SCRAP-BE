import { Controller, Get, Post, Query } from '@nestjs/common';
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
}
