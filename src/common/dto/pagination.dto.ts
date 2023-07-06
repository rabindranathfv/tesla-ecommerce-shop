// import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  // @Type(() => Number) transform data if not have transform and transformOptions on main.ts
  limit?: number;

  @IsOptional()
  @Min(0)
  // page
  offset?: number;
}
