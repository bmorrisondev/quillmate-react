export interface User {
  id: number;
  name: string | null;
  email: string;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  summary?: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface Message {
  id: number;
  content: string;
  role: string;
  context?: string | null;
  createdAt: string;
  articleId: number;
}
