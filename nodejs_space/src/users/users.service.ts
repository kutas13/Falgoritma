import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnboardingDto, UpdateProfileDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async completeOnboarding(userId: string, dto: OnboardingDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (user?.onboardingCompleted) {
      throw new BadRequestException('Onboarding zaten tamamlanmış.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
        birthDate: new Date(dto.birthDate),
        relationshipStatus: dto.relationshipStatus,
        profession: dto.profession,
        credits: 6,
        onboardingCompleted: true,
      },
    });

    this.logger.log(`Onboarding completed for user: ${userId}, awarded 6 credits`);
    return this.sanitizeUser(updatedUser);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.relationshipStatus && { relationshipStatus: dto.relationshipStatus }),
        ...(dto.profession && { profession: dto.profession }),
      },
    });

    this.logger.log(`Profile updated for user: ${userId}`);
    return this.sanitizeUser(updatedUser);
  }

  private sanitizeUser(user: any) {
    if (!user) return null;
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
