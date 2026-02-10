import { Controller, Post, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { OnboardingDto, UpdateProfileDto } from './dto/users.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('api/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('onboarding')
  @ApiOperation({ summary: 'Onboarding tamamla - 6 kredi kazan' })
  completeOnboarding(@Request() req: any, @Body() dto: OnboardingDto) {
    return this.usersService.completeOnboarding(req.user.userId, dto);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Kullanıcı profilini getir' })
  getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Profili güncelle (sadece ilişki durumu ve meslek)' })
  updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, dto);
  }
}
