import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FortunesService } from './fortunes.service';
import { CreateFortuneDto } from './dto/fortunes.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Fortunes')
@Controller('api/fortunes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FortunesController {
  constructor(private fortunesService: FortunesService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni fal oluştur (3 kredi düşer)' })
  createFortune(@Request() req: any, @Body() dto: CreateFortuneDto) {
    return this.fortunesService.createFortune(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Fal geçmişi listesi' })
  getFortunesList(@Request() req: any) {
    return this.fortunesService.getFortunesList(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fal detayı' })
  getFortuneById(@Request() req: any, @Param('id') id: string) {
    return this.fortunesService.getFortuneById(req.user.userId, id);
  }
}
