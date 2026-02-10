import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from './llm.service';
import { CreateFortuneDto } from './dto/fortunes.dto';

@Injectable()
export class FortunesService {
  private readonly logger = new Logger(FortunesService.name);
  private readonly FORTUNE_COST = 3;

  constructor(
    private prisma: PrismaService,
    private llmService: LlmService,
  ) {}

  async createFortune(userId: string, dto: CreateFortuneDto) {
    // Check user credits
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.credits < this.FORTUNE_COST) {
      throw new BadRequestException('Yetersiz kredi! Kredi satın alın.');
    }

    // Determine person data for fortune
    let personData: any;
    if (dto.forSelf) {
      personData = {
        name: user.fullName || 'Anonim',
        birthDate: user.birthDate?.toISOString().split('T')[0] || 'Bilinmiyor',
        relationshipStatus: user.relationshipStatus || 'Bilinmiyor',
        profession: user.profession || 'Bilinmiyor',
      };
    } else {
      if (!dto.guestData) {
        throw new BadRequestException('Misafir bilgileri gerekli.');
      }
      personData = {
        name: dto.guestData.name,
        birthDate: dto.guestData.birthDate,
        relationshipStatus: dto.guestData.relationshipStatus,
        profession: dto.guestData.profession,
        gender: dto.guestData.gender,
      };
    }

    // Generate interpretation using LLM
    this.logger.log(`Creating fortune for user: ${userId}`);
    const interpretation = await this.llmService.generateFortuneInterpretation(
      dto.photos,
      personData,
    );

    // Create fortune and deduct credits in transaction
    const [fortune] = await this.prisma.$transaction([
      this.prisma.fortune.create({
        data: {
          userId,
          photos: dto.photos,
          forSelf: dto.forSelf,
          guestName: dto.guestData?.name,
          guestGender: dto.guestData?.gender,
          guestBirthDate: dto.guestData?.birthDate ? new Date(dto.guestData.birthDate) : null,
          guestRelationshipStatus: dto.guestData?.relationshipStatus,
          guestProfession: dto.guestData?.profession,
          interpretation,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { credits: { decrement: this.FORTUNE_COST } },
      }),
    ]);

    this.logger.log(`Fortune created: ${fortune.id}, credits deducted`);
    return fortune;
  }

  async getFortunesList(userId: string) {
    const fortunes = await this.prisma.fortune.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        forSelf: true,
        guestName: true,
        interpretation: true,
      },
    });

    return fortunes.map((f) => ({
      id: f.id,
      createdAt: f.createdAt,
      forSelf: f.forSelf,
      guestName: f.guestName,
      preview: f.interpretation.substring(0, 100) + '...',
    }));
  }

  async getFortuneById(userId: string, fortuneId: string) {
    const fortune = await this.prisma.fortune.findUnique({
      where: { id: fortuneId },
    });

    if (!fortune) {
      throw new NotFoundException('Fal bulunamadı.');
    }

    if (fortune.userId !== userId) {
      throw new ForbiddenException('Bu fala erişim yetkiniz yok.');
    }

    return fortune;
  }
}
