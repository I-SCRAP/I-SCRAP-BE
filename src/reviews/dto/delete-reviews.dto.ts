import { IsArray, ArrayNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { ObjectId } from 'mongodb';

export class DeleteReviewsDto {
  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => value.map((v) => new ObjectId(v)))
  reviewIds: ObjectId[];
}
