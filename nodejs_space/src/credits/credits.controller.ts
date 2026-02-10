import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreditsService } from './credits.service';
import { SimulatePurchaseDto } from './dto/credits.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Credits')
@Controller('api/credits')
export class CreditsController {
  constructor(private creditsService: CreditsService) {}

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kredi bakiyesi' })
  getBalance(@Request() req: any) {
    return this.creditsService.getBalance(req.user.userId);
  }

  @Get('packages')
  @ApiOperation({ summary: 'Kredi paketleri' })
  getPackages() {
    return this.creditsService.getPackages();
  }

  @Post('simulate-purchase')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Simüle kredi satın alma' })
  simulatePurchase(@Request() req: any, @Body() dto: SimulatePurchaseDto) {
    return this.creditsService.simulatePurchase(req.user.userId, dto.packageId);
  }
}
