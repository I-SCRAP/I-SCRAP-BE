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
}
