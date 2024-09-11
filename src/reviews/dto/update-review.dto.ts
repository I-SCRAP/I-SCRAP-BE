import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  ReviewElement,
  StickerElement,
  TextElement,
} from '../entities/review-element.entity';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  shortComment?: string;

  @IsString()
  @IsOptional()
  detailedReview?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  photos?: string[];

  @IsString()
  @IsOptional()
  cardFront?: string;

  @IsString()
  @IsOptional()
  cardBack?: string;

  @IsString()
  @IsOptional()
  layout?: string;

  @IsString()
  @IsOptional()
  backgroundColor?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Transform(({ value }) =>
    value.map((element) => {
      if (element.type === 'text') {
        return Object.assign(new TextElement(), element);
      } else if (element.type === 'sticker') {
        return Object.assign(new StickerElement(), element);
      }
    }),
  )
  elements?: ReviewElement[];
}
