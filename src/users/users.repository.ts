import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { ReviewLike } from 'src/reviews/entities/review-like.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    @InjectModel(ReviewLike.name)
    private readonly reviewLikeModel: Model<ReviewLike>,
  ) {}

  async findOneGetByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const newUser = new this.userModel(userData);
    return await newUser.save();
  }

  // 사용자의 리뷰 개수와 총 좋아요 수를 가져오는 함수
  async getUserReviewStats(userId: string) {
    // 리뷰 개수 계산
    const reviewCount = await this.reviewModel.countDocuments({
      userId: new ObjectId(userId),
    });

    // 해당 사용자가 작성한 리뷰들에 대한 총 좋아요 수 계산
    const totalLikes = await this.reviewLikeModel.aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: 1 }, // 총 좋아요 수를 합산
        },
      },
    ]);

    const totalLikesCount = totalLikes.length ? totalLikes[0].totalLikes : 0;

    return { reviewCount, totalLikesCount };
  }
}
