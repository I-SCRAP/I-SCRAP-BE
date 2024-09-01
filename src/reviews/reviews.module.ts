import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsRepository } from './reviews.repository';
import { Review, ReviewSchema } from './entities/review.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './entities/comment.entity';
import { SubComment, SubCommentSchema } from './entities/subComment.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: SubComment.name, schema: SubCommentSchema },
    ]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository],
})
export class ReviewsModule {}
