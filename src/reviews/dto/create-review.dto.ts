import { ObjectId } from 'mongodb';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateReviewDto {
  @IsString()
  place: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  visitDate: Date;

  @IsNumber()
  amount: number;

  @IsString()
  companions: string;

  @IsNumber()
  rating: number;

  @Transform(({ value }) => new ObjectId(value))
  @IsNotEmpty()
  popupId: ObjectId;

  @IsBoolean()
  @IsNotEmpty()
  isPublic: boolean;

  @IsString()
  @IsNotEmpty()
  cardImage: string;
}
