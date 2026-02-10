import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SimulatePurchaseDto {
  @ApiProperty({ example: 'mini', description: 'Package ID: mini, standart, avantajli, or power' })
  @IsString()
  packageId: string;
}
