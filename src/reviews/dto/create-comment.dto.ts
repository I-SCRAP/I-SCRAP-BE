import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { ObjectId } from 'mongodb';

export class CreateCommentDto {
  @IsNotEmpty()
  @Transform(({ value }) => new ObjectId(value))
  reviewId: ObjectId;

  @IsString()
  @IsNotEmpty()
  contents: string;
}
