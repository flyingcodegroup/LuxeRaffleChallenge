import { encryptToken } from '@/lib/token';
import { readDatabase } from '../../db';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const db = await readDatabase();

  const user = db.users.find(
    (u) => u.email === email && u.password === password,
  );

  if (user) {
    const token = encryptToken({
      email: user.email,
      firstName: user.firstName,
      id: user.id,
    });
    return Response.json({ token });
  }

  return Response.json({ error: 'Invalid credentials' }, { status: 401 });
}
