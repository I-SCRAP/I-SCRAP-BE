import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PopupsController } from './popups.controller';
import { PopupsService } from './popups.service';
import { PopupsRepository } from './popups.repository';
import { Popup, PopupSchema } from './entities/popup.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Popup.name, schema: PopupSchema }]),
  ],
  controllers: [PopupsController],
  providers: [PopupsService, PopupsRepository],
  exports: [PopupsService, PopupsRepository],
})
export class PopupsModule {}
