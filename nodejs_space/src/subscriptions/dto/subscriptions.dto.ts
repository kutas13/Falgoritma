import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Plan type', enum: ['weekly', 'monthly', 'yearly'] })
  @IsString()
  @IsIn(['weekly', 'monthly', 'yearly'])
  planType: string;
}

export class SubscriptionPlanDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  planType: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  credits: number;

  @ApiProperty()
  features: string[];
}
