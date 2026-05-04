import { readDatabase, writeDatabase } from '@/app/(please-ignore)/api/db';
import { decryptToken } from '@/lib/token';
import { randomUUID } from 'crypto';

export async function GET(req: Request) {
  const token = req.headers.get('Authorization');

  const user = token && decryptToken(token.replace('Bearer ', ''));

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  await new Promise((resolve, reject) => {
    const delay = Math.random() * 3000 + 500;
    if (Math.random() < 0.1) {
      setTimeout(() => reject(new Error('Request timeout')), delay);
    } else {
      setTimeout(resolve, delay);
    }
  });

  const db = await readDatabase();

  const orders = db.userOrders[user.id].map((oderId) => db.orders[oderId]);

  return Response.json(orders);
}

export async function POST(req: Request) {
  const { items } = await req.json();
  const token = req.headers.get('Authorization');

  const user = token && decryptToken(token.replace('Bearer ', ''));

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const db = await readDatabase();

  for (const item of items) {
    const car = db.raffles.find((r) => r.id === item.id);

    if (!car || car.availableTickets < item.quantity) {
      return new Response('Not enough tickets available', { status: 400 });
    }
  }

  for (const item of items) {
    const car = db.raffles.find((r) => r.id === item.id);
    if (car) {
      car.availableTickets -= item.quantity;
    }
  }

  const orderId = randomUUID();

  db.orders[orderId] = { id: orderId, items };
  if (!db.userOrders[user.id]) {
    db.userOrders[user.id] = [];
  }
  db.userOrders[user.id].push(orderId);

  await writeDatabase(db);

  return Response.json({
    orderId,
  });
}
