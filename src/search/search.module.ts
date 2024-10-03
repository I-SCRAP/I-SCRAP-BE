import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Popup, PopupSchema } from 'src/popups/entities/popup.entity';
import { SearchRepository } from './search.repository';
import {
  Bookmark,
  BookmarkSchema,
} from 'src/bookmarks/entities/bookmarks.entity';
import { Review, ReviewSchema } from 'src/reviews/entities/review.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Popup.name, schema: PopupSchema },
      { name: Bookmark.name, schema: BookmarkSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
    UsersModule,
  ],
  controllers: [SearchController],
  providers: [SearchService, SearchRepository],
})
export class SearchModule {}
