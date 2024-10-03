import { Controller, Get, Body, Patch, UseGuards, Req } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Patch()
  updatePreference(
    @Req() req,
    @Body() updatePreferenceDto: UpdatePreferenceDto,
  ) {
    const userId = req.user.id;
    return this.preferencesService.updatePreference(
      userId,
      updatePreferenceDto,
    );
  }

  @Get()
  getPreference(@Req() req) {
    const userId = req.user.id;
    return this.preferencesService.getPreference(userId);
  }

  @Get('character')
  getPreferenceCharacter(@Req() req) {
    const userId = req.user?.id;
    return this.preferencesService.getPreferenceCharacter(userId);
  }
}
