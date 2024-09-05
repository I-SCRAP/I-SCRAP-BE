import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { Popup } from 'src/popups/entities/popup.entity';
import { validateRequiredField } from '..//utils/validation-utils';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('popups')
  async searchPopups(@Query('popupName') popupName: string): Promise<Popup[]> {
    validateRequiredField('popupName', popupName);
    return this.searchService.searchPopupsByName(popupName);
  }
}
