import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Bookmark, BookmarkSchema } from './entities/bookmarks.entity';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksRepository } from './bookmarks.repository';
import { PopupsModule } from 'src/popups/popups.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bookmark.name, schema: BookmarkSchema },
    ]),
    forwardRef(() => PopupsModule),
    UsersModule,
  ],
  controllers: [BookmarksController],
  providers: [BookmarksService, BookmarksRepository],
  exports: [BookmarksService, BookmarksRepository],
})
export class BookmarksModule {}
