# ADR-003: Modular Agent Architecture

**Date:** 2025-10-31
**Status:** ✅ Accepted
**Deciders:** Pedro Meza (PM/CEO), Claude Code (Tech Lead)
**Tags:** #architecture #agents #design-pattern

---

## Context

LYROX OS needs to handle multiple business functions autonomously:
- Customer acquisition (sales)
- Customer support
- Finance tracking
- Retention/upsells
- Analytics
- Marketing
- And more in the future...

We need an architecture that:
- Allows each function to operate independently
- Enables easy addition of new capabilities
- Supports different businesses needing different agents
- Maintains coordination between agents when needed
- Scales as complexity grows

---

## Decision

**We will use a modular agent architecture where:**

1. Each business function is an autonomous "Agent" module
2. Agents are independent but share a unified memory/context
3. A central "Orchestrator" coordinates agents when needed
4. Agents can be enabled/disabled per company
5. Each agent has access to AI engine but uses it differently

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│              ORCHESTRATOR                       │
│          (Central Coordinator)                  │
│                                                 │
│  • Routes events to agents                     │
│  • Maintains shared context                    │
│  • Coordinates multi-agent workflows           │
└─────────┬───────────────────────────────────────┘
          │
          ├─────────┬─────────┬─────────┬─────────┐
          │         │         │         │         │
          ▼         ▼         ▼         ▼         ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
    │Customer │ │ Finance │ │Retention│ │Analytics│
    │  Acq.   │ │ Tracking│ │  Agent  │ │  Agent  │
    │  Agent  │ │  Agent  │ │         │ │         │
    └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
         │           │           │           │
         └───────────┴───────────┴───────────┘
                     │
                     ▼
           ┌──────────────────┐
           │  UNIFIED MEMORY  │
           │   (Database)     │
           └──────────────────┘
```

---

## Agent Design Pattern

### Base Agent Interface

All agents implement this interface:

```typescript
interface Agent {
  // Identity
  readonly type: AgentType;
  readonly name: string;
  readonly description: string;

  // State
  isEnabled: boolean;
  isHealthy: boolean;

  // Core methods
  initialize(): Promise<void>;
  handle(event: BusinessEvent): Promise<AgentResponse>;
  shutdown(): Promise<void>;

  // Health
  healthCheck(): Promise<HealthStatus>;
}

enum AgentType {
  CUSTOMER_ACQUISITION = 'customer-acquisition',
  CUSTOMER_SUPPORT = 'customer-support',
  FINANCE_TRACKING = 'finance-tracking',
  RETENTION = 'retention',
  ANALYTICS = 'analytics',
  MARKETING = 'marketing-automation',
  INVENTORY = 'inventory-management',
  // ... extensible
}
```

### Example: Customer Acquisition Agent

```typescript
@Injectable()
export class CustomerAcquisitionAgent implements Agent {
  readonly type = AgentType.CUSTOMER_ACQUISITION;
  readonly name = 'Customer Acquisition Agent';
  readonly description = 'Converts leads into customers through AI-powered conversations';

  constructor(
    private aiEngine: AIEngine,
    private memory: UnifiedMemory,
    private integrations: IntegrationService
  ) {}

  async handle(event: BusinessEvent): Promise<AgentResponse> {
    if (event.type !== 'MESSAGE_RECEIVED') {
      return { handled: false };
    }

    // 1. Get customer context
    const customer = await this.memory.getCustomer(event.data.phone);
    const history = await this.memory.getConversationHistory(customer.id, 20);

    // 2. Generate AI response
    const aiResponse = await this.aiEngine.generate({
      agentType: this.type,
      customerContext: customer,
      conversationHistory: history,
      newMessage: event.data.message,
      availableProducts: await this.memory.getProducts()
    });

    // 3. Detect if sale was completed
    if (aiResponse.action === 'SALE_COMPLETED') {
      // Emit event for other agents
      await this.orchestrator.emit({
        type: 'SALE_COMPLETED',
        data: {
          customerId: customer.id,
          productId: aiResponse.productId,
          amount: aiResponse.amount
        }
      });
    }

    // 4. Send response
    await this.integrations.whatsapp.sendMessage(
      event.data.phone,
      aiResponse.message
    );

    // 5. Save to memory
    await this.memory.saveInteraction({
      customerId: customer.id,
      message: event.data.message,
      response: aiResponse.message,
      metadata: aiResponse.metadata
    });

    return { handled: true, result: aiResponse };
  }

