import { Module } from '@nestjs/common';
import { FortunesController } from './fortunes.controller';
import { FortunesService } from './fortunes.service';
import { LlmService } from './llm.service';

@Module({
  controllers: [FortunesController],
  providers: [FortunesService, LlmService],
})
export class FortunesModule {}
