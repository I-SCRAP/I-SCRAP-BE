import { Injectable } from '@nestjs/common';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { PreferencesRepository } from './preferences.repository';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class PreferencesService {
  constructor(
    private readonly preferenceRepository: PreferencesRepository,
    private readonly s3Service: S3Service,
  ) {}

  async updatePreference(
    userId: string,
    updatePreferenceDto: UpdatePreferenceDto,
  ) {
    return this.preferenceRepository.updatePreference(
      userId,
      updatePreferenceDto,
    );
  }

  async getPreference(userId: string) {
    return this.preferenceRepository.getPreference(userId);
  }

  async getPreferenceCharacter(userId: string) {
    let icecreamCharacter: string =
      await this.preferenceRepository.getPreferenceCharacter(userId);

    if (!icecreamCharacter) {
      icecreamCharacter = 'vanilla';
    }
    const icecreamCharacterImage: string =
      await this.s3Service.generatePresignedDownloadUrlForPublicFile(
        process.env.S3_IMAGE_BUCKET,
        `icecreamCharacter/${icecreamCharacter}.svg`,
      );

    console.log(icecreamCharacterImage);

    return icecreamCharacterImage;
  }
}
