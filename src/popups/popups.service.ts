import { Injectable } from '@nestjs/common';
import { PopupsRepository } from './popups.repository';

@Injectable()
export class PopupsService {
  constructor(private readonly popupsRepository: PopupsRepository) {}

  async getPopupDetail(popupId: string) {
    const popupDetail = await this.popupsRepository.getPopupDetail(popupId);
    return popupDetail;
  }

  async getPersonalizedPopups() {
    return this.popupsRepository.getPersonalizedPopups();
  }

  async getMonthlyPopups() {
    return this.popupsRepository.getMonthlyPopups();
  }
}
