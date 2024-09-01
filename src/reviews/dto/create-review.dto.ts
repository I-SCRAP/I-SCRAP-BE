import { ObjectId } from 'mongodb';
import { IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

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

  @Transform(({ value }) => new ObjectId(value))
  popupId: ObjectId;

  @IsBoolean()
  isPublic: boolean;

  @IsString()
  status: string;
}
