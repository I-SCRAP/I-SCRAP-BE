import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { Popup } from 'src/popups/entities/popup.entity';
import { validateRequiredField } from '..//utils/validation-utils';
import { FilterDto } from './dto/filter.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('popups')
  async searchPopups(@Query('popupName') popupName: string): Promise<Popup[]> {
    validateRequiredField('popupName', popupName);
    return this.searchService.searchPopupsByName(popupName);
  }

  @Get('popups/filter')
  async getFilteredPopups(@Query() filterDto: FilterDto) {
    const userId = '66b4b5d2f9415815acd65e6a';
    return this.searchService.getFilteredPopups(userId, filterDto);
  }
}
