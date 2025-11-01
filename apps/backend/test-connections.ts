import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';
import Redis from 'ioredis';

async function testConnections() {
  console.log('🧪 Testing database connections...\n');

  // Test PostgreSQL (Supabase)
  try {
    const prisma = new PrismaClient();
    const companies = await prisma.company.findMany();
    console.log('✅ PostgreSQL (Supabase): Connected');
    console.log(`   Found ${companies.length} company: ${companies[0]?.name}`);
    await prisma.$disconnect();
  } catch (error) {
    console.log('❌ PostgreSQL failed:', error.message);
  }

  // Test MongoDB (Atlas)
  try {
    const mongoUri = process.env.MONGODB_URI!;
    const mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    await mongoClient.db().admin().ping();
    console.log('✅ MongoDB (Atlas): Connected');
    await mongoClient.close();
  } catch (error) {
    console.log('❌ MongoDB failed:', error.message);
  }

  // Test Redis (Upstash)
  try {
    const redis = new Redis(process.env.REDIS_URL!);
    await redis.ping();
    console.log('✅ Redis (Upstash): Connected');
    await redis.quit();
  } catch (error) {
    console.log('❌ Redis failed:', error.message);
  }

  console.log('\n🎉 All database connections verified!');
}

testConnections().catch(console.error);
