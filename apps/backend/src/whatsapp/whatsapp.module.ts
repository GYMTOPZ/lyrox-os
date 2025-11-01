import { Module } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { PrismaService } from '../common/prisma.service';
import { MongoService } from '../common/mongo.service';
import { OpenAIService } from '../ai/openai.service';
import { AgentFactoryService } from '../agents/agent-factory.service';

@Module({
  controllers: [WhatsAppController],
  providers: [
    WhatsAppService,
    PrismaService,
    MongoService,
    OpenAIService,
    AgentFactoryService,
  ],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}
