import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FortunesModule } from './fortunes/fortunes.module';
import { CreditsModule } from './credits/credits.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    FortunesModule,
    CreditsModule,
    SubscriptionsModule,
  ],
})
export class AppModule {}
