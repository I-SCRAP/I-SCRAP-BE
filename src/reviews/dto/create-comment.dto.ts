import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';
import { ObjectId } from 'mongodb';

export class CreateCommentDto {
  @IsMongoId()
  @IsNotEmpty()
  @Type(() => ObjectId)
  reviewId: ObjectId;

  @IsString()
  @IsNotEmpty()
  contents: string;
}
