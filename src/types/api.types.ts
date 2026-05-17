export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  code?: string;
  timestamp?: string;
  path?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}