  async healthCheck(): Promise<HealthStatus> {
    return {
      isHealthy: true,
      lastCheck: new Date(),
      details: {
        aiEngineResponsive: await this.aiEngine.ping(),
        databaseConnected: await this.memory.ping()
      }
    };
  }
}
```

---

## Orchestrator Design

The Orchestrator is the central coordinator:

```typescript
@Injectable()
export class Orchestrator {
  private agents: Map<AgentType, Agent> = new Map();
  private eventBus: EventEmitter = new EventEmitter();

  constructor(
    private customerAcqAgent: CustomerAcquisitionAgent,
    private financeAgent: FinanceTrackingAgent,
    private retentionAgent: RetentionAgent,
    // ... more agents
  ) {
    this.registerAgents();
  }

  private registerAgents() {
    this.agents.set(AgentType.CUSTOMER_ACQUISITION, this.customerAcqAgent);
    this.agents.set(AgentType.FINANCE_TRACKING, this.financeAgent);
    this.agents.set(AgentType.RETENTION, this.retentionAgent);
    // ... register all agents
  }

  async route(event: BusinessEvent): Promise<void> {
    // Determine which agents should handle this event
    const handlers = this.getHandlersForEvent(event);

    // Execute handlers (parallel or sequential based on dependencies)
    if (event.requiresSequential) {
      for (const agent of handlers) {
        await agent.handle(event);
      }
    } else {
      await Promise.all(
        handlers.map(agent => agent.handle(event))
      );
    }
  }

  private getHandlersForEvent(event: BusinessEvent): Agent[] {
    // Route logic based on event type
    switch (event.type) {
      case 'MESSAGE_RECEIVED':
        // Only Customer Acquisition Agent handles new messages
        return [this.agents.get(AgentType.CUSTOMER_ACQUISITION)];

      case 'SALE_COMPLETED':
        // Both Finance and Retention need to know
        return [
          this.agents.get(AgentType.FINANCE_TRACKING),
          this.agents.get(AgentType.RETENTION)
        ];

      case 'CUSTOMER_INACTIVE':
        // Only Retention Agent handles this
        return [this.agents.get(AgentType.RETENTION)];

      default:
        return [];
    }
  }

  // Enable/disable agents dynamically
  async enableAgent(type: AgentType): Promise<void> {
    const agent = this.agents.get(type);
    if (agent) {
      await agent.initialize();
      agent.isEnabled = true;
    }
  }

  async disableAgent(type: AgentType): Promise<void> {
    const agent = this.agents.get(type);
    if (agent) {
      await agent.shutdown();
      agent.isEnabled = false;
    }
  }

  // Health monitoring
  async healthCheckAll(): Promise<Record<AgentType, HealthStatus>> {
    const results = {};
    for (const [type, agent] of this.agents) {
      results[type] = await agent.healthCheck();
    }
    return results;
  }
}
```

---

## Event System

Agents communicate through events:

```typescript
interface BusinessEvent {
  id: string;
  type: EventType;
  timestamp: Date;
  companyId: string;
  data: Record<string, any>;
  requiresSequential?: boolean;
  priority?: 'low' | 'normal' | 'high';
}

enum EventType {
  // Customer Events
  MESSAGE_RECEIVED = 'message_received',
  CUSTOMER_CREATED = 'customer_created',
  CUSTOMER_INACTIVE = 'customer_inactive',

  // Sales Events
  SALE_COMPLETED = 'sale_completed',
  REFUND_REQUESTED = 'refund_requested',
  PAYMENT_FAILED = 'payment_failed',

  // System Events
  AGENT_STARTED = 'agent_started',
  AGENT_ERROR = 'agent_error',
  INTEGRATION_DISCONNECTED = 'integration_disconnected',

  // ... extensible
}
```

---

## Unified Memory

All agents share access to unified memory (database):

```typescript
@Injectable()
export class UnifiedMemory {
  constructor(
    private prisma: PrismaService,
    private mongo: MongoService
  ) {}

