import {
  IsOptional,
  IsString,
  MinLength,
  IsNumber,
  IsPositive,
  IsInt,
  IsArray,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    example: 'Tesla Cybertruck T-shirt',
    description: 'Product title',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({
    example: 29.99,
    description: 'Product price',
    required: false,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiProperty({
    example: 'High quality Tesla merch',
    description: 'Product description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'tesla_cybertruck_t-shirt',
    description: 'Product slug (auto-generated if omitted)',
    required: false,
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: 100, description: 'Product stock', required: false })
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @ApiProperty({ example: ['S', 'M', 'L', 'XL'], description: 'Product sizes' })
  @IsArray()
  @IsString({ each: true })
  sizes: string[];

  @ApiProperty({
    example: 'men',
    description: 'Product gender',
    enum: ['men', 'women', 'kid', 'unisex'],
  })
  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender: string;

  @ApiProperty({
    example: ['shirt', 'tesla'],
    description: 'Product tags',
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags: string[];

  @ApiProperty({
    example: ['https://example.com/image.jpg'],
    description: 'Product image URLs',
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}
