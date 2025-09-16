import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import { User } from '@/lib/models/user';
import { hashPassword, signToken } from '@/lib/auth';
import { z } from 'zod';

const bodySchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  await connectToDatabase();
  const existing = await User.findOne({ email: parsed.data.email });
  if (existing) return NextResponse.json({ error: 'Usuario ya existe' }, { status: 409 });

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await User.create({ email: parsed.data.email, name: parsed.data.name, passwordHash });
  const token = signToken({ userId: user._id });

  const res = NextResponse.json({ id: user._id, email: user.email, name: user.name }, { status: 201 });
  // cookie httpOnly
  res.cookies.set({
    name: 'token',
    value: token,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    //secure: true // en prod
  });
  return res;
}
