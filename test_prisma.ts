import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

async function fullTest() {
  console.log('--- Testing Database Full Flow ---');

  // 1. Check Products and Categories
  const products = await prisma.product.findMany({ take: 3 });
  console.log(`✅ Loaded ${products.length} sample products:`, products.map(p => ({ name: p.name, price: p.price })));

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { children: true }
  });
  console.log(`✅ Loaded ${categories.length} top-level categories with subcategories`);

  // 2. Test Order Creation with Checkout Form Data
  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: `TEST-ORD-${Date.now().toString().slice(-4)}`,
      customerName: 'Anna Kowalska',
      customerEmail: 'anna.kowalska@example.com',
      shippingPhone: '+48 600 100 200',
      shippingStreet: 'ul. Marszałkowska 10/12',
      shippingCity: 'Warszawa',
      shippingPostalCode: '00-001',
      shippingCountry: 'PL',
      orderNotes: 'Proszę zostawić u portiera',
      subtotal: 218.90,
      discountCode: 'WELCOME10',
      discountAmount: 21.89,
      shippingFee: 0,
      total: 197.01,
      status: 'Processing',
      paymentStatus: 'paid',
      paymentMethod: 'stripe',
      stripeSessionId: `cs_test_${Date.now()}`,
      items: {
        create: [
          {
            name: '250. Pink Desire - Women\'s Perfume - 33ml',
            price: 29.90,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800',
          },
          {
            name: 'Celestial Solitaire Ring',
            price: 189.00,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800',
          }
        ]
      }
    },
    include: {
      items: true
    }
  });

  console.log('✅ Created Order with Checkout Form Data:');
  console.log({
    id: sampleOrder.id,
    orderNumber: sampleOrder.orderNumber,
    customer: `${sampleOrder.customerName} (${sampleOrder.customerEmail}, ${sampleOrder.shippingPhone})`,
    address: `${sampleOrder.shippingStreet}, ${sampleOrder.shippingPostalCode} ${sampleOrder.shippingCity}, ${sampleOrder.shippingCountry}`,
    notes: sampleOrder.orderNotes,
    financials: {
      subtotal: sampleOrder.subtotal,
      discount: `${sampleOrder.discountCode} (-${sampleOrder.discountAmount}€)`,
      shipping: `${sampleOrder.shippingFee}€`,
      total: `${sampleOrder.total}€`
    },
    itemCount: sampleOrder.items.length,
  });

  // 3. Clean up test order
  await prisma.orderItem.deleteMany({ where: { orderId: sampleOrder.id } });
  await prisma.order.delete({ where: { id: sampleOrder.id } });
  console.log('🧹 Cleaned up test order.');

  await prisma.$disconnect();
  await pool.end();
  console.log('✨ All database tests passed successfully!');
}

fullTest().catch(console.error);
