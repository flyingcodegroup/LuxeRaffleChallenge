import { readDatabase } from '@/app/(please-ignore)/api/db';

export async function GET() {
  await new Promise((resolve, reject) => {
    const delay = Math.random() * 4000 + 1000;
    if (Math.random() < 0.1) {
      setTimeout(() => reject(new Error('Request timeout')), delay);
    } else {
      setTimeout(resolve, delay);
    }
  });

  const db = await readDatabase();

  return Response.json(db.raffles);
}
