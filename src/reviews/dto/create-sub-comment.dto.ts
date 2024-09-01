import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';
import { ObjectId } from 'mongodb';

export class CreateSubCommentDto {
  @IsMongoId()
  @IsNotEmpty()
  @Type(() => ObjectId)
  commentId: ObjectId;

  @IsString()
  @IsNotEmpty()
  contents: string;
}
