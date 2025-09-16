
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as favorites from '../lib/favorites';
import { Types } from 'mongoose';
vi.mock('../lib/models/favorite', () => ({
  Favorite: {
    findOneAndUpdate: vi.fn(),
    deleteOne: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
  },
}));
vi.mock('../lib/mongo', () => ({ connectToDatabase: vi.fn() }));

describe('favorites lib', () => {
  let Favorite: any;
  const validUserId = '507f1f77bcf86cd799439011'; // 24-char hex string
  beforeEach(async () => {
    vi.clearAllMocks();
    Favorite = (await import('../lib/models/favorite')).Favorite;
  });

  it('addFavorite agrega o actualiza favorito', async () => {
    const mockFav = { _id: 'f1', userId: new Types.ObjectId(validUserId), bookId: 'b1', bookTitle: 'Libro', createdAt: new Date() };
    Favorite.findOneAndUpdate.mockResolvedValueOnce(mockFav);
    const result = await favorites.addFavorite(validUserId, 'b1', 'Libro');
    expect(result).toBe(mockFav);
    expect(Favorite.findOneAndUpdate).toHaveBeenCalled();
  });

  it('removeFavorite elimina favorito', async () => {
    Favorite.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });
    const result = await favorites.removeFavorite(validUserId, 'b1');
    expect(result.deletedCount).toBe(1);
    expect(Favorite.deleteOne).toHaveBeenCalled();
  });

  it('isFavorite retorna true si existe', async () => {
    Favorite.findOne.mockResolvedValueOnce({});
    const result = await favorites.isFavorite(validUserId, 'b1');
    expect(result).toBe(true);
  });

  it('isFavorite retorna false si no existe', async () => {
    Favorite.findOne.mockResolvedValueOnce(null);
    const result = await favorites.isFavorite(validUserId, 'b1');
    expect(result).toBe(false);
  });

  it('getFavoritesByUser retorna lista de favoritos', async () => {
    const mockList = [{ bookId: 'b1' }, { bookId: 'b2' }];
    Favorite.find.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce(mockList)
    });
    const result = await favorites.getFavoritesByUser(validUserId);
    expect(result).toBe(mockList);
  });
});
