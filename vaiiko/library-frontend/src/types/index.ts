export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: 'visitor' | 'reader' | 'librarian' | 'admin';
}

export interface Category {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  isbn: string | null;
  available_copies: number;
  total_copies: number;
  is_available: boolean;
  cover_url: string | null;
  has_pdf: boolean;
  average_rating: number;
  ratings_count: number;
  categories?: Category[];
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: number;
  user_id: string;
  book_id: number;
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  reserved_at: string;
  due_date: string | null;
  handled_by: string | null;
  book?: Book;
  user?: User;
  handler?: User;
  created_at: string;
  updated_at: string;
}

export interface Rating {
  id: number;
  book_id: number;
  user_id: string;
  rating: number;
  review: string | null;
  user?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}