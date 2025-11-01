import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { PrismaService } from '../common/prisma.service';
import { AgentFactoryService } from '../agents/agent-factory.service';

@Injectable()
export class WhatsAppService implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppService.name);
  private client: Client;
  private isReady = false;
  private qrCode: string | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly agentFactory: AgentFactoryService,
  ) {}

  async onModuleInit() {
    await this.initialize();
  }

  async initialize() {
    this.logger.log('Initializing WhatsApp client...');

    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'lyrox-os-client',
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      },
    });

    // QR Code event
    this.client.on('qr', (qr) => {
      this.logger.log('QR Code received. Scan with WhatsApp:');
      qrcode.generate(qr, { small: true });
      this.qrCode = qr;
    });

    // Ready event
    this.client.on('ready', () => {
      this.logger.log('WhatsApp client is ready!');
      this.isReady = true;
      this.qrCode = null;
    });

    // Authenticated event
    this.client.on('authenticated', () => {
      this.logger.log('WhatsApp client authenticated');
    });

    // Authentication failure event
    this.client.on('auth_failure', (msg) => {
      this.logger.error('WhatsApp authentication failed:', msg);
    });

    // Disconnected event
    this.client.on('disconnected', (reason) => {
      this.logger.warn('WhatsApp client disconnected:', reason);
      this.isReady = false;
    });

    // Message event - Handle incoming messages
    this.client.on('message', async (message: Message) => {
      await this.handleIncomingMessage(message);
    });

    // Initialize the client
    try {
      await this.client.initialize();
    } catch (error) {
      this.logger.error('Failed to initialize WhatsApp client:', error);
      throw error;
    }
  }

  private async handleIncomingMessage(message: Message) {
    try {
      // Ignore messages from self
      if (message.fromMe) {
        return;
      }

      // Ignore group messages (for now)
      const chat = await message.getChat();
      if (chat.isGroup) {
        return;
      }

      this.logger.log(`📨 Message received from ${message.from}: ${message.body}`);

      // Extract customer phone number
      const customerPhone = message.from.replace('@c.us', '');

      // Get company (for now, use first active company - Emilio Born)
      const company = await this.prisma.company.findFirst({
        where: { active: true },
      });

      if (!company) {
        this.logger.error('No active company found');
        return;
      }

      // Get contact name for metadata
      const contact = await message.getContact();
      const contactName = contact.pushname || contact.name || customerPhone;

      // 🤖 Get or create permanent agent for this customer
      const agent = await this.agentFactory.getOrCreateAgent(
        customerPhone,
        company.id,
      );

      this.logger.log(`🤖 Agent activated for ${customerPhone}`);

      // Agent handles everything (memory, AI, response)
      const aiResponse = await agent.handleMessage(message.body, {
        contactName,
      });

      // Send response via WhatsApp with human-like delay
      await this.simulateTyping(message, aiResponse);
      await message.reply(aiResponse);

      this.logger.log(`✅ Agent response sent to ${customerPhone}`);
    } catch (error) {
      this.logger.error('Error handling message:', error);

      // Send fallback message
      try {
        await message.reply(
          'Disculpa, estoy teniendo problemas técnicos. Por favor intenta de nuevo en un momento.',
        );
      } catch (replyError) {
        this.logger.error('Failed to send error message:', replyError);
      }
    }
  }

  // Simulate human-like typing delay
  private async simulateTyping(message: Message, response: string): Promise<void> {
    try {
      const chat = await message.getChat();

      // Calculate delay based on response length (simulate typing speed)
      const typingTime = Math.min(response.length * 50, 3000); // Max 3 seconds

      // Send typing indicator
      await chat.sendStateTyping();

      // Wait for typing simulation
      await new Promise(resolve => setTimeout(resolve, typingTime));

      // Clear typing indicator
      await chat.clearState();
    } catch (error: any) {
      // Ignore typing errors, not critical
      this.logger.debug('Could not simulate typing:', error?.message || 'Unknown error');
    }
  }

  // Public methods for API
  getStatus() {
    return {
      ready: this.isReady,
      hasQR: !!this.qrCode,
    };
  }

  getQRCode() {
    return this.qrCode;
  }

  async sendMessage(to: string, message: string) {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    const chatId = to.includes('@c.us') ? to : `${to}@c.us`;
    await this.client.sendMessage(chatId, message);
    this.logger.log(`Message sent to ${to}`);
  }

  async disconnect() {
    if (this.client) {
      await this.client.destroy();
      this.logger.log('WhatsApp client disconnected');
    }
  }
}
