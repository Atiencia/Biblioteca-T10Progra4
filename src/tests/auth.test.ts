vi.mock('../lib/mongo', () => ({ 
  connectToDatabase: vi.fn().mockResolvedValue({}) 
}));
vi.mock('../lib/models/user', () => ({ 
  User: { 
    findById: vi.fn().mockResolvedValue({ _id: '1', email: 'test@mail.com', name: 'Test' }) 
  } 
}));

import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

beforeAll(() => {
  process.env.JWT_SECRET = 'testsecret';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
});

const mockUser = { _id: '1', email: 'test@mail.com', name: 'Test' };

// --- AUTENTICACIÓN ---
describe('auth functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hashPassword y verifyPassword funcionan', async () => {
    const auth = await import('../lib/auth');
    const hash = await auth.hashPassword('1234');
    expect(await auth.verifyPassword('1234', hash)).toBe(true);
    expect(await auth.verifyPassword('wrong', hash)).toBe(false);
  });

  it('signToken y verifyToken funcionan', async () => {
    const auth = await import('../lib/auth');
    const token = auth.signToken({ userId: 'abc' });
    const payload = auth.verifyToken(token);
    expect(payload.userId).toBe('abc');
    expect(auth.verifyToken('invalid.token')).toBeNull();
  });

//   it('getUserFromRequestCookie retorna usuario si token válido', async () => {
//     // Reset modules y mocks específicos
//     vi.resetModules();

//     // Mock de auth functions
//     vi.doMock('../lib/auth', () => ({
//       getUserFromRequestCookie: vi.fn().mockResolvedValue(mockUser),
//     }));

//     // Mock de User.findById
//     vi.doMock('../lib/models/user', () => ({ 
//       User: { 
//         findById: vi.fn().mockResolvedValue(mockUser) 
//       } 
//     }));

//     // Mock de mongo
//     vi.doMock('../lib/mongo', () => ({ 
//       connectToDatabase: vi.fn().mockResolvedValue({}) 
//     }));

//     // Mock de cookies como Promise
//     vi.doMock('next/headers', () => ({
//       cookies: () => Promise.resolve({ get: () => ({ value: 'token' }) }),
//     }));

//     // Importar después de configurar todos los mocks
//   const auth = await import('../lib/auth');
//   vi.spyOn(auth, 'verifyToken').mockReturnValue({ userId: '1' });
//   const user = await auth.getUserFromRequestCookie();
//   expect(user).toEqual(mockUser);
//   });

//   it('getUserFromRequestCookie retorna null si token inválido', async () => {
//     vi.resetModules();
    
//     vi.doMock('../lib/auth', async (importOriginal) => {
//       const mod = await importOriginal();
//       return {
//         ...(mod as object),
//         verifyToken: vi.fn().mockReturnValue(null),
//       };
//     });

//     const auth = await import('../lib/auth');
//     const user = await auth.getUserFromRequestCookie();
//     expect(user).toBeNull();
//   });
// });

// --- MIDDLEWARE ---
describe('middleware de autorización', () => {
  function mockRequest(path: string, token: string | null) {
    return {
      nextUrl: { pathname: path },
      cookies: { get: () => (token ? { value: token } : undefined) },
      method: 'GET',
    } as unknown as NextRequest;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('permite acceso a rutas no protegidas', async () => {
    vi.resetModules();
    const { middleware } = await import('../../middleware');

    const req = mockRequest('/public', null);
    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it('deniega acceso a API sin token', async () => {
    vi.resetModules();
    const { middleware } = await import('../../middleware');

    const req = mockRequest('/api/favorite', null);
    const res = middleware(req);
    expect(res.status).toBe(401);
  });

  it('permite acceso a API con token válido', async () => {
    vi.resetModules();
    
    // Mock de auth functions antes de importar el middleware
    vi.doMock('../lib/auth', async (importOriginal) => {
      const mod = await importOriginal();
      return {
        ...(mod as object),
        verifyToken: vi.fn().mockReturnValue({ userId: '1' }),
        getUserFromRequestCookie: vi.fn().mockResolvedValue(mockUser),
      };
    });

    // Mock de User
    vi.doMock('../lib/models/user', () => ({ 
      User: { 
        findById: vi.fn().mockResolvedValue(mockUser) 
      } 
    }));

    const { middleware } = await import('../../middleware');

    const req = mockRequest('/api/favorite', 'valid-token');
    const res = middleware(req);
    expect(res.status).toBe(200);
  });
})})