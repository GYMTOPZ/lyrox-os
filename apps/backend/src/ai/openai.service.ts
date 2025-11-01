import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

interface ConversationMessage {
  role: string;
  content: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stripeLink?: string;
}

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not found. AI features will not work.');
      return;
    }

    this.openai = new OpenAI({
      apiKey,
    });

    this.logger.log('OpenAI service initialized');
  }

  async generateResponse(
    customerMessage: string,
    brandPersonality: string,
    products: Product[],
    conversationHistory: ConversationMessage[],
  ): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI not configured. Please set OPENAI_API_KEY.');
    }

    try {
      // Build context for the AI
      const systemPrompt = this.buildSystemPrompt(brandPersonality, products);

      // Build messages array
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map((msg) => ({
          role: msg.role === 'customer' ? ('user' as const) : ('assistant' as const),
          content: msg.content,
        })),
        { role: 'user', content: customerMessage },
      ];

      // Call OpenAI
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.8,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content ||
        'Disculpa, no pude procesar tu mensaje. ¿Podrías repetirlo?';

      this.logger.log('AI response generated successfully');
      return response;
    } catch (error) {
      this.logger.error('Error generating AI response:', error);
      throw error;
    }
  }

  private buildSystemPrompt(brandPersonality: string, products: Product[]): string {
    const productsInfo = products
      .map(
        (p) =>
          `- ${p.name}: ${p.description} (Precio: $${p.price}${p.stripeLink ? `, Link: ${p.stripeLink}` : ''})`,
      )
      .join('\n');

    return `Eres un agente de ventas autónomo e inteligente que trabaja para este negocio.

PERSONALIDAD DE LA MARCA:
${brandPersonality}

PRODUCTOS/SERVICIOS DISPONIBLES:
${productsInfo}

TU MISIÓN:
Eres el empleado dedicado permanente de ESTE cliente específico. Tu trabajo es:
1. PRE-VENTA: Responder preguntas, enviar info, manejar objeciones, cerrar ventas
2. VENTA: Procesar pagos (enviar links de Stripe cuando el cliente quiera comprar)
3. ONBOARDING: Dar bienvenida y explicar cómo usar el producto/servicio
4. SOPORTE: Resolver dudas y problemas técnicos
5. SEGUIMIENTO: Preguntar cómo va, dar tips, mantener la relación
6. RETENCIÓN: Detectar cuando pierde interés y reactivar
7. UPSELL: Recomendar productos complementarios cuando sea apropiado

REGLAS IMPORTANTES:
- Mantén el tono y personalidad de la marca
- Sé natural, humano y conversacional
- NO uses emojis excesivos (máximo 1-2 por mensaje)
- Responde de forma concisa (2-4 líneas típicamente)
- Si el cliente quiere comprar, envía el link de pago de Stripe
- Recuerda TODO el contexto de conversaciones pasadas
- Construye una relación genuina a largo plazo
- Nunca inventes información que no tengas

Responde al siguiente mensaje del cliente:`;
  }

  async analyzeIntent(
    customerMessage: string,
    conversationHistory: ConversationMessage[],
  ): Promise<{
    intent: 'QUESTION' | 'PURCHASE' | 'SUPPORT' | 'CASUAL' | 'COMPLAINT';
    confidence: number;
    summary: string;
  }> {
    if (!this.openai) {
      throw new Error('OpenAI not configured');
    }

    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `Analiza el mensaje del cliente y determina su intención.

Responde SOLO con un JSON en este formato:
{
  "intent": "QUESTION" | "PURCHASE" | "SUPPORT" | "CASUAL" | "COMPLAINT",
  "confidence": 0.0-1.0,
  "summary": "breve resumen de qué quiere el cliente"
}`,
        },
        ...conversationHistory.slice(-5).map((msg) => ({
          role: msg.role === 'customer' ? ('user' as const) : ('assistant' as const),
          content: msg.content,
        })),
        { role: 'user', content: customerMessage },
      ];

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.3,
        max_tokens: 150,
      });

      const response = completion.choices[0]?.message?.content || '{}';
      return JSON.parse(response);
    } catch (error) {
      this.logger.error('Error analyzing intent:', error);
      return {
        intent: 'QUESTION',
        confidence: 0.5,
        summary: 'Could not analyze',
      };
    }
  }
}
