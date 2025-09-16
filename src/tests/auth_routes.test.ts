vi.mock('next/headers', () => ({
  cookies: () => ({ 
    get: () => ({ value: 'token' }),
    set: vi.fn(),
    delete: vi.fn()
  }),
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as RegisterRoute } from '../app/api/auth/register/route';
import { POST as LoginRoute } from '../app/api/auth/login/route';
import { POST as LogoutRoute } from '../app/api/auth/logout/route';

// Mocks de tus módulos locales
vi.mock('bcrypt', () => {
  const actual = {
    hash: vi.fn().mockResolvedValue('hashed_password'),
   compare: vi.fn().mockImplementation(async (password, hash) => {
    return password === '123456';
    }),
  };
  return {
    ...actual,
    default: actual, 
  };
});

vi.mock('@/lib/models/user', () => ({
  User: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@/lib/mongo', () => ({ 
  connectToDatabase: vi.fn().mockResolvedValue({ 
    db: vi.fn() 
  }) 
}));

// Mock para jwt si lo usas
vi.mock('jsonwebtoken', () => {
  const actual = {
    sign: vi.fn().mockReturnValue('mock_token'),
  };
  return {
    ...actual,
    default: actual,
  };
});

import { User } from '@/lib/models/user';

describe('auth routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('register crea usuario si no existe', async () => {
    // Mock: usuario no existe
    (User.findOne as any).mockResolvedValueOnce(null);
    // Mock: creación exitosa (incluye passwordHash)

    (User.create as any).mockResolvedValueOnce({ 
      _id: 'u1', 
      email: 'test@mail.com',
      name: 'Test',
      passwordHash: 'hashed_password'
    });

    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ 
        email: 'test@mail.com', 
        password: '123456', // >= 6 caracteres
        name: 'Test' 
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await RegisterRoute(req as any);
    expect(res.status).toBe(201);
  });

  it('register rechaza si usuario ya existe', async () => {
    // Mock: usuario ya existe
    (User.findOne as any).mockResolvedValueOnce({ 
      _id: 'u1', 
      email: 'test@mail.com' 
    });

    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ 
        email: 'test@mail.com', 
        password: '123456', // >= 6 caracteres
        name: 'Test' 
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await RegisterRoute(req as any);
    expect(res.status).toBe(409);
  });

  it('login permite acceso con credenciales válidas', async () => {
    // Mock: usuario encontrado con contraseña hasheada
    (User.findOne as any).mockResolvedValueOnce({
      _id: 'u1',
      email: 'test@mail.com',
      passwordHash: 'hashed_password',
      name: 'Test'
    });

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ 
        email: 'test@mail.com', 
        password: '123456' 
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await LoginRoute(req as any);
    expect(res.status).toBe(200);
  });

  it('login rechaza credenciales inválidas - usuario no existe', async () => {
    // Mock: usuario no encontrado
    (User.findOne as any).mockResolvedValueOnce(null);

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ 
        email: 'nonexistent@mail.com', 
        password: '123456' // >= 6 caracteres
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await LoginRoute(req as any);
    expect(res.status).toBe(401);
  });

  it('login rechaza credenciales inválidas - contraseña incorrecta', async () => {
    // Mock: usuario encontrado
    (User.findOne as any).mockResolvedValueOnce({
      _id: 'u1',
      email: 'test@mail.com',
      passwordHash: 'hashed_password_1234',
      name: 'Test'
    });

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ 
        email: 'test@mail.com', 
        password: 'wrong_password' // Contraseña incorrecta, >= 6 caracteres
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await LoginRoute(req as any);
    expect(res.status).toBe(401);
  });

  it('logout responde correctamente', async () => {
    const req = new Request('http://localhost/api/auth/logout', { 
      method: 'POST' 
    });
    const res = await LogoutRoute(req as any);
    expect([200, 204, 303]).toContain(res.status);
  });
});