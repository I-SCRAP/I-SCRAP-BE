import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { PopupsService } from './popups.service';
import { validateRequiredField } from 'src/utils/validation-utils';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('popups')
export class PopupsController {
  constructor(private readonly popupsService: PopupsService) {}

  @Get('detail/:id')
  getPopupDetail(@Param('id') id: string) {
    validateRequiredField('id', id);
    return this.popupsService.getPopupDetail(id);
  }

  @UseGuards(JwtAuthGuard) // JwtAuthGuard 사용
  @Get('home/personalized-popups')
  async getPersonalizedPopups(@Req() req) {
    // req.user는 JwtAuthGuard에서 인증된 사용자 정보가 추가된 객체
    const userName = req.user?.name; // 인증된 사용자 정보에서 이름 추출
    const popups = await this.popupsService.getPersonalizedPopups();
    return {
      userName, // 유저 이름을 응답에 포함
      popups,
    };
  }

  @Get('monthly')
  getMonthlyPopups() {
    return this.popupsService.getMonthlyPopups();
  }
}
