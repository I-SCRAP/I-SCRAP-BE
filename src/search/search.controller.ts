import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { Popup } from 'src/popups/entities/popup.entity';
import { validateRequiredField } from '..//utils/validation-utils';
import { FilterDto } from './dto/filter.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('popups')
  async searchPopups(@Query('popupName') popupName: string): Promise<Popup[]> {
    validateRequiredField('popupName', popupName);
    return this.searchService.searchPopupsByName(popupName);
  }

  @UseGuards(JwtAuthGuard)
  @Get('popups/filter')
  async getFilteredPopups(@Query() filterDto: FilterDto, @Req() req) {
    const userId = req.user?.id;
    return this.searchService.getFilteredPopups(userId, filterDto);
  }
}
