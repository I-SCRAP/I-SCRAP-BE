import { Injectable } from '@nestjs/common';
import { SearchRepository } from './search.repository';
import { FilterDto, Location, SortBy } from './dto/filter.dto';

@Injectable()
export class SearchService {
  constructor(private readonly searchRepository: SearchRepository) {}

  async searchPopupsByName(popupName: string) {
    const popups = await this.searchRepository.searchPopupsByName(popupName);
    return popups;
  }

  async getFilteredPopups(userId: string, filterDto: FilterDto) {
    const {
      sortBy = SortBy.POPULARITY,
      start,
      end,
      location,
      category,
    } = filterDto;

    const query: any = {};

    const now = new Date();
    if (start || end) {
      const startDate = start ? new Date(start) : null;
      const endDate = end ? new Date(end) : null;

      if (startDate) query['dateRange.start'] = { $lte: endDate || now };
      if (endDate) query['dateRange.end'] = { $gte: startDate || now };
    }

    if (location) {
      if (location.includes(Location.ALL_REGIONS)) {
        delete query['location.address'];
      } else if (location.includes(Location.OTHER_REGIONS)) {
        query['location.address'] = {
          $not: {
            $regex: `^(${Location.JAMSIL}|${Location.SEONGSU}|${Location.HONGDAE}|${Location.JONGNO}|${Location.YONGSAN}|${Location.THEHYUNDAI}|${Location.GYEONGGI_REGION})`,
            $options: 'i',
          },
        };
      } else {
        query['location.address'] = {
          $in: location.map((loc) => new RegExp(loc, 'i')),
        };
      }
    }

    if (category) {
      query.category = { $in: category };
    }

    const popups = await this.searchRepository.findFilteredPopups(
      userId,
      query,
    );
    const sortedPopups = await this.searchRepository.sortPopups(popups, sortBy);
    return sortedPopups;
  }
}
