import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsIn, IsOptional } from 'class-validator';

export class OnboardingDto {
  @ApiProperty({ example: 'Ayşe Yılmaz' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '1990-05-15' })
  @IsDateString()
  birthDate: string;

  @ApiProperty({ example: 'Bekar', enum: ['Bekar', 'Evli', 'Platonik', 'Diğer'] })
  @IsIn(['Bekar', 'Evli', 'Platonik', 'Diğer'])
  relationshipStatus: string;

  @ApiProperty({ example: 'Mühendis' })
  @IsString()
  profession: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Evli', enum: ['Bekar', 'Evli', 'Platonik', 'Diğer'] })
  @IsOptional()
  @IsIn(['Bekar', 'Evli', 'Platonik', 'Diğer'])
  relationshipStatus?: string;

  @ApiPropertyOptional({ example: 'Doktor' })
  @IsOptional()
  @IsString()
  profession?: string;
}
