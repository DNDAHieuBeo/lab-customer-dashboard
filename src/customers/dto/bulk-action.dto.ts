import { IsArray, IsString } from 'class-validator';

export class BulkActionDto {
  @IsArray()
  @IsString({ each: true })
  customerIds: string[];
}