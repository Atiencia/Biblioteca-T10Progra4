export type GoogleBook = {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string; };
    description?: string;
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    publisher?: string;
    industryIdentifiers?: { type: string; identifier: string; }[];
  };
};

export type Review = {
  _id?: string;
  id?: string;
  bookId: string;
  userId?: string;
  userName: string;
  rating: number;
  text: string;
  likes: number;
  dislikes: number;
  createdAt: string;
};
