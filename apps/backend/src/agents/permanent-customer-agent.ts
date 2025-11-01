import { Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { MongoService } from '../common/mongo.service';
import { OpenAIService } from '../ai/openai.service';
import { ObjectId } from 'mongodb';

interface AgentMemory {
  customerId: string;
  customerPhone: string;
  companyId: string;
  messages: Array<{
    id: string;
    role: 'customer' | 'agent';
    content: string;
    timestamp: Date;
  }>;
  lifecycle: {
    stage: 'LEAD' | 'CUSTOMER' | 'ACTIVE_USER' | 'CHURNED';
    firstContact: Date;
    purchaseDate?: Date;
    lastInteraction: Date;
  };
  insights: {
    interests: string[];
    objections: string[];
    personalityNotes: string[];
    purchaseHistory: Array<{
      productId: string;
      productName: string;
      amount: number;
      date: Date;
    }>;
  };
  metadata: {
    messageCount: number;
    status: 'active' | 'waiting' | 'dormant';
  };
}

export class PermanentCustomerAgent {
  private readonly logger = new Logger(PermanentCustomerAgent.name);
  private memory: AgentMemory;
  private agentId: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mongo: MongoService,
    private readonly openai: OpenAIService,
    agentId: string,
  ) {
    this.agentId = agentId;
  }

  // Initialize or load existing agent
  static async create(
    prisma: PrismaService,
    mongo: MongoService,
    openai: OpenAIService,
    customerPhone: string,
    companyId: string,
  ): Promise<PermanentCustomerAgent> {
    const db = mongo.getDatabase();
    const agents = db.collection('agents');

    // Check if agent already exists
    let agentDoc = await agents.findOne({
      customerPhone,
      companyId,
    });

    if (!agentDoc) {
      // Create new permanent agent
      const newAgent = {
        customerPhone,
        companyId,
        customerId: null, // Will be set when customer is created
        messages: [],
        lifecycle: {
          stage: 'LEAD',
          firstContact: new Date(),
          lastInteraction: new Date(),
        },
        insights: {
          interests: [],
          objections: [],
          personalityNotes: [],
          purchaseHistory: [],
        },
        metadata: {
          messageCount: 0,
          status: 'active',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await agents.insertOne(newAgent);
      agentDoc = { _id: result.insertedId, ...newAgent };

      Logger.log(`🤖 New permanent agent created for ${customerPhone}`);
    }

    const agent = new PermanentCustomerAgent(
      prisma,
      mongo,
      openai,
      agentDoc._id.toString(),
    );
    agent.memory = agentDoc as any;

    return agent;
  }

  // Main handler for incoming messages
  async handleMessage(
    message: string,
    messageMetadata?: any,
  ): Promise<string> {
    try {
      this.logger.log(
        `Agent ${this.agentId} handling message: ${message.substring(0, 50)}...`,
      );

      // 1. Load full context
      await this.loadMemory();

      // 2. Ensure customer exists in PostgreSQL
      const customer = await this.ensureCustomerExists(messageMetadata);

      // 3. Save customer message to memory
      await this.saveMessage('customer', message);

      // 4. Get company info and products
      const company = await this.prisma.company.findUnique({
        where: { id: this.memory.companyId },
        include: { products: true },
      });

      if (!company) {
        throw new Error('Company not found');
      }

      // 5. Prepare conversation history for AI
      const conversationHistory = this.memory.messages
        .slice(-20) // Last 20 messages
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      // 6. Generate AI response
      const products = company.products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        price: parseFloat(p.price.toString()),
        stripeLink: p.paymentLink || undefined,
      }));

      const aiResponse = await this.openai.generateResponse(
        message,
        company.brandPersonality,
        products,
        conversationHistory,
      );

      // 7. Save AI response to memory
      await this.saveMessage('agent', aiResponse);

      // 8. Update lifecycle stage if needed
      await this.updateLifecycleStage(message, aiResponse);

      this.logger.log(`Agent ${this.agentId} generated response`);
      return aiResponse;
    } catch (error) {
      this.logger.error(`Error in agent ${this.agentId}:`, error);
      throw error;
    }
  }

  // Load agent memory from MongoDB
  private async loadMemory(): Promise<void> {
    const db = this.mongo.getDatabase();
    const agents = db.collection('agents');

    const agentDoc = await agents.findOne({
      _id: new ObjectId(this.agentId),
    });

    if (agentDoc) {
      this.memory = agentDoc as any;
    }
  }

  // Save message to agent's memory
  private async saveMessage(
    role: 'customer' | 'agent',
    content: string,
  ): Promise<void> {
    const db = this.mongo.getDatabase();
    const agents = db.collection('agents');

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date(),
    };

    await agents.updateOne(
      { _id: new ObjectId(this.agentId) },
      {
        $push: { messages: message } as any,
        $set: {
          'lifecycle.lastInteraction': new Date(),
          'metadata.status': 'active',
          updatedAt: new Date(),
        },
        $inc: { 'metadata.messageCount': 1 },
      },
    );

    // Update in-memory copy
    if (!this.memory.messages) {
      this.memory.messages = [];
    }
    this.memory.messages.push(message);
    this.memory.metadata.messageCount++;
  }

  // Ensure customer exists in PostgreSQL
  private async ensureCustomerExists(messageMetadata?: any): Promise<any> {
    // Check if customer already linked to agent
    if (this.memory.customerId) {
      return await this.prisma.customer.findUnique({
        where: { id: this.memory.customerId },
      });
    }

    // Check if customer exists by phone
    let customer = await this.prisma.customer.findFirst({
      where: {
        companyId: this.memory.companyId,
        phone: this.memory.customerPhone,
      },
    });

    // Create if doesn't exist
    if (!customer) {
      const name =
        messageMetadata?.contactName ||
        this.memory.customerPhone.substring(0, 10);

      customer = await this.prisma.customer.create({
        data: {
          companyId: this.memory.companyId,
          name,
          phone: this.memory.customerPhone,
          stage: 'LEAD',
        },
      });

      this.logger.log(`New customer created: ${customer.name}`);
    }

    // Link customer to agent
    const db = this.mongo.getDatabase();
    await db.collection('agents').updateOne(
      { _id: new ObjectId(this.agentId) },
      { $set: { customerId: customer.id } },
    );

    this.memory.customerId = customer.id;

    return customer;
  }

  // Update lifecycle stage based on conversation
  private async updateLifecycleStage(
    customerMessage: string,
    agentResponse: string,
  ): Promise<void> {
    // Detect purchase intent
    const purchaseKeywords = [
      'comprar',
      'pagar',
      'quiero',
      'me interesa',
      'cómo pago',
    ];
    const hasPurchaseIntent = purchaseKeywords.some((keyword) =>
      customerMessage.toLowerCase().includes(keyword),
    );

    if (
      hasPurchaseIntent &&
      agentResponse.toLowerCase().includes('stripe')
    ) {
      const db = this.mongo.getDatabase();
      await db.collection('agents').updateOne(
        { _id: new ObjectId(this.agentId) },
        {
          $set: {
            'lifecycle.stage': 'CUSTOMER',
            'lifecycle.purchaseDate': new Date(),
          },
        },
      );

      // Also update in PostgreSQL
      if (this.memory.customerId) {
        await this.prisma.customer.update({
          where: { id: this.memory.customerId },
          data: { stage: 'CUSTOMER' },
        });
      }
    }
  }

  // Get agent status (for dashboard)
  getStatus(): any {
    return {
      agentId: this.agentId,
      customerPhone: this.memory.customerPhone,
      customerId: this.memory.customerId,
      stage: this.memory.lifecycle.stage,
      messageCount: this.memory.metadata.messageCount,
      lastInteraction: this.memory.lifecycle.lastInteraction,
      status: this.memory.metadata.status,
    };
  }

  // Proactive messaging (for future implementation)
  async sendProactiveMessage(message: string): Promise<void> {
    await this.saveMessage('agent', message);
    // TODO: Integrate with WhatsApp sending
    this.logger.log(`Proactive message queued: ${message}`);
  }
}
