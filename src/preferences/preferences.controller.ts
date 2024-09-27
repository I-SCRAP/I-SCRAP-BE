import { Controller, Get, Body, Patch } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { UpdatePreferenceDto } from './dto/update-preference.dto';

@Controller('preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Patch()
  updatePreference(@Body() updatePreferenceDto: UpdatePreferenceDto) {
    const userId = '66b4b5d2f9415815acd65e6a';
    return this.preferencesService.updatePreference(
      userId,
      updatePreferenceDto,
    );
  }

  @Get()
  getPreference() {
    const userId = '66b4b5d2f9415815acd65e6a';
    return this.preferencesService.getPreference(userId);
  }

  @Get('character')
  getPreferenceCharacter() {
    const userId = '66b4b5d2f9415815acd65e6a';
    return this.preferencesService.getPreferenceCharacter(userId);
  }
}