  // Customer data
  async getCustomer(phone: string): Promise<Customer>;
  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer>;

  // Conversations
  async getConversationHistory(customerId: string, limit: number): Promise<Message[]>;
  async saveInteraction(data: InteractionData): Promise<void>;

  // Products
  async getProducts(): Promise<Product[]>;
  async getProduct(id: string): Promise<Product>;

  // Sales
  async recordSale(sale: Sale): Promise<Sale>;
  async getSalesByCustomer(customerId: string): Promise<Sale[]>;

  // Analytics
  async getMetrics(timeframe: Timeframe): Promise<Metrics>;

  // Health
  async ping(): Promise<boolean>;
}
```

---

## Benefits of This Architecture

### 1. Modularity
- Each agent is independent module
- Easy to add new agents without touching existing ones
- Can update one agent without affecting others

### 2. Scalability
- Agents can run in separate processes/containers if needed
- Easy to scale specific agents (e.g., more Customer Acquisition instances)
- Can distribute across multiple servers

### 3. Flexibility
- Companies can enable only agents they need
- Different businesses can have different agent configurations
- Easy to A/B test different agent behaviors

### 4. Maintainability
- Clear separation of concerns
- Each agent has focused responsibility
- Easier to test (mock dependencies)
- Simpler to debug (isolate issues)

### 5. Extensibility
- New agents follow same pattern
- Third-party developers can create custom agents (future)
- Plugin system possible (Phase 2+)

---

## Agent Coordination Patterns

### Pattern 1: Independent Agents (Parallel)

**Example:** Message arrives from customer

```
MESSAGE_RECEIVED event
        │
        ├──→ Customer Acquisition Agent (handles immediately)
        └──→ Analytics Agent (logs for metrics)

Both handle in parallel, no dependencies
```

### Pattern 2: Sequential Chain

**Example:** Sale completed

```
SALE_COMPLETED event
        │
        ├──→ Finance Agent (records sale)
        │         │
        │         ├──→ Emits: PAYMENT_RECORDED
        │                 │
        └─────────────────┴──→ Retention Agent (schedules follow-up)

Sequential because Retention needs Finance to finish first
```

### Pattern 3: Conditional Routing

**Example:** Customer goes inactive

```
CUSTOMER_INACTIVE event
        │
        ├──→ If customer value > $1000:
        │         └──→ Retention Agent (high-priority win-back)
        │
        └──→ If customer value < $100:
                  └──→ Marketing Agent (re-engagement campaign)

Routing depends on customer data
```

---

## Phase 0 Agents

For pilot, we implement only:

1. **Customer Acquisition Agent** (Core)
   - Handles all incoming messages
   - Converts leads to customers
   - Most complex agent

2. **Finance Tracking Agent** (Simple)
   - Records sales automatically
   - Calculates metrics
   - No AI needed (rule-based)

3. **Health Monitor Agent** (System)
   - Monitors all systems
   - Alerts on issues
   - No AI needed

**Future Agents (Phase 1+):**
- Retention Agent
- Support Agent
- Marketing Agent
- Analytics Agent
- Inventory Agent

---

## Alternative Architectures Considered

### Alternative 1: Monolithic Service

**Approach:**
```
Single service handles everything:
- Message handling
- Finance tracking
- Retention
- All in one codebase
```

**Pros:**
- Simpler initially
- Less infrastructure

**Cons:**
- Hard to scale specific functions
- Tight coupling
- Difficult to test
- Hard to add features

**Verdict:** ❌ Rejected
- Won't scale to vision
- Doesn't support per-company agent selection

---

### Alternative 2: Microservices (Full)

**Approach:**
```
Each agent is completely separate service:
- Customer Service: service1.lyrox.com
- Finance Service: service2.lyrox.com
- Separate databases, APIs, deployments
```

**Pros:**
- Maximum isolation
- Independent scaling
- Can use different tech per service

**Cons:**
- Over-engineered for Phase 0
- Complex infrastructure
- Network latency between services
- Harder to develop locally

**Verdict:** ❌ Rejected for Phase 0, ✅ Possible for Phase 3+
- Too complex for MVP
- Modular monolith gives 80% of benefits
- Can evolve to microservices if needed

---

### Alternative 3: Plugin System (User-Defined Agents)

**Approach:**
```
Users can upload custom agent code:
- JavaScript functions
- Run in sandboxed environment
- Like Shopify apps or WordPress plugins
```

**Pros:**
- Ultimate flexibility
- Community can build agents
- Marketplace potential

**Cons:**
- Security nightmare
- Complex to build
- Not needed for Phase 0-1

**Verdict:** 🔮 Future consideration (Phase 3+)
- Great idea for mature product
- Too complex for now

---

## Implementation Guidelines

### Creating a New Agent

1. **Create agent module:**
```bash
nest generate module agents/[agent-name]
nest generate service agents/[agent-name]
```

2. **Implement Agent interface:**
```typescript
@Injectable()
export class NewAgent implements Agent {
  readonly type = AgentType.NEW_AGENT;
  // ... implement all methods
}
```

3. **Register in Orchestrator:**
```typescript
constructor(
  // ...
  private newAgent: NewAgent
) {
  this.agents.set(AgentType.NEW_AGENT, this.newAgent);
}
```

4. **Add event routing logic:**
```typescript
case 'NEW_EVENT_TYPE':
  return [this.agents.get(AgentType.NEW_AGENT)];
