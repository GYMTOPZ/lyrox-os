# Broadcast Messages Feature

**Feature:** Enviar mensajes masivos a clientes
**Use Case:** Emilio quiere escribir a todos sus leads/customers desde el dashboard
**Priority:** Week 3-4 (Dashboard phase)
**Status:** Planned

---

## 📋 Feature Description

Permitir al dueño del negocio (Emilio) enviar mensajes broadcast a grupos de clientes desde el dashboard de LYROX OS.

### Casos de uso reales:

1. **Promoción flash:**
   - "¡Descuento 20% solo hoy en Plan Personalizado!"
   - Enviar a: Todos los leads calificados

2. **Recordatorio de seguimiento:**
   - "Hola! Hace 3 días hablamos de transformar tu físico. ¿Tienes dudas?"
   - Enviar a: Leads que no respondieron en 48h

3. **Anuncio de nuevo servicio:**
   - "¡Nuevo! Reto de 30 días para perder grasa. Link: ..."
   - Enviar a: Todos los customers activos

4. **Re-engagement:**
   - "Te extrañamos! Vuelve con 15% descuento"
   - Enviar a: Customers que no interactúan hace 30+ días

---

## 🎯 User Stories

### Como dueño de negocio (Emilio):

**Story 1: Enviar mensaje a un grupo**
```
DADO que estoy en el dashboard
CUANDO selecciono "Broadcast" en el menú
Y selecciono filtro "Leads calificados"
Y escribo mi mensaje "¡Oferta especial hoy!"
Y click "Enviar a 45 personas"
ENTONCES el sistema envía el mensaje uno por uno vía WhatsApp
Y me muestra progreso "15/45 enviados..."
Y me notifica cuando termina
```

**Story 2: Programar mensaje futuro**
```
DADO que tengo un mensaje escrito
CUANDO selecciono "Programar para después"
Y elijo fecha/hora "Mañana 10am"
ENTONCES el sistema guarda el mensaje
Y lo envía automáticamente a la hora programada
Y me notifica cuando se envió
```

**Story 3: Ver resultados del broadcast**
```
DADO que envié un broadcast hace 2 horas
CUANDO voy a "Historial de Broadcasts"
ENTONCES veo:
- 45 mensajes enviados
- 12 personas vieron (check azul)
- 5 personas respondieron
- Lista de quién respondió qué
```

---

## 🎨 UI Design (Dashboard)

### Página: Broadcasts

```
┌─────────────────────────────────────────────────────────┐
│ 📢 Broadcast Messages                    [+ Nuevo]      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 1. Selecciona audiencia                          │  │
│  │                                                   │  │
│  │  ○ Todos los clientes (156 personas)            │  │
│  │  ● Leads calificados (45 personas)              │  │
│  │  ○ Customers activos (78 personas)              │  │
│  │  ○ Clientes inactivos 30+ días (12 personas)   │  │
│  │  ○ Custom filter...                             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 2. Escribe tu mensaje                            │  │
│  │                                                   │  │
│  │  [                                              ] │  │
│  │  [ ¡Hola! Hoy tengo una oferta especial...    ] │  │
│  │  [                                              ] │  │
│  │  [                                              ] │  │
│  │                                                   │  │
│  │  💡 Tip: Personaliza con {nombre}, {producto}   │  │
│  │  📊 Preview: "¡Hola Pedro! Hoy tengo una..."    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 3. Programar (opcional)                          │  │
│  │                                                   │  │
│  │  ○ Enviar ahora                                  │  │
│  │  ● Programar para:  [Mañana 10:00 AM]  📅       │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  [Cancelar]              [Enviar a 45 personas] ─────►  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Modal: Enviando...

```
┌─────────────────────────────────────┐
│  📤 Enviando broadcast...           │
│                                     │
│  ████████████░░░░░░  67% (30/45)   │
│                                     │
│  ⏱️ Tiempo estimado: 2 minutos     │
│                                     │
│  💡 No cierres esta ventana         │
└─────────────────────────────────────┘
```

### Historial de Broadcasts

```
┌─────────────────────────────────────────────────────────┐
│ 📊 Historial de Broadcasts                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📅 Hoy - 10:30 AM                                      │
│  "¡Oferta especial hoy! 20% desc..."                   │
│  ✅ Enviado a: 45 personas                              │
│  👁️ Visto por: 12 personas (27%)                       │
│  💬 Respondieron: 5 personas (11%)                      │
│  [Ver detalles] [Ver respuestas]                       │
│                                                          │
│  ─────────────────────────────────────────────────      │
│                                                          │
│  📅 Ayer - 3:00 PM                                      │
│  "Recordatorio: Reto de 30 días empieza..."            │
│  ✅ Enviado a: 78 personas                              │
│  👁️ Visto por: 45 personas (58%)                       │
│  💬 Respondieron: 15 personas (19%)                     │
│  [Ver detalles] [Ver respuestas]                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### Database Schema

