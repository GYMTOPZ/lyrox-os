import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { MongoService } from '../common/mongo.service';
import { OpenAIService } from '../ai/openai.service';
import { PermanentCustomerAgent } from './permanent-customer-agent';

@Injectable()
export class AgentFactoryService {
  private readonly logger = new Logger(AgentFactoryService.name);
  private activeAgents: Map<string, PermanentCustomerAgent> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly mongo: MongoService,
    private readonly openai: OpenAIService,
  ) {}

  // Get or create agent for a customer
  async getOrCreateAgent(
    customerPhone: string,
    companyId: string,
  ): Promise<PermanentCustomerAgent> {
    const agentKey = `${companyId}_${customerPhone}`;

    // Check if agent is already in memory
    if (this.activeAgents.has(agentKey)) {
      this.logger.log(`Agent found in memory for ${customerPhone}`);
      return this.activeAgents.get(agentKey)!;
    }

    // Create or load agent from database
    this.logger.log(`Creating/loading agent for ${customerPhone}`);
    const agent = await PermanentCustomerAgent.create(
      this.prisma,
      this.mongo,
      this.openai,
      customerPhone,
      companyId,
    );

    // Store in memory for quick access
    this.activeAgents.set(agentKey, agent);

    return agent;
  }

  // Get all active agents for a company (for dashboard)
  async getAllAgentsForCompany(companyId: string): Promise<any[]> {
    const db = this.mongo.getDatabase();
    const agents = db.collection('agents');

    const agentDocs = await agents
      .find({ companyId })
      .sort({ 'lifecycle.lastInteraction': -1 })
      .limit(100)
      .toArray();

    return agentDocs.map((doc) => ({
      agentId: doc._id.toString(),
      customerPhone: doc.customerPhone,
      customerId: doc.customerId,
      stage: doc.lifecycle?.stage || 'LEAD',
      messageCount: doc.metadata?.messageCount || 0,
      lastInteraction: doc.lifecycle?.lastInteraction,
      status: doc.metadata?.status || 'active',
    }));
  }

  // Get agent statistics
  async getAgentStats(companyId: string): Promise<{
    totalAgents: number;
    activeToday: number;
    leads: number;
    customers: number;
    totalMessages: number;
  }> {
    const db = this.mongo.getDatabase();
    const agents = db.collection('agents');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, activeToday, leads, customers, messagesAgg] =
      await Promise.all([
        agents.countDocuments({ companyId }),
        agents.countDocuments({
          companyId,
          'lifecycle.lastInteraction': { $gte: today },
        }),
        agents.countDocuments({
          companyId,
          'lifecycle.stage': 'LEAD',
        }),
        agents.countDocuments({
          companyId,
          'lifecycle.stage': 'CUSTOMER',
        }),
        agents
          .aggregate([
            { $match: { companyId } },
            { $group: { _id: null, total: { $sum: '$metadata.messageCount' } } },
          ])
          .toArray(),
      ]);

    return {
      totalAgents: total,
      activeToday,
      leads,
      customers,
      totalMessages: messagesAgg[0]?.total || 0,
    };
  }

  // Clean up inactive agents from memory (optional optimization)
  cleanupInactiveAgents(): void {
    const now = Date.now();
    const INACTIVE_THRESHOLD = 30 * 60 * 1000; // 30 minutes

    for (const [key, agent] of this.activeAgents.entries()) {
      const status = agent.getStatus();
      const lastInteraction = new Date(status.lastInteraction).getTime();

      if (now - lastInteraction > INACTIVE_THRESHOLD) {
        this.activeAgents.delete(key);
        this.logger.log(`Cleaned up inactive agent: ${key}`);
      }
    }

    this.logger.log(
      `Active agents in memory: ${this.activeAgents.size}`,
    );
  }
}
