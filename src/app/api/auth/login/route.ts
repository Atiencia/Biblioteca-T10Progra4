import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import { User } from '@/lib/models/user';
import { verifyPassword, signToken } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({ email: z.email(), password: z.string() });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });

  await connectToDatabase();
  const user = await User.findOne({ email: parsed.data.email });
  if (!user) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });

  const token = signToken({ userId: user._id });
  const res = NextResponse.json({ id: user._id, email: user.email, name: user.name });
  res.cookies.set({ name: 'token', value: token, httpOnly: true, path: '/', sameSite: 'lax' });

  return res;
}
