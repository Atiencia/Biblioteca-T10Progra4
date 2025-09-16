import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import * as reviews from '../lib/reviews';
vi.mock('../lib/models/review', () => ({
  Review: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    deleteOne: vi.fn(),
  },
}));
vi.mock('../lib/models/vote', () => ({
  Vote: {
    findOne: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    deleteMany: vi.fn(),
  },
}));
vi.mock('../lib/mongo', () => ({ connectToDatabase: vi.fn() }));

describe('editReview y deleteReview', () => {
  let Review: Record<string, Mock>;
  let Vote: Record<string, Mock>;
  beforeEach(async () => {
    vi.clearAllMocks();
    // Importar los mocks después de que Vitest los haya inicializado
  Review = (await import('../lib/models/review')).Review as unknown as Record<string, Mock>;
  Vote = (await import('../lib/models/vote')).Vote as unknown as Record<string, Mock>;
  });

  it('editReview edita texto y rating', async () => {
    const mockReview = { _id: 'r1', userId: 'u1', text: 'old', rating: 2, save: vi.fn().mockResolvedValue(true), toObject: () => ({ text: 'nuevo', rating: 5 }) };
    Review.findById.mockResolvedValueOnce(mockReview);
    const result = await reviews.editReview('r1', 'u1', { text: 'nuevo', rating: 5 });
    expect(mockReview.text).toBe('nuevo');
    expect(mockReview.rating).toBe(5);
    expect(result.text).toBe('nuevo');
    expect(result.rating).toBe(5);
  });

  it('editReview lanza error si no es el autor', async () => {
    const mockReview = { _id: 'r1', userId: 'otro', text: 'old', rating: 2, save: vi.fn(), toObject: () => ({}) };
    Review.findById.mockResolvedValueOnce(mockReview);
    await expect(reviews.editReview('r1', 'u1', { text: 'nuevo' })).rejects.toThrow('No es tu reseña');
  });

  it('deleteReview elimina review y votos', async () => {
    const mockReview = { _id: 'r1', userId: 'u1' };
    Review.findById.mockResolvedValueOnce(mockReview);
    Vote.deleteMany.mockResolvedValueOnce({});
    Review.deleteOne.mockResolvedValueOnce({});
    const result = await reviews.deleteReview('r1', 'u1');
    expect(result).toBe(true);
    expect(Vote.deleteMany).toHaveBeenCalledWith({ reviewId: mockReview._id });
    expect(Review.deleteOne).toHaveBeenCalledWith({ _id: mockReview._id });
  });
});
