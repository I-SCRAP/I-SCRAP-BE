import { ObjectId } from 'mongodb';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateReviewDto {
  @IsOptional()
  @IsString()
  place?: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  visitDate: Date;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  companions?: string;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @Transform(({ value }) => new ObjectId(value))
  @IsNotEmpty()
  popupId: ObjectId;

  @IsBoolean()
  @IsNotEmpty()
  isPublic: boolean;

  @IsString()
  @IsNotEmpty()
  cardImage: string;

  @IsString()
  @IsNotEmpty()
  cardBack: string;

  @IsOptional()
  @IsString()
  shortComment?: string;
}
