import { ObjectId } from 'mongodb';
import {
  IsBoolean,
  IsDate,
  IsMongoId,
  IsNumber,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @IsString()
  place: string;

  @IsDate()
  @Type(() => Date)
  visitDate: Date;

  @IsNumber()
  amount: number;

  @IsString()
  companions: string;

  @IsNumber()
  rating: number;

  @IsMongoId()
  @Type(() => ObjectId)
  popupId: ObjectId;

  @IsBoolean()
  isPublic: boolean;

  @IsString()
  status: string;
}
