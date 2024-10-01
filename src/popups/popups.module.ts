import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PopupsController } from './popups.controller';
import { PopupsService } from './popups.service';
import { PopupsRepository } from './popups.repository';
import { Popup, PopupSchema } from './entities/popup.entity';
import { BookmarksModule } from 'src/bookmarks/bookmarks.module';
import { UsersModule } from 'src/users/users.module';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Popup.name, schema: PopupSchema }]),
    forwardRef(() => BookmarksModule),
    UsersModule,
    S3Module,
  ],
  controllers: [PopupsController],
  providers: [PopupsService, PopupsRepository],
  exports: [PopupsService, PopupsRepository],
})
export class PopupsModule {}
