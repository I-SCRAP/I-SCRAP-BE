import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsRepository } from './reviews.repository';
import { Review, ReviewSchema } from './entities/review.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './entities/comment.entity';
import { SubComment, SubCommentSchema } from './entities/sub-comment.entity';
import { ReviewLike, ReviewLikeSchema } from './entities/review-like.entity';
import { S3Service } from 'src/s3/s3.service';
import { Popup, PopupSchema } from 'src/popups/entities/popup.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: SubComment.name, schema: SubCommentSchema },
      { name: ReviewLike.name, schema: ReviewLikeSchema },
      { name: Popup.name, schema: PopupSchema },
    ]),
    UsersModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository, S3Service],
})
export class ReviewsModule {}
