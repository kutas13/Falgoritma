import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/subscriptions.dto';

interface AuthRequest extends ExpressRequest {
  user: { userId: string; email: string };
}

@ApiTags('Subscriptions')
@Controller('api/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get available subscription plans' })
  @ApiResponse({ status: 200, description: 'List of subscription plans' })
  getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subscribe to a plan' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  async subscribe(@Request() req: AuthRequest, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.subscribe(req.user.userId, dto);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user subscription status' })
  @ApiResponse({ status: 200, description: 'User subscription status' })
  async getStatus(@Request() req: AuthRequest) {
    return this.subscriptionsService.getUserSubscriptionStatus(req.user.userId);
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel active subscription' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled' })
  async cancel(@Request() req: AuthRequest) {
    return this.subscriptionsService.cancelSubscription(req.user.userId);
  }
}
