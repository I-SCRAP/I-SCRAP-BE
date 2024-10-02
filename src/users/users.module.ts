import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersRepository } from './users.repository';
import { User, UserSchema } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Review, ReviewSchema } from 'src/reviews/entities/review.entity';
import {
  ReviewLike,
  ReviewLikeSchema,
} from 'src/reviews/entities/review-like.entity';
import {
  Bookmark,
  BookmarkSchema,
} from 'src/bookmarks/entities/bookmarks.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // Mongoose 모델 등록
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]), // Review 모델 등록
    MongooseModule.forFeature([
      { name: ReviewLike.name, schema: ReviewLikeSchema },
    ]), // ReviewLike 모델 등록
    MongooseModule.forFeature([
      { name: Bookmark.name, schema: BookmarkSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService],
  exports: [UsersRepository],
})
export class UsersModule {}
