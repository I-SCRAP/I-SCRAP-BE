import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Popup, PopupSchema } from 'src/popups/entities/popup.entity';
import { SearchRepository } from './search.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Popup.name, schema: PopupSchema }]),
  ],
  controllers: [SearchController],
  providers: [SearchService, SearchRepository],
})
export class SearchModule {}
