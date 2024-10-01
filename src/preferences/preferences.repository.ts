import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class PreferencesRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async updatePreference(
    userId: string,
    updatePreferenceDto: UpdatePreferenceDto,
  ) {
    if (userId) {
      await this.userModel.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: updatePreferenceDto },
        { new: true },
      );
    } else {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }
  }

  async getPreference(userId: string) {
    const userPreference = this.userModel.findOne(
      { _id: new ObjectId(userId) },
      { _id: 0, id: '$_id', preferredCategories: 1, icecreamCharacter: 1 },
    );

    if (!userPreference) {
      throw new NotFoundException('해당 유저를 찾을 수 없습니다.');
    }

    return userPreference;
  }

  async getPreferenceCharacter(userId: string): Promise<string> {
    const userPreference = await this.getPreference(userId);
    const icecreamCharacter: string = userPreference.icecreamCharacter;

    return icecreamCharacter;
  }
}
