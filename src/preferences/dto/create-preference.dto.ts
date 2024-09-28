import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Category } from 'src/search/dto/filter.dto';

export const flavorList = [
  'apple',
  'cherry',
  'choco',
  'coffee',
  'cookie-and-cream',
  'cotton-candy',
  'green-tea',
  'marshmallow',
  'mint-choco',
  'peach-yogurt',
  'peach',
  'shooting-star',
  'strawberry',
  'tropical',
  'vanilla',
  'yogurt',
];

export class CreatePreferenceDto {
  @IsOptional()
  @IsString()
  @IsEnum(flavorList, { message: `유효한 맛 리스트: ${flavorList.join(', ')}` })
  icecreamCharacter?: string;

  @IsOptional()
  @IsString({ each: true })
  @IsEnum(Category, { each: true })
  preferredCategories?: string[];
}