```prisma
model Broadcast {
  id          String   @id @default(uuid())
  companyId   String   @map("company_id")

  // Content
  message     String   @db.Text

  // Targeting
  targetFilter Json    // { stage: "qualified", tags: ["interested"] }
  targetCount Int      // 45 personas

  // Scheduling
  status      BroadcastStatus @default(DRAFT)
  scheduledFor DateTime?
  sentAt      DateTime?

  // Metrics
  sentCount   Int      @default(0)
  seenCount   Int      @default(0)
  replyCount  Int      @default(0)

  // Relations
  company     Company  @relation(fields: [companyId], references: [id])
  messages    BroadcastMessage[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum BroadcastStatus {
  DRAFT
  SCHEDULED
  SENDING
  SENT
  FAILED
}

model BroadcastMessage {
  id           String   @id @default(uuid())
  broadcastId  String
  customerId   String

  // Status tracking
  sent         Boolean  @default(false)
  sentAt       DateTime?
  seen         Boolean  @default(false)
  seenAt       DateTime?
  replied      Boolean  @default(false)
  repliedAt    DateTime?

  // Error handling
  error        String?

  broadcast    Broadcast @relation(fields: [broadcastId], references: [id])
  customer     Customer  @relation(fields: [customerId], references: [id])
}
```

### API Endpoints

```typescript
// Create broadcast
POST /api/broadcasts
{
  "message": "¡Hola {nombre}! Oferta especial...",
  "targetFilter": {
    "stage": "qualified",
    "tags": ["interested"]
  },
  "scheduledFor": "2025-11-02T10:00:00Z" // optional
}

// Get broadcast status
GET /api/broadcasts/:id/status
Response: {
  "status": "sending",
  "progress": {
    "total": 45,
    "sent": 30,
    "seen": 12,
    "replied": 5
  }
}

// List broadcasts
GET /api/broadcasts
Response: [
  {
    "id": "...",
    "message": "¡Oferta especial...",
    "sentCount": 45,
    "seenCount": 12,
    "replyCount": 5,
    "sentAt": "2025-11-01T10:30:00Z"
  }
]

// Get broadcast responses
GET /api/broadcasts/:id/responses
Response: [
  {
    "customer": { "name": "Pedro García", "phone": "+1..." },
    "response": "Me interesa! Cuándo empiezo?",
    "repliedAt": "2025-11-01T10:45:00Z"
  }
]
```

### Background Job (Bull Queue)

```typescript
// Job: Send broadcast
interface BroadcastJob {
  broadcastId: string;
  customerId: string;
  message: string;
}

// Queue configuration
const broadcastQueue = new Queue('broadcast', {
  redis: redisConnection,
  limiter: {
    max: 10, // Max 10 messages per second (WhatsApp limits)
    duration: 1000
  }
});

// Worker
broadcastQueue.process(async (job) => {
  const { broadcastId, customerId, message } = job.data;

  try {
    // Send via WhatsApp
    await whatsappService.sendMessage(customer.phone, message);

    // Update sent status
    await prisma.broadcastMessage.update({
      where: { id: job.data.messageId },
      data: { sent: true, sentAt: new Date() }
    });

  } catch (error) {
    // Log error
    await prisma.broadcastMessage.update({
      where: { id: job.data.messageId },
      data: { error: error.message }
    });
  }
});
```

### Service Layer

