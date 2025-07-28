import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SearchCustomerDto {
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

export interface SearchResult<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterOptions {
  types: string[];
  statuses: string[];
}

export interface CustomerStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}
