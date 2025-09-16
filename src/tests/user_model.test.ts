import { describe, it, expect, vi } from 'vitest';
import { User } from '../lib/models/user';
vi.mock('../lib/mongo', () => ({ connectToDatabase: vi.fn() }));

describe('User model', () => {
  it('debería tener los campos requeridos', () => {
    const user = new User({
      email: 'test@mail.com',
      name: 'Test',
      passwordHash: 'hash',
    });
    expect(user.email).toBe('test@mail.com');
    expect(user.name).toBe('Test');
    expect(user.passwordHash).toBe('hash');
    expect(user.createdAt).toBeInstanceOf(Date);
  });
});
