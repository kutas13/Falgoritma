import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString, ArrayMaxSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GuestDataDto {
  @ApiProperty({ example: 'Mehmet' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Erkek' })
  @IsString()
  gender: string;

  @ApiProperty({ example: '1985-03-20' })
  @IsString()
  birthDate: string;

  @ApiProperty({ example: 'Bekar' })
  @IsString()
  relationshipStatus: string;

  @ApiProperty({ example: 'Avukat' })
  @IsString()
  profession: string;
}

export class CreateFortuneDto {
  @ApiProperty({ description: 'Base64 encoded photos (max 5)', type: [String] })
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  photos: string[];

  @ApiProperty({ description: 'Is this fortune for the user themselves?' })
  @IsBoolean()
  forSelf: boolean;

  @ApiPropertyOptional({ description: 'Guest data if forSelf is false' })
  @IsOptional()
  @ValidateNested()
  @Type(() => GuestDataDto)
  guestData?: GuestDataDto;
}
