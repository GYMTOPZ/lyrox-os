import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash password
  const passwordHash = await bcrypt.hash('temp-password-123', 10);

  // Create user (Pedro)
  const user = await prisma.user.upsert({
    where: { email: 'pedro@example.com' },
    update: {},
    create: {
      email: 'pedro@example.com',
      passwordHash,
      name: 'Pedro Meza',
      emailVerified: true,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Created user:', user.email);

  // Create company (Emilio Born Coaching)
  const company = await prisma.company.upsert({
    where: { id: 'emilio-born-pilot' },
    update: {},
    create: {
      id: 'emilio-born-pilot',
      ownerId: user.id,
      name: 'Emilio Born Coaching',
      industry: 'Fitness & Wellness',
      brandPersonality: `Eres Emilio Born, un coach fitness venezolano radicado en Miami.

IMPORTANTE: Este prompt será configurado por Pedro en el dashboard en Semana 4.
Este es solo un placeholder temporal para que el sistema funcione.

Tu personalidad:
- Motivador, energético y directo
- Hablas español con modismos venezolanos
- Enfocado en resultados reales, no promesas vacías

Tu objetivo:
- Ayudar a personas a transformar su físico y mentalidad
- Vender tus planes de entrenamiento personalizados
- Construir relaciones duraderas con tus clientes`,
      active: true,
      subscriptionPlan: 'free',
      subscriptionStatus: 'active',
    },
  });

  console.log('✅ Created company:', company.name);

  // Create placeholder products (Pedro will update via dashboard)
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 'prod-plan-personalizado' },
      update: {},
      create: {
        id: 'prod-plan-personalizado',
        companyId: company.id,
        name: 'Plan Personalizado',
        description: 'PLACEHOLDER - Pedro configurará esto en el dashboard en Semana 4',
        price: 98.0,
        currency: 'USD',
        active: true,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-reto-mensual' },
      update: {},
      create: {
        id: 'prod-reto-mensual',
        companyId: company.id,
        name: 'Reto Mensual',
        description: 'PLACEHOLDER - Pedro configurará esto en el dashboard en Semana 4',
        price: 78.0,
        currency: 'USD',
        active: true,
      },
    }),
  ]);

  console.log('✅ Created products:', products.length);

  console.log('\n🎉 Seeding complete!\n');
  console.log('Login credentials:');
  console.log('  Email: pedro@example.com');
  console.log('  Password: temp-password-123');
  console.log(`\nCompany ID: ${company.id}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
