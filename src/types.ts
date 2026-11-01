export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  createdAt?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImage?: string;
  tags: string[];
  status: 'draft' | 'published';
  readingTime: number;
  authorId: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
  };
  likes?: string[];
  comments?: Comment[];
  bookmarks?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface TagInfo {
  name: string;
  slug: string;
  count: number;
}
