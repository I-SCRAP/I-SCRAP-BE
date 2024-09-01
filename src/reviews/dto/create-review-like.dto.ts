import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { ObjectId } from 'mongodb';

export class CreateReviewLikeDto {
  @IsNotEmpty()
  @Transform(({ value }) => new ObjectId(value))
  reviewId: ObjectId;

  @IsString()
  @IsNotEmpty()
  @IsIn(['Amazing', 'Like', 'Surprising', 'Impressive', 'Relatable'])
  type: string;
}
