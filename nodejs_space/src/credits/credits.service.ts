import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const CREDIT_PACKAGES = [
  { id: 'mini', name: 'Mini', credits: 6, priceTL: 39 },
  { id: 'standart', name: 'Standart', credits: 12, priceTL: 69 },
  { id: 'avantajli', name: 'Avantajlı', credits: 18, priceTL: 89 },
  { id: 'power', name: 'Power', credits: 30, priceTL: 169 },
];

@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);

  constructor(private prisma: PrismaService) {}

  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });
    return { credits: user?.credits || 0 };
  }

  getPackages() {
    return CREDIT_PACKAGES;
  }

  async simulatePurchase(userId: string, packageId: string) {
    const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      throw new BadRequestException('Geçersiz paket ID.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: pkg.credits } },
      select: { credits: true },
    });

    this.logger.log(`Simulated purchase: User ${userId} bought ${pkg.name} (+${pkg.credits} credits)`);
    
    return {
      success: true,
      package: pkg,
      newBalance: updatedUser.credits,
    };
  }
}
