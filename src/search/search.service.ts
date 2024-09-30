import { Injectable } from '@nestjs/common';
import { SearchRepository } from './search.repository';
import { Category, FilterDto, Location, SortBy } from './dto/filter.dto';

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
      popupName,
    } = filterDto;

    const query: any = {};

    if (popupName) {
      query.name = { $regex: popupName, $options: 'i' };
    }

    const now = new Date();
    if (start || end) {
      const startDate = start ? new Date(start) : null;
      const endDate = end ? new Date(end) : null;

      if (startDate) query['dateRange.start'] = { $lte: endDate || now };
      if (endDate) query['dateRange.end'] = { $gte: startDate || now };
    }

    const locationMappings: { [key: string]: Location } = {
      전체: Location.ALL_REGIONS,
      송파구: Location.JAMSIL,
      성동구: Location.SEONGSU,
      마포구: Location.HONGDAE,
      종로: Location.JONGNO,
      용산구: Location.YONGSAN,
      영등포구: Location.THEHYUNDAI,
      경기도: Location.GYEONGGI_REGION,
    };

    const mappedLocationNames = Object.keys(locationMappings);
    const mapLocation = (inputLocation: string): string | null => {
      for (const key in locationMappings) {
        if (inputLocation.includes(locationMappings[key])) {
          return key;
        }
      }
      return null;
    };

    if (location) {
      const mappedLocation = location.map(mapLocation);
      const validLocations = mappedLocation.filter(
        (loc) => loc !== null,
      ) as Location[];

      if (validLocations.includes(Location.ALL_REGIONS)) {
        delete query['location.address'];
      } else if (validLocations.length === 0) {
        query['location.address'] = {
          $not: {
            $regex: `(${mappedLocationNames.join('|')})`,
            $options: 'i',
          },
        };
      } else {
        query['location.address'] = {
          $in: validLocations.map((loc) => new RegExp(loc, 'i')),
        };
      }
    }

    if (category) {
      if (category.includes(Category.ALL_CATEGORIES)) {
        delete query.category;
      } else if (category.includes(Category.OTHERS)) {
        query.category = {
          $not: {
            $in: [
              Category.CHARACTERS,
              Category.DRAMAS,
              Category.COSMETICS,
              Category.FASHION,
              Category.MUSIC,
              Category.FOOD,
              Category.SPORTS,
            ],
          },
        };
      } else {
        query.category = { $in: category };
      }
    }

    const popups = await this.searchRepository.findFilteredPopups(
      userId,
      query,
    );
    const sortedPopups = await this.searchRepository.sortPopups(popups, sortBy);
    return sortedPopups;
  }
}
