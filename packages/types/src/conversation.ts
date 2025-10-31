export interface Message {
  id: string;
  timestamp: Date;
  direction: 'incoming' | 'outgoing';
  sender: 'customer' | 'agent';
  content: string;
  aiMetadata?: {
    model: string;
    tokensUsed: number;
    responseTime: number;
    intent?: string;
    sentiment?: string;
    confidence?: number;
  };
}

export interface ConversationSummary {
  lastUpdated: Date;
  keyPoints: string[];
  recommendedAction: string;
  sentiment: string;
}

export interface Conversation {
  _id: string;
  companyId: string;
  customerId: string;
  customerPhone: string;
  customerName: string | null;
  messages: Message[];
  stage: string;
  lastInteraction: Date;
  messageCount: number;
  summary?: ConversationSummary;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessageDto {
  phone: string;
  message: string;
}
