import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { ObjectId } from 'mongodb';

export class CreateSubCommentDto {
  @IsNotEmpty()
  @Transform(({ value }) => new ObjectId(value))
  commentId: ObjectId;

  @IsString()
  @IsNotEmpty()
  contents: string;
}
