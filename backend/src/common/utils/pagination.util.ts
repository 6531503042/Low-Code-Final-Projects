export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: string;
  search?: string;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function buildPaginationFilter(options: PaginationOptions): {
  filter: Record<string, any>;
  sort: Record<string, 1 | -1>;
  skip: number;
  limit: number;
} {
  const { page = 1, limit = 20, sort = 'createdAt:-1', search } = options;
  
  // Build filter
  const filter: Record<string, any> = {};
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  
  // Build sort
  const sortObj: Record<string, 1 | -1> = {};
  if (sort) {
    const [field, direction] = sort.split(':');
    sortObj[field] = direction === 'asc' ? 1 : -1;
  }
  
  // Calculate pagination
  const skip = Math.max(0, (page - 1) * limit);
  const safeLimit = Math.min(100, Math.max(1, limit));
  
  return {
    filter,
    sort: sortObj,
    skip,
    limit: safeLimit,
  };
}

export function buildPaginationResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginationResult<T> {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
