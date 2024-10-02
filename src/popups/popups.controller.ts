import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { PopupsService } from './popups.service';
import { validateRequiredField } from 'src/utils/validation-utils';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('popups')
export class PopupsController {
  constructor(private readonly popupsService: PopupsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('detail/:id')
  async getPopupDetail(@Param('id') id: string, @Req() req) {
    const userId = req.user?.id;
    validateRequiredField('id', id);
    const popupDetail = await this.popupsService.getPopupDetail(id, userId);
    return popupDetail;
  }

  @UseGuards(JwtAuthGuard)
  @Get('home/personalized-popups')
  async getPersonalizedPopups(@Req() req) {
    // req.user가 존재하지 않으면 UnauthorizedException 던지기
    if (!req.user) {
      throw new UnauthorizedException(
        '유효하지 않은 ID Token이거나 사용자 정보를 찾을 수 없습니다.',
      );
    }

    const userName = req.user?.name;
    const popups = await this.popupsService.getPersonalizedPopups();
    return {
      userName,
      popups,
    };
  }

  @Get('monthly')
  getMonthlyPopups() {
    return this.popupsService.getMonthlyPopups();
  }
}
