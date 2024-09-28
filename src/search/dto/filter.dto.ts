import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
  IsString,
} from 'class-validator';

export enum SortBy {
  POPULARITY = 'popularity',
  RATING = 'rating',
}

export enum Category {
  ALL_CATEGORIES = '전체',
  CHARACTERS = '캐릭터',
  SPORTS = '스포츠',
  DRAMAS = '드라마',
  COSMETICS = '뷰티',
  FASHION = '패션',
  MUSIC = '음악',
  FOOD = '음식',
  OTHERS = '그외',
}

export enum Location {
  ALL_REGIONS = '전체',
  JAMSIL = '잠실',
  SEONGSU = '성수',
  HONGDAE = '홍대',
  JONGNO = '종로',
  YONGSAN = '용산',
  THEHYUNDAI = '더현대',
  GYEONGGI_REGION = '경기도',
  OTHER_REGIONS = '그외',
}

export class FilterDto {
  @IsOptional()
  @IsString()
  popupName?: string;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy;

  @IsOptional()
  @IsDateString()
  start?: string;

  @IsOptional()
  @IsDateString()
  end?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsEnum(Location, { each: true })
  location?: Location[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsEnum(Category, { each: true })
  category?: Category[];
}
