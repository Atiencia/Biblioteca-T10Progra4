

import { describe, it, expect, vi } from 'vitest';
import { Vote } from '../lib/models/vote';
import { Types } from 'mongoose';
vi.mock('../lib/mongo', () => ({ connectToDatabase: vi.fn() }));

describe('Vote model', () => {
  it('debería tener los campos requeridos', () => {
    const userId = new Types.ObjectId();
    const reviewId = new Types.ObjectId();
    const vote = new Vote({
      userId,
      reviewId,
      delta: 1,
    });
    expect(vote.userId.toString()).toBe(userId.toString());
    expect(vote.reviewId.toString()).toBe(reviewId.toString());
    expect([1, -1]).toContain(vote.delta);
    expect(vote.createdAt).toBeInstanceOf(Date);
  });
});
