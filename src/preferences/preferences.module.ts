import { Module } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { PreferencesController } from './preferences.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { S3Service } from 'src/s3/s3.service';
import { PreferencesRepository } from './preferences.repository';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
  ],
  controllers: [PreferencesController],
  providers: [PreferencesService, PreferencesRepository, S3Service],
})
export class PreferencesModule {}
