import { Raffle } from '@/types/Raffle';
import { Order } from '@/types/Order';
import { User } from '@/types/User';
import fs from 'fs/promises';
import path from 'path';

const dbFilePath = path.join(process.cwd(), 'data', 'db.json');

type Database = {
  raffles: Raffle[];
  orders: Record<string, Order>;
  userOrders: Record<string, string[]>;
  users: Array<User & { password: string }>;
};

export async function readDatabase() {
  const data = await fs.readFile(dbFilePath, 'utf8');
  return JSON.parse(data) as Database;
}

export async function writeDatabase(data: Database) {
  await fs.writeFile(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
}