```

5. **Write tests:**
```typescript
describe('NewAgent', () => {
  it('should handle event correctly', async () => {
    // ...
  });
});
```

---

## Testing Strategy

### Unit Tests (Per Agent)

Test each agent in isolation:
```typescript
describe('CustomerAcquisitionAgent', () => {
  let agent: CustomerAcquisitionAgent;
  let mockAI: jest.Mocked<AIEngine>;
  let mockMemory: jest.Mocked<UnifiedMemory>;

  beforeEach(() => {
    mockAI = createMockAI();
    mockMemory = createMockMemory();
    agent = new CustomerAcquisitionAgent(mockAI, mockMemory);
  });

  it('should respond to customer message', async () => {
    const event = createMessageEvent();
    const response = await agent.handle(event);
    expect(response.handled).toBe(true);
  });
});
```

### Integration Tests (Agent Coordination)

Test multiple agents working together:
```typescript
describe('Sale Flow', () => {
  it('should coordinate Finance and Retention agents', async () => {
    // Customer makes purchase
    await orchestrator.route(createSaleEvent());

    // Verify Finance recorded it
    expect(financeAgent.recordedSales).toHaveLength(1);

    // Verify Retention scheduled follow-up
    expect(retentionAgent.scheduledFollowups).toHaveLength(1);
  });
});
```

---

## Performance Considerations

### Agent Execution

- **Parallel by default:** If agents don't depend on each other
- **Queue system:** For high-volume events (Bull + Redis)
- **Timeout handling:** Each agent has max execution time
- **Retry logic:** Failed agents retry with exponential backoff

### Resource Management

```typescript
class AgentManager {
  private readonly MAX_CONCURRENT_AGENTS = 10;
  private readonly AGENT_TIMEOUT_MS = 30000;

  async executeAgent(agent: Agent, event: BusinessEvent): Promise<AgentResponse> {
    return Promise.race([
      agent.handle(event),
      this.timeout(this.AGENT_TIMEOUT_MS)
    ]);
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Agent timeout')), ms)
    );
  }
}
```

---

## Monitoring & Observability

Each agent reports metrics:

```typescript
interface AgentMetrics {
  agentType: AgentType;
  eventsHandled: number;
  averageResponseTime: number;
  errorRate: number;
  lastHealthCheck: Date;
  isHealthy: boolean;
}
```

Dashboard shows:
- Which agents are active
- Performance per agent
- Error rates
- Health status

---

## Conclusion

**Modular agent architecture is the right choice because:**

1. ✅ Matches our mental model (each agent = one business function)
2. ✅ Supports different businesses needing different agents
3. ✅ Scales well (can separate agents later if needed)
4. ✅ Easy to extend (new agents follow same pattern)
5. ✅ Testable and maintainable

**Key principle:** Modular monolith now, microservices if/when needed.

---

**Status:** Accepted and implemented
**Last Updated:** 2025-10-31
**Next Review:** After Phase 0 (evaluate if pattern worked well)