```typescript
class BroadcastService {
  async createBroadcast(data: CreateBroadcastDto) {
    // 1. Get target customers based on filter
    const customers = await this.getTargetCustomers(data.targetFilter);

    // 2. Create broadcast record
    const broadcast = await prisma.broadcast.create({
      data: {
        companyId: data.companyId,
        message: data.message,
        targetFilter: data.targetFilter,
        targetCount: customers.length,
        status: data.scheduledFor ? 'SCHEDULED' : 'SENDING',
        scheduledFor: data.scheduledFor,
      }
    });

    // 3. Create individual message records
    const messages = await prisma.broadcastMessage.createMany({
      data: customers.map(customer => ({
        broadcastId: broadcast.id,
        customerId: customer.id,
      }))
    });

    // 4. Queue messages for sending
    if (!data.scheduledFor) {
      await this.queueMessages(broadcast.id, customers);
    }

    return broadcast;
  }

  private async getTargetCustomers(filter: any) {
    return await prisma.customer.findMany({
      where: {
        companyId: filter.companyId,
        stage: filter.stage,
        tags: { hasSome: filter.tags },
        active: true,
      }
    });
  }

  private async queueMessages(broadcastId: string, customers: Customer[]) {
    for (const customer of customers) {
      await broadcastQueue.add({
        broadcastId,
        customerId: customer.id,
        message: this.personalizeMessage(message, customer),
      });
    }
  }

  private personalizeMessage(template: string, customer: Customer) {
    return template
      .replace('{nombre}', customer.name || 'amigo')
      .replace('{phone}', customer.phone);
  }
}
```

---

## ⚠️ Important Considerations

### WhatsApp Limits

**whatsapp-web.js (current):**
- Rate limit: ~10 messages/second
- Risk of ban if too many messages
- Need delays between messages
- Best for: <100 messages at once

**WhatsApp Business API (future):**
- Rate limit: 1000 messages/second
- Official, no ban risk
- Template messages required
- Best for: >1000 messages
- Cost: $0.005-0.01 per message

### Legal & Compliance

**Required:**
- ✅ Opt-in consent from customers
- ✅ Include opt-out option in broadcasts
- ✅ Respect business hours (no sends at 3am)
- ✅ Track who opted out

**Implementation:**
```typescript
// Add opt-out tracking
model Customer {
  // ...
  broadcastOptOut Boolean @default(false)
  optOutAt        DateTime?
}

// Filter out opted-out customers
const customers = await prisma.customer.findMany({
  where: {
    broadcastOptOut: false, // ← Important!
    // ... other filters
  }
});
```

### Message Template Example

```
Hola {nombre}! 👋

Tengo una oferta especial solo para hoy:
20% descuento en Plan Personalizado 💪

Link de pago: {paymentLink}

¿Te interesa? Responde SI y te explico más.

---
Para no recibir más ofertas, responde STOP
```

---

## 📅 Implementation Timeline

### Week 3 (Dashboard Read-Only)
- ❌ NO implementar todavía
- Focus: Ver conversaciones existentes

### Week 4 (Dashboard Configuration)
- ✅ **IMPLEMENTAR BROADCAST FEATURE**
- UI para crear broadcasts
- Selección de audiencia
- Preview del mensaje
- Envío básico (sin scheduling)

### Phase 1 (Multi-tenant launch)
- Add scheduling
- Add templates
- Add analytics dashboard
- Add A/B testing

---

## 🎯 Success Metrics

**Para Emilio:**
- Send broadcast a 45 leads en <5 minutos
- Ver quién respondió en tiempo real
- Conversion rate de broadcast: >10%

**Técnicos:**
- Delivery rate: >95%
- No WhatsApp bans
- Max 1 message/second (safe rate)

---

## 💡 Future Enhancements

**Phase 2+:**
1. Message templates library
2. Personalization variables ({nombre}, {producto}, {ultimaCompra})
3. Drip campaigns (serie de mensajes automáticos)
4. A/B testing (probar 2 versiones del mensaje)
5. Smart timing (enviar cuando cliente suele responder)
6. Rich media (imágenes, videos, PDFs en broadcast)

---

**Feature Status:** Planned for Week 4
**Priority:** High (core feature para Emilio)
**Technical Complexity:** Medium
**Implementation Time:** 2-3 días
