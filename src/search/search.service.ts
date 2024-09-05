import { Injectable } from '@nestjs/common';
import { SearchRepository } from './search.repository';

@Injectable()
export class SearchService {
  constructor(private readonly searchRepository: SearchRepository) {}

  async searchPopupsByName(popupName: string) {
    const popups = await this.searchRepository.searchPopupsByName(popupName);
    return popups;
  }
}
