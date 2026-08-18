import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

async function testGuestCheckoutPersistence() {
  console.log('--- Testing Guest Checkout Shipping Address Persistence ---');

  const guestShippingData = {
    name: 'Marek Wiśniewski',
    email: 'marek.wisniewski@example.com',
    phone: '+48 501 234 567',
    street: 'ul. Nowy Świat 15/4',
    postalCode: '00-496',
    city: 'Warszawa',
    country: 'PL',
  };

  const orderNumber = `LUNAR-GUEST-${Date.now().toString().slice(-4)}`;

  // 1. Simulate guest checkout order creation
  const guestOrder = await prisma.order.create({
    data: {
      orderNumber,
      userId: null, // GUEST CHECKOUT - NO USER ID
      customerName: guestShippingData.name,
      customerEmail: guestShippingData.email,
      shippingPhone: guestShippingData.phone,
      shippingStreet: guestShippingData.street,
      shippingPostalCode: guestShippingData.postalCode,
      shippingCity: guestShippingData.city,
      shippingCountry: guestShippingData.country,
      orderNotes: 'Winda w klatce B, kod do domofonu 15#',
      subtotal: 218.90,
      discountCode: 'LUNAR15',
      discountAmount: 32.84,
      shippingFee: 0,
      total: 186.06,
      status: 'Paid',
      paymentStatus: 'paid',
      paymentMethod: 'stripe',
      stripeSessionId: `cs_test_guest_${Date.now()}`,
      stripePaymentIntentId: `pi_test_guest_${Date.now()}`,
      items: {
        create: [
          {
            name: "265. Butterfly Kiss - Women's Perfume - 33ml",
            price: 29.90,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800',
          },
          {
            name: 'Celestial Solitaire Ring',
            price: 189.00,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800',
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });

  console.log('✅ Guest Order Saved in PostgreSQL:');
  console.log({
    orderId: guestOrder.id,
    orderNumber: guestOrder.orderNumber,
    isGuest: guestOrder.userId === null,
    recipient: guestOrder.customerName,
    email: guestOrder.customerEmail,
    phone: guestOrder.shippingPhone,
    fullShippingAddress: `${guestOrder.shippingStreet}, ${guestOrder.shippingPostalCode} ${guestOrder.shippingCity}, ${guestOrder.shippingCountry}`,
    notes: guestOrder.orderNotes,
    itemsOrdered: guestOrder.items.map(i => `${i.quantity}x ${i.name} (${i.price}€)`),
    totalPaid: `${guestOrder.total}€`,
    status: guestOrder.status,
  });

  // 2. Fetch the order from the database to ensure it can be retrieved for fulfillment/shipping
  const retrievedOrder = await prisma.order.findUnique({
    where: { id: guestOrder.id },
    include: { items: true },
  });

  if (!retrievedOrder) {
    throw new Error('Could not retrieve guest order from database');
  }

  console.log('\n📦 Verifying Shipping Label Data from Database:');
  console.log(`[ETYKIETA WYSYŁKOWA / SHIPPING LABEL]`);
  console.log(`Odbiorca: ${retrievedOrder.customerName}`);
  console.log(`Adres:    ${retrievedOrder.shippingStreet}`);
  console.log(`Miasto:   ${retrievedOrder.shippingPostalCode} ${retrievedOrder.shippingCity}`);
  console.log(`Kraj:     ${retrievedOrder.shippingCountry}`);
  console.log(`Telefon:  ${retrievedOrder.shippingPhone}`);
  console.log(`Email:    ${retrievedOrder.customerEmail}`);
  console.log(`Produkty do spakowania:`);
  retrievedOrder.items.forEach((item, idx) => {
    console.log(`  ${idx + 1}. ${item.name} | Ilość: ${item.quantity} szt. | Cena: ${item.price}€`);
  });

  // Clean up
  await prisma.orderItem.deleteMany({ where: { orderId: guestOrder.id } });
  await prisma.order.delete({ where: { id: guestOrder.id } });
  console.log('\n🧹 Test guest order cleaned up.');

  await prisma.$disconnect();
  await pool.end();
  console.log('🎉 Guest checkout verification completed with 100% success!');
}

testGuestCheckoutPersistence().catch(console.error);
