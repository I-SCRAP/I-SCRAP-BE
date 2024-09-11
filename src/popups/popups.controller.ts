import { Controller, Get, Query } from '@nestjs/common';
import { PopupsService } from './popups.service';
import { validateRequiredField } from 'src/utils/validation-utils';

@Controller('popups')
export class PopupsController {
  constructor(private readonly popupsService: PopupsService) {}

  @Get('detail')
  getPopupDetail(@Query('id') id: string) {
    validateRequiredField('id', id);
    return this.popupsService.getPopupDetail(id);
  }

  @Get('sorted-by-bookmarks')
  getPopupsSortedByBookmarks() {
    return this.popupsService.getPopupsSortedByBookmarks();
  }

  @Get('home/personalized-popups')
  getPersonalizedPopups() {
    return this.popupsService.getPersonalizedPopups();
  }

  @Get('monthly')
  getMonthlyPopups() {
    return this.popupsService.getMonthlyPopups();
  }
}
