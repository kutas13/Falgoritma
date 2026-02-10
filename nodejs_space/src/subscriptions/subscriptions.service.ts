import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto, SubscriptionPlanDto } from './dto/subscriptions.dto';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  // Subscription plans configuration
  private readonly plans: SubscriptionPlanDto[] = [
    {
      id: 'weekly',
      name: 'Haftalık Premium',
      planType: 'weekly',
      price: 29.99,
      credits: 15,
      features: ['Haftalık 15 kredi', 'Öncelikli destek', 'Reklamsız deneyim'],
    },
    {
      id: 'monthly',
      name: 'Aylık Premium',
      planType: 'monthly',
      price: 79.99,
      credits: 50,
      features: ['Aylık 50 kredi', 'Öncelikli destek', 'Reklamsız deneyim', '%20 tasarruf'],
    },
    {
      id: 'yearly',
      name: 'Yıllık Premium',
      planType: 'yearly',
      price: 599.99,
      credits: 500,
      features: ['Yıllık 500 kredi', 'Öncelikli destek', 'Reklamsız deneyim', '%40 tasarruf', 'VIP rozet'],
    },
  ];

  constructor(private prisma: PrismaService) {}

  getPlans(): SubscriptionPlanDto[] {
    return this.plans;
  }

  async subscribe(userId: string, dto: CreateSubscriptionDto) {
    const plan = this.plans.find((p) => p.planType === dto.planType);
    if (!plan) {
      throw new BadRequestException('Geçersiz plan türü');
    }

    // Calculate end date based on plan type
    const startDate = new Date();
    const endDate = new Date();
    
    switch (dto.planType) {
      case 'weekly':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    // Create subscription and update user in transaction
    const [subscription] = await this.prisma.$transaction([
      this.prisma.subscription.create({
        data: {
          userId,
          planType: dto.planType,
          status: 'active',
          startDate,
          endDate,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          premiumExpiresAt: endDate,
          credits: { increment: plan.credits },
        },
      }),
    ]);

    this.logger.log(`User ${userId} subscribed to ${dto.planType} plan`);

    return {
      subscription,
      message: `${plan.name} planına başarıyla abone oldunuz! ${plan.credits} kredi hesabınıza eklendi.`,
    };
  }

  async getActiveSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
        endDate: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    return subscription;
  }

  async cancelSubscription(userId: string) {
    const activeSubscription = await this.getActiveSubscription(userId);
    
    if (!activeSubscription) {
      throw new BadRequestException('Aktif abonelik bulunamadı');
    }

    await this.prisma.$transaction([
      this.prisma.subscription.update({
        where: { id: activeSubscription.id },
        data: { status: 'cancelled' },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: false,
          premiumExpiresAt: null,
        },
      }),
    ]);

    this.logger.log(`User ${userId} cancelled subscription`);

    return { message: 'Aboneliğiniz iptal edildi.' };
  }

  async getUserSubscriptionStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        isPremium: true,
        premiumExpiresAt: true,
        credits: true,
      },
    });

    const activeSubscription = await this.getActiveSubscription(userId);

    return {
      isPremium: user?.isPremium ?? false,
      premiumExpiresAt: user?.premiumExpiresAt,
      credits: user?.credits ?? 0,
      activeSubscription,
    };
  }
}
