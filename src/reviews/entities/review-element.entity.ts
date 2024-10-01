import { Type } from 'class-transformer';
import {
  IsHexColor,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class TextElement {
  @IsString()
  type: 'text';

  @IsString()
  content: string;

  @IsString()
  font: string;

  @IsNumber()
  size: number;

  @IsHexColor()
  color: string;

  @Type(() => Object)
  @IsObject()
  position: {
    x: number;
    y: number;
  };

  @IsNumber()
  @IsOptional()
  rotation?: number;
}

export class StickerElement {
  @IsString()
  type: 'sticker';

  @IsString()
  sticker_id: string;

  @Type(() => Object)
  @IsObject()
  size: {
    width: number;
    height: number;
  };

  @IsNumber()
  @IsOptional()
  rotation?: number;

  @Type(() => Object)
  @IsObject()
  position: {
    x: number;
    y: number;
  };
}

export type ReviewElement = TextElement | StickerElement;
